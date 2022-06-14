const { parse } = require('node-html-parser');
const request = require('request');

const { messages } = require('./responses');
const utility = require('../utility/utility');

const postMessageNew = (Wilma2SID, studentID, receiverType, receiver, subject, content) => {
    const receiverTypes = {
        'personnel': 'r_personnel',
        'teacher': 'r_teacher'
    }
    
    return new Promise((resolve, reject) => {
        const form = {
            'formkey': studentID,
            'wysiwyg': 'ckeditor',
            'Subject': subject,
            'BodyText': content,
            'addsavebtn': 'Lähetä viesti',
        }

        // Set the receiver
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
            if (error) return reject({ error: 'Failed to post message', message: response, status: 501 });

            // Validate response
            messages.validateMessagePost(response)
            .then(() => {
                return resolve({status: response.statusCode});
            })
            .catch(err => {
                return reject(err)
            });
        });
    })
}

const sendMessage = (Wilma2SID, receiverType, receiver, subject, content) => {
    return new Promise((resolve, reject) => {
        
        utility.requests.getStudentID(Wilma2SID).then(studentID => {

            postMessageNew(Wilma2SID, studentID, receiverType, receiver, subject, content).then(status => {
                return resolve(status);
            })
            .catch(err => {
                return reject(err);
            })

        })
        .catch(err => {
            return reject(err);
        });
    });
}

const getMessageInbox = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/list`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, async function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve inbox', message: response, status: 501 });

            // Validate response
            messages.validateMessageGet(response)
                .then(() => {
                    const json = JSON.parse(response.body);
                    return resolve(json);
                })
                .catch(err => {
                    return reject(err);
                });

        });
    });
}

const getMessageOutBox = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/list/outbox`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve inbox', message: response, status: 501 });

            // Validate response
            messages.validateMessageGet(response)
                .then(() => {
                    const json = JSON.parse(response.body);
                    return resolve(json);
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

const getMessageByID = (Wilma2SID, id) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/messages/${id}?printable`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve inbox', message: response, status: 501 });

            // Validate response
            messages.validateMessageGetByID(response)
                .then(() => {
                    try {
                        const content = parseMessageContent(response.body);
                        return resolve(content);
                    } catch(err) {
                        console.log(err);
                        return reject({err: 'Failed to parse message content', message: err, status: 500}) 
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

const parseMessageContent = (raw) => {
    const document = parse(raw);
    const filter = ['head', 'h1', 'th', 'td', 'tr','div']
    const title = document.getElementsByTagName('h1')[0].textContent;

    const receivers = document.getElementsByTagName('td')[0].textContent;
    const senders = document.getElementsByTagName('td')[1].textContent;
    const dateTime = document.getElementsByTagName('td')[2].textContent;
    const answers = document.getElementsByTagName('td')[3] ? document.getElementsByTagName('td')[3].textContent : null;

    const content = {receivers: receivers, senders: senders, dateTime: dateTime, answers: answers, html: []}

    document
    .getElementsByTagName('html')[0]
    .childNodes
    .filter(c => c.rawTagName && !filter.includes(c.rawTagName))
    .filter(c => c.textContent.trim())
    .forEach(c => {
        if(c.childNodes.length > 1) {
            content.html.push({tage: c.rawTagName, content: c.childNodes.filter(c => c.textContent.trim()).map(c => {return {tag: c.rawTagName, content: c.textContent.trim()} })});
        }
        else {
            content.html.push({tag: c.rawTagName, content: c.textContent})
        }
    })

    return content;
}

module.exports = {
    sendMessage,
    getMessageInbox,
    getMessageOutBox,
    getMessageByID
}