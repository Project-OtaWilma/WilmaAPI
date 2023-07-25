const Joi = require('joi');


const postLogin = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const getNewsById = Joi.object({
    id: Joi.string().min(5).required()
})


const getScheduleByDate = Joi.object({
    date: Joi.date().required()
})

const getEventsByDate = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required()
})

const sendMessage = Joi.object({
    receiverType: Joi.string().valid('personnel', 'teacher').required(),
    receiver: Joi.string().required(),
    subject: Joi.string().required(),
    content: Joi.string().required(),
});

const getMessageByID = Joi.object({
    id: Joi.string().required()
});

const GetTrayByPeriod = Joi.object({
    id: Joi.string().required()
});

const GetCourseByID = Joi.object({
    id: Joi.string().required(),
});

const applyFullCourse = Joi.object({
    code: Joi.string().required().max(24)
})

const GetLopsCourseByID = Joi.object({
    id: Joi.string().required(),
    lops: Joi.string().required().valid('LOPS2021', 'LOPS2016')
});

const GetCourseList = Joi.object({
    lops: Joi.string().required().valid('LOPS2021', 'LOPS2016')
});

const postTeacherReview = Joi.object({
    secret: Joi.string().required().length(64),
    sender: Joi.string().required(),
    teacher: Joi.string().required(),
    'course-pace': Joi.number().required(),
    'course-applicability': Joi.number().required(),
    'course-style': Joi.number().required(),
    'course-difficulty': Joi.number().required(),
    'teacher-adjectives': Joi.array().required(),
    'return-speed': Joi.number().required(),
    'ability-to-self-study': Joi.number().required(),
    'comment': Joi.string().allow(null, '')
});

const postCommentRemove = Joi.object({
    secret: Joi.string().required().length(64),
    hash: Joi.string().required(),
    id: Joi.string().required()
})

const getTeacherByName = Joi.object({
    name: Joi.string().required()
});

const getTeacherById = Joi.object({
    id: Joi.string().required()
});

const getRoomById = Joi.object({
    id: Joi.string().required().max(9),
    date: Joi.date().required()
})

const validateRequestParameters = (req, res, schema = {}) => {
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send({ err: result.error.details[0].message, status: 400 });
        return null;
    }

    return result.value;
}

const validateRequestBody = (req, res, schema = {}) => {
    const result = schema.validate(req.body);

    if (result.error) {
        res.status(400).send({ err: result.error.details[0].message, status: 400 });
        return null;
    }

    return result.value;
}

const validateWilma2SID = (req, res) => {
    const Wilma2SID = req.headers.wilma2sid;

    if (!Wilma2SID) {
        res.status(400).send({ err: 'Missing session-authenticator (Wilma2SID)', status: 400 });
        return null;
    }

    return Wilma2SID;
}

const validateStudentID = (req, res) => {
    const StudentID = req.headers.studentid;

    if (!StudentID) {
        res.status(400).send({ err: 'Missing student identifier (formKey)', status: 400 });
        return null;
    }

    return StudentID;
}


module.exports = {
    schemas: {
        login: {
            postLogin,
        },
        news: {
            getNewsById,
        },
        schedule: {
            getScheduleByDate,
            getEventsByDate
        },
        messages: {
            sendMessage,
            getMessageByID
        },
        courseTray: {
            GetTrayByPeriod,
            GetCourseByID,
            applyFullCourse
        },
        lops: {
            GetLopsCourseByID,
            GetCourseList
        },
        teachers: {
            postTeacherReview,
            postCommentRemove,
            getTeacherByName,
            getTeacherById
        },
        rooms: {
            getRoomById,
        }
    },
    validators: {
        validateRequestBody,
        validateRequestParameters,
        validateWilma2SID,
        validateStudentID,
    }
}