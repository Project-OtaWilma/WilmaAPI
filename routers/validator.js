const Joi = require('joi');
const express = require('express');
const { string } = require('joi');


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
    id: Joi.string().required()
});



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
        },
        messages: {
            sendMessage,
            getMessageByID
        },
        courseTray: {
            GetTrayByPeriod,
            GetCourseByID
        }
    },
    validators: {
        validateRequestBody,
        validateRequestParameters,
        validateWilma2SID,
        validateStudentID,
    }
}