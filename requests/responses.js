const { MultipartNetworkRequest } = require('express-runtime-dependency');
const utility = require('../utility/utility');


const validateAccountGetStudentID = (res) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            return reject({ err: 'Something went wrong with the login process', status: 500 })
        }

        utility.parsers.parseStudent(res.body)
            .then(studentID => {
                return resolve(studentID);
            })
            .catch(err => {
                return reject({ err: 'Failed to parse StudentID', status: 500 });
            });


    });
}

const validateMessagePost = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                utility.parsers.parseTitle(res.body)
                    .then(title => {
                        if (title.includes('Päällekkäinen kirjautuminen')) {
                            req.onRequestError(401);
                            return reject({ err: 'Invalid credentials', error: 'more than one login-instaces', status: 401 })
                        }

                        switch (title) {
                            case 'Viestit - Wilma':
                                req.onRequestHandled();
                                return resolve(true);
                            default:
                                req.onRequestError(400);
                                return reject({ err: "Couldn't send message - Invalid request", status: 400 });
                        }

                    })
                    .catch(err => {
                        return reject(err);
                    })
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateMessageGet = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }

    });
}

const validateMessageGetByID = (res, req) => {
    const disallowed = ['Käyttö estetty - Wilma']
    return new Promise((resolve, reject) => {

        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }

    });
}

const validateAbsencesGet = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateScheduleGet = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateHomeworkGet = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateNewsGet = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials (Wilma2SID)", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateNewsGetByID = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid ID - Couldn't find or didn't have permission to reach news with specified ID", message: res.statusCode, status: 400 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateGradebookGet = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateCourseTrayGetList = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateCourseTrayGetByPeriod = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials (Wilma2SID)", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 403:
                req.onRequestError(403);
                return reject({ err: "Invalid credentials (StudentID)", message: res.statusCode, status: 401 });
            case 500:
                req.onRequestError(400);
                return reject({ er: "Invalid tray identifier - Couldn't find a tray with specified ID", message: res.statusCode, status: 400 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateCourseTrayGetCourse = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 500:
                req.onRequestError(400);
                return reject({ err: "Invalid course identifier - Couldn't find a course with specified ID", message: res.statusCode, status: 400 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

const validateCourseTrayGetSelectedCourses = (res, req) => {
    return new Promise((resolve, reject) => {
        if (!res.body) {
            req.onRequestError(401);
            return reject({ err: "Invalid credentials", status: 401 })
        }

        switch (res.statusCode) {
            case 200:
                req.onRequestHandled();
                return resolve(true);
            case 500:
                req.onRequestError(400);
                return reject({ err: "Invalid course identifier - Couldn't find a course with specified ID", message: res.statusCode, status: 400 });
            default:
                req.onRequestError(500);
                return reject({ err: "Wilma responded with an unknown statuscode", message: res.statusCode, status: 501 });
        }
    });
}

module.exports = {
    account: {
        validateAccountGetStudentID
    },
    messages: {
        validateMessagePost,
        validateMessageGet,
        validateMessageGetByID,
    },
    schedule: {
        validateScheduleGet
    },
    homework: {
        validateHomeworkGet
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
        validateCourseTrayGetSelectedCourses
    },
    absences: {
        validateAbsencesGet
    }
};