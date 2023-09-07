const request = require('request');
const utility = require('../utility/utility');
const authentication = require('../database/authentication');

// const whitelist = require('./whitelist.json');

const { account } = require('../requests/responses');

const GenerateSessiondDetails = () => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': 'https://espoo.inschool.fi/login/',
        };

        request(options, function (error, response) {
            if (error) return reject({ error: 'Error occured while trying to retrieve details from https://espoo.inschool.fi/login/', status: 503 });

            if (response.statusCode == 200) {
                utility.cookies.parseCookie(response.headers['set-cookie'][0])
                    .then(session => {
                        return resolve(session);
                    })
                    .catch(err => {
                        return reject({ error: 'Wilma sent an invalid cookie', status: 501 });
                    });
            }
            else {
                return reject({ error: "Couldn't generate session details", info: response.statusCode, status: 404 });
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
            if (error) return reject({ err: 'Error occured while trying to reach "https://espoo.inschool.fi/login/"', status: 503 });
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
                return reject({ error: 'Wilma responded with an unknown status.', info: response.statusCode, status: 501 });
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
            if (error) return reject({ err: 'Error occured while trying to retrieve details from "https://espoo.inschool.fi/schedule"', status: 503 });

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
                Wilma2LoginID: details.raw, // You gotta be fucking kidding me
            }).then(session => {
                generateStudentID(session.value[0])
                    .then(studentID => {
                        const token = authentication.signToken({ Wilma2SID: session.value[0], StudentID: studentID, username: login.Username.toLowerCase() })
                        return resolve({ token: token, reset: true });
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

const Logout = (auth) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'POST',
            'url': 'https://espoo.inschool.fi/logout',
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'formkey': auth.StudentID,
            }
        };

        request(options, async function (error, response) {
            if (error) return reject({ error: 'Error occured while trying to reach "https://espoo.inschool.fi/login/"', status: 503 });
            if (response.statusCode == 303) {
                return resolve({ status: 200 });
            }
            else {
                return reject({ err: 'Wilma responded with an unknown status.', info: response.statusCode, status: 501 });
            }

        });
    });
}

const Authenticate = (auth) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': 'https://espoo.inschool.fi/schedule',
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`
            },
            followRedirect: false
        };

        request(options, async function (error, response) {
            if (error) return reject({ error: 'Error occured while trying to reach "https://espoo.inschool.fi/schedule"', status: 503 });

            switch (response.statusCode) {
                case 200:
                    if (!response.body) return reject({ err: 'Invalid credentials', status: 401 });

                    return resolve({
                        valid: true,
                        iat: auth['iat'],
                        username: auth['username'].toLowerCase()
                    });
                case 302:
                    return reject({ err: 'Invalid credentials', status: 401 });
                case 403:
                    return reject({ err: 'Invalid credentials', message: 'Two existing login-instances', status: 401 });
                default:
                    return reject({ err: 'Wilma responded with an unknown status.', status: response.statusCode });
            }

        });
    });
}



module.exports = {
    GenerateSessiondDetails,
    Login,
    Logout,
    StartSession,
    Authenticate
}