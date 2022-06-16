const { response } = require('express');
const { parse } = require('node-html-parser');
const utility = require('../utility/utility');

const validateMessagePost = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials", status: 401})
        }

        utility.parsers.parseTitle(res.body)
            .then(title => {

                switch(title) {
                    case 'Viestit - Wilma':
                        return resolve(true);
                    default:
                        return reject({err: "Couldn't send message - Invalid request", status: 400});
                }

            })
            .catch(err => {
                return reject(err);
            })
    });
}

const validateMessageGet = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials", status: 401})
        }

        return resolve(true);
    });
}

const validateMessageGetByID = (res) => {
    const disallowed = ['Käyttö estetty - Wilma']
    return new Promise((resolve, reject) => {

        if(!res.body) {
            return reject({err: "Invalid credentials", status: 401})
        }

        return resolve(true);
    });
}

const validateScheduleGet = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials", status: 401})
        }

        switch(res.statusCode) {
            case 200:
                return resolve(true);
            case 403:
                return reject({ error: "Invalid credentials (StudentID)", message: res.statusCode, status: 404 });
            default:
                return reject({ error: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateNewsGet = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials (Wilma2SID)", status: 401})
        }

        return resolve(true);
    });
}

const validateNewsGetByID = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials", status: 401})
        }
        
        switch(res.statusCode) {
            case 200:
                return resolve(true);
            case 403:
                return reject({ error: "Invalid ID - Couldn't find or didn't have permission to reach news with specified ID", message: res.statusCode, status: 404 });
            default:
                return reject({ error: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateGradebookGet = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials", status: 401})
        }

        return resolve(true);
    });
}

const validateCourseTrayGetList = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials", status: 401})
        }

        return resolve(true);
    });
}

const validateCourseTrayGetByPeriod = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials (Wilma2SID)", status: 401})
        }

        switch(res.statusCode) {
            case 200:
                return resolve(true);
            case 403:
                return reject({ error: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            case 500:
                return reject({ error: "Invalid tray identifier - Couldn't find a tray with specified ID", message: res.statusCode, status: 404 });
            default:
                return reject({ error: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateCourseTrayGetCourse = (res) => {
    return new Promise((resolve, reject) => {
        if(!res.body) {
            return reject({err: "Invalid credentials", status: 401})
        }

        switch(res.statusCode) {
            case 200:
                return resolve(true);
            case 500:
                return reject({ error: "Invalid course identifier - Couldn't find a course with specified ID", message: res.statusCode, status: 404 });
            default:
                return reject({ error: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}


module.exports = {
    messages: {
        validateMessagePost,
        validateMessageGet,
        validateMessageGetByID,
    },
    schedule: {
        validateScheduleGet
    },
    news: {
        validateNewsGet,
        validateNewsGetByID,
    },
    grades: {
        validateGradebookGet,
    },
    courseTray: {
        validateCourseTrayGetList,
        validateCourseTrayGetByPeriod,
        validateCourseTrayGetCourse,
    }
};