const Joi = require('joi');
const express = require('express');
const { string } = require('joi');


const postLogin = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});


const getCourseByCode = Joi.object({
    code: Joi.string().max(10).required()
});

const getCoursesByTeacher = Joi.object({
    teacher: Joi.string().max(128).required()
});

const getCoursesByBar = Joi.object({
    period: Joi.number().required(),
    bar: Joi.number().required()
});

const getCoursesByPeriod = Joi.object({
    period: Joi.number().required()
});


const validateRequestParameters = (req, res, schema = {}) => {
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send({ error: result.error.details[0].message });
        return null;
    }

    return result.value;
}

const validateRequestBody = (req, res, schema = {}) => {
    const result = schema.validate(req.body);

    if (result.error) {
        res.status(400).send({ error: result.error.details[0].message });
        return null;
    }

    return result.value;
}

const validateRequestHeaders = (req, res) => {
    const Wilma2SID = req.headers.wilma2sid;

    if (!Wilma2SID) {
        res.status(400).send({ error: 'Missing session-authenticator (Wilma2SID)' });
        return null;
    }

    return Wilma2SID;
}


module.exports = {
    schemas: {
        login: {
            postLogin,
        },
        courseTray: {
            getCourseByCode,
            getCoursesByTeacher,
            getCoursesByBar,
            getCoursesByPeriod,
        }
    },
    validators: {
        validateRequestBody,
        validateRequestParameters,
        validateRequestHeaders,
    }
}