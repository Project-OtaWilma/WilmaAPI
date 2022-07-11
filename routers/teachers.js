const express = require('express');
const request = require('request');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { teachers } = require('../MongoDB/database');

router.post('/teachers/rate', async (req, res) => {
    // validation
    const result = validators.validateRequestBody(req, res, schemas.teachers.postTeacherReview);

    if (!result) return
    
    teachers.rateTeacher(result)
    .then(status => {
        return res.json(status);
    })
    .catch(err => {
        console.log(err);
        return res.status(err.status).json(err);
    })
    
});

router.get('/teachers/name/:name', async (req, res) => {
    // validation
    const result = validators.validateRequestParameters(req, res, schemas.teachers.getTeacherByName);

    if (!result) return

    teachers.getTeacherByName(result.name)
    .then(teacher => {;
        return res.json(teacher)
    })
    .catch(err => {
        console.log(err);
        return res.status(err.status).json(err);
    })
});


router.get('/teachers/id/:id', async (req, res) => {
    // validation
    const result = validators.validateRequestParameters(req, res, schemas.teachers.getTeacherById);

    if (!result) return

    teachers.getTeacherById(result.id)
    .then(teacher => {;
        return res.json(teacher)
    })
    .catch(err => {
        console.log(err);
        return res.status(err.status).json(err);
    })
});


module.exports = router;