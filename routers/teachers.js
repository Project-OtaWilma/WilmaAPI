const express = require('express');
const request = require('request');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { hash } = require('../static/config/secret.json');

const { rateTeacher, getTeacher } = require('../requests/teachers');

router.post('/teachers/rate', async (req, res) => {
    // validation
    const result = validators.validateRequestBody(req, res, schemas.teachers.postTeacherReview);

    if (!result) return

    if( result.secret != hash ) return res.status(401).json({err: 'Invalid credentials', status: 401});

    rateTeacher(result)
    .then(status => {
        return res.json(status);
    })
    .catch(err => {
        console.log(err);
        return res.status(err.status).json(err);
    })
});

router.get('/teachers/:id', async (req, res) => {
    // validation
    const result = validators.validateRequestParameters(req, res, schemas.teachers.getTeacherByID);

    if (!result) return

    getTeacher(result.id)
    .then(teacher => {;
        return res.json(teacher)
    })
    .catch(err => {
        console.log(err);
        return res.status(err.status).json(err);
    })
});


module.exports = router;