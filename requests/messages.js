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
            'url': `https://espoo.inschool.fi/messages/${id}?format=json`,
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
                        const content = JSON.parse(response.body);
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

module.exports = {
    sendMessage,
    getMessageInbox,
    getMessageOutBox,
    getMessageByID
}