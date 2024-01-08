const { parse } = require('node-html-parser');
const request = require('request');
const { MultipartNetworkRequest } = require('express-runtime-dependency');

const { messages } = require('./responses');

const announcements = require('../static/announcements/OtaniemenLukio.json');

const sendMessage = (Wilma2SID, studentID, receiverType, receiver, subject, content) => {
    const receiverTypes = {
        'personnel': 'r_personnel',
        'teacher': 'r_teacher'
    }

    return new Promise((resolve, reject) => {
        const req = new MultipartNetworkRequest().init();
        const form = {
            'formkey': studentID,
            'wysiwyg': 'ckeditor',
            'Subject': subject,
            'BodyText': content,
            'addsavebtn': 'Lähetä viesti',
        }

        form[receiverTypes[receiverType]] = receiver;

        const options = {
            'method': 'POST',
            'url': 'https://espoo.inschool.fi/messages/compose',
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            'followAllRedirects': true,
            form: form
        };

        request(options, async function (error, response) {
            if (error) {
                req.onRequestError(404);
                return reject({ error: 'Failed to post message', status: 501 });
            }

            // Validate response
            messages.validateMessagePost(response, req)
                .then(() => {
                    req.requestFinished();
                    return resolve({ status: response.statusCode });
                })
                .catch(err => {
                    req.onRequestError(500, err);
                    return reject(err)
                });
        });
    })
}

const respondToMessage = (Wilma2SID, studentID, receiverType, receiver, subject, content) => {
    return new Promise((resolve, reject) => {

        postMessageNew(Wilma2SID, studentID, receiverType, receiver, subject, content)
            .then(status => {
                return resolve(status);
            })
            .catch(err => {
                return reject(err);
            })

    });
}

const deleteMessage = (Wilma2SID, studentID, content) => {

    return new Promise((resolve, reject) => {
        const form = {
            'formkey': studentID,
            'wysiwyg': 'ckeditor',
            'quickbtn': 'Lähetä viesti',
            'bodytext': content,
        }

        const options = {
            'method': 'POST',
            'url': 'https://espoo.inschool.fi/messages/collatedreply/${}',
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            'followAllRedirects': false,
            form: form
        };

        request(options, async function (error, response) {
            if (error) return reject({ error: 'Failed to post message', status: 501 });

            // Validate response
            messages.validateMessagePost(response)
                .then(() => {
                    return resolve({ status: response.statusCode });
                })
                .catch(err => {
                    return reject(err)
                });
        });
    })
}

const getReceiverList = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        const req = new MultipartNetworkRequest().init();
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/recipients?select_recipients&format=json`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, async function (error, response) {
            if (error) {
                req.onRequestError(404);
                return reject({ error: 'Failed to retrieve the list containing receivers', status: 501 });
            }

            // Validate response
            messages.validateMessageGet(response, req)
                .then(() => {
                    try {
                        const json = JSON.parse(response.body);
                        const parsed = parseReceiverList(json);
                        req.onRequestFinished();
                        return resolve(parsed);
                    } catch (err) {
                        console.log(err);
                        req.onRequestError(500, err);
                        return reject({ err: 'Failed to parse list of recipients', status: 500 })
                    }
                })
                .catch(err => {
                    return reject(err);
                });

        });
    })
}

const getMessageInbox = (auth, limit) => {
    return new Promise((resolve, reject) => {
        const req = new MultipartNetworkRequest().init();
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/list`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, async function (error, response) {
            if (error) {
                req.onRequestError(404);
                return reject({ error: 'Failed to retrieve inbox', status: 501 });
            }

            // Validate response
            messages.validateMessageGet(response, req)
                .then(() => {
                    try {
                        const json = JSON.parse(response.body);
                        const parsed = parseMessageList(json.Messages, limit);
                        req.onRequestFinished();
                        return resolve(parsed);
                    } catch (err) {
                        console.log(err);
                        req.onRequestError(500, err);
                        return reject({ err: 'Failed to parse message-inbox', status: 500 })
                    }
                })
                .catch(err => {
                    return reject(err);
                });

        });
    });
}

const getNewMessages = (auth, limit) => {
    return new Promise((resolve, reject) => {
        const req = new MultipartNetworkRequest().init();
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/list`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, async function (error, response) {
            if (error) {
                req.onRequestError(404);
                return reject({ error: 'Failed to retrieve new messages', status: 501 });
            }

            // Validate response
            messages.validateMessageGet(response, req)
                .then(() => {
                    try {
                        const json = JSON.parse(response.body);
                        const parsed = parseNewMessages(json.Messages, limit);
                        req.onRequestFinished();
                        return resolve(parsed);
                    } catch (err) {
                        console.log(err);
                        req.onRequestError(500, err);
                        return reject({ err: 'Failed to parse message-inbox', status: 500 })
                    }
                })
                .catch(err => {
                    return reject(err);
                });

        });
    });
}

const getMessageOutbox = (auth, limit) => {
    return new Promise((resolve, reject) => {
        const req = new MultipartNetworkRequest().init();
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/list/outbox`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, function (error, response) {
            if (error) {
                req.onRequestError(404);
                return reject({ error: 'Failed to retrieve inbox', status: 501 });
            }

            // Validate response
            messages.validateMessageGet(response, req)
                .then(() => {
                    try {
                        const json = JSON.parse(response.body);
                        const parsed = parseMessageList(json.Messages, limit);
                        req.onRequestFinished();
                        return resolve(parsed);
                    } catch (err) {
                        console.log(err);
                        req.onRequestError(500, err);
                        return reject({ err: 'Failed to parse message-outbox', status: 500 })
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

const getAppointments = (auth, limit) => {
    return new Promise((resolve, reject) => {
        const req = new MultipartNetworkRequest().init();
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/list/appointments`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, function (error, response) {
            if (error) {
                req.onRequestError(404);
                return reject({ error: 'Failed to retrieve inbox', status: 501 });
            }

            // Validate response
            messages.validateMessageGet(response, req)
                .then(() => {
                    try {
                        const json = JSON.parse(response.body);
                        const parsed = parseAppointmentList(json.Messages, limit);
                        req.onRequestFinished();
                        return resolve(parsed);
                    } catch (err) {
                        req.onRequestError(500, err);
                        return reject({ err: 'Failed to parse appointments-list', status: 500 })
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

const getAnnouncements = (limit) => {
    return new Promise((resolve, reject) => {
        return resolve(announcements.list.slice(limit));
    });
}

const getMessageByID = (auth, id) => {
    return new Promise((resolve, reject) => {
        const req = new MultipartNetworkRequest().init();

        if (Object.keys(announcements.messages).includes(id)) return resolve([announcements.messages[id]]);
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/${id}?format=json`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, function (error, response) {
            if (error) {
                req.onRequestError(404);
                return reject({ error: 'Failed to retrieve inbox', status: 501 });
            }

            messages.validateMessageGetByID(response, req)
                .then(() => {
                    try {
                        const content = JSON.parse(response.body);
                        const parsed = parseMessageContent(content.messages);
                        req.onRequestFinished();
                        return resolve(parsed);

                    } catch (err) {
                        console.log(err);
                        req.onRequestError(500, err);
                        return reject({ err: 'Failed to parse message content', message: err, status: 500 })
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

const parseReceiverList = (raw) => {
    return raw.IndexRecords.map(school => {
        return {
            name: school.Caption,
            teachers: school.TeacherRecords.map(teacher => {
                return {
                    id: teacher.Id,
                    name: teacher.Caption,
                    schools: teacher.SchoolIDs,
                }
            }),
            personnels: school.PersonnelRecords.map(personnel => {
                return {
                    id: personnel.Id,
                    name: personnel.Caption,
                    schools: personnel.SchoolIDs,
                }
            })
        }
    })
}

const parseMessageList = (raw, limit) => {
    if(!raw) return [];
    
    return raw.map(message => {
        return {
            isEvent: false,
            id: message.Id,
            recipients: message.Recipient ? message.Recipient : 'Piilotettu',
            subject: message.Subject,
            timeStamp: message.TimeStamp,
            replies: message.Replies,
            new: message.Status == 1,
            senders: message.Senders ? message.Senders.map(sender => {
                return {
                    name: sender.Name,
                    href: sender.Href
                }
            }) : []
        }
    }).slice(0, limit)
}

const parseNewMessages = (raw, limit) => {
    if(!raw) return [];

    return parseMessageList(raw.filter(message => message.Status == 1), limit);
}

const parseAppointmentList = (raw, limit) => {
    return raw.map(appointment => {
        return {
            isEvent: true,
            id: appointment.Id,
            subject: appointment.Subject,
            timeStamp: appointment.TimeStamp,
            replies: appointment.Replies,
            senders: appointment.Senders.map(sender => {
                return {
                    name: sender.Name,
                    href: sender.Href
                }
            }),
            status: appointment.Applying.Status,
        }
    }).slice(0, limit)
}


const parseMessageContent = (raw) => {
    return raw.map(message => {
        return {
            fromWilma: true,
            id: message.Id,
            subject: message.Subject,
            timeStamp: message.TimeStamp,
            recipients: message.Recipient ? message.Recipient : 'Piilotettu',
            sender: message.Sender,
            content: message.ContentHtml,
            replies: message.ReplyList ? message.ReplyList.map(reply => {
                return {
                    id: reply.Id,
                    content: reply.ContentHtml,
                    timeStamp: reply.TimeStamp,
                    sender: reply.Sender
                }
            }) : []
        }
    })
}

module.exports = {
    getReceiverList,
    sendMessage,
    getMessageInbox,
    getNewMessages,
    getMessageOutbox,
    getAppointments,
    getAnnouncements,
    getMessageByID
}