const request = require('request');
const utility = require('../utility/utility');

const { account } = require('../requests/responses');

const GenerateSessiondDetails = () => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': 'https://espoo.inschool.fi/login/',
        };

        request(options, function (error, response) {
            if (error) return reject({ error: 'Error occured while trying to retrieve details from https://espoo.inschool.fi/login/', message: response, status: 501 });

            if (response.statusCode == 200) {
                utility.cookies.parseCookie(response.headers['set-cookie'][0])
                    .then(session => {
                        return resolve(session);
                    })
                    .catch(err => {
                        return reject({ error: 'Wilma sent an invalid cookie', message: err, status: 501 });
                    });
            }
            else {
                return reject({ error: "Couldn't generate session details", message: response, status: 404 });
            }
        });
    });
}


const Login = (login = { Username: String, Password: String, SessionID: String, Wilma2LoginID: String }) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'POST',
            'url': 'https://espoo.inschool.fi/login',
            'headers': {
                'Cookie': login.Wilma2LoginID,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'Login': login.Username,
                'Password': login.Password,
                'Submit': 'Kirjaudu+sisään',
                'SESSIONID': login.SessionID,
            }
        };

        request(options, async function (error, response) {
            if (error) return reject({ error: 'Error occured while trying to reach https://espoo.inschool.fi/login/', message: response.statusCode, status: 501 });
            if (response.statusCode == 303) {
                utility.cookies.parseCookie(response.headers['set-cookie'][1])
                    .then(session => {
                        return resolve(session);
                    })
                    .catch(err => {
                        return reject(err);
                    });
            }
            else {
                return reject({ error: 'Wilma responded with an unknown status.', message: response, status: 501 });
            }

        });
    });
}

const generateStudentID = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': 'https://espoo.inschool.fi/schedule',
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`
            },
            'followRedirect': false
        }


        request(options, function (error, response) {
            if (error) return reject({ error: 'Error occured while trying to retrieve details from https://espoo.inschool.fi/schedule', message: response.statusCode, status: 501 });

            account.validateAccountGetStudentID(response)
                .then(studentID => {
                    return resolve(studentID);
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

const StartSession = async (login = { Username: String, Password: String, Current: String }) => {
    return new Promise(async (resolve, reject) => {
        GenerateSessiondDetails().then(details => {
            Login({
                Username: login.Username,
                Password: login.Password,
                SessionID: details.value[0],
                Wilma2LoginID: details.value.raw,
            }).then(session => {
                generateStudentID(session.value[0])
                    .then(studentID => {
                        return resolve({ Wilma2SID: session.value[0], studentID: studentID, reset: true });
                    })
                    .catch(err => {
                        return reject(err);
                    })

            }).catch(err => {
                return reject(err);
            });

        }).catch(err => {
            return reject(err);
        });
    });
}



module.exports = {
    GenerateSessiondDetails,
    Login,
    StartSession,
}