const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');
const { schemas, validators } = require('./validator');

const { teachers } = require('../database/teachers');

router.get('/teachers/list', limiter.cacheable, async (req, res) => {

    teachers.getTeacherList()
        .then(status => {
            return res.json(status);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err);
        })

});

router.post('/teachers/rate', limiter.ignore, async (req, res) => {
    // validation
    const result = validators.validateRequestBody(req, res, schemas.teachers.postTeacherReview);

    if (!result) return

    teachers.rateTeacher(result)
        .then(status => {
            return res.json(status);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err);
        })

});

router.post('/teachers/comments/delete', limiter.ignore, async (req, res) => {
    // validation
    const result = validators.validateRequestBody(req, res, schemas.teachers.postCommentRemove);

    if (!result) return

    teachers.deleteComment(result.hash, result.id, result.secret)
        .then(status => {
            return res.json(status);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err);
        })

});

router.get('/teachers/name/:name', async (req, res) => {
    // validation
    const result = validators.validateRequestParameters(req, res, schemas.teachers.getTeacherByName);

    if (!result) return

    teachers.getTeacherByName(result.name)
        .then(teacher => {
            const info = teachers.parseFeedback(teacher.feedback);
            teacher['feedback'] = info;
            return res.json(teacher)
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err);
        })
});


router.get('/teachers/id/:id', async (req, res) => {
    // validation
    const result = validators.validateRequestParameters(req, res, schemas.teachers.getTeacherById);

    if (!result) return

    teachers.getTeacherById(result.id)
        .then(teacher => {
            ;
            const info = teachers.parseFeedback(teacher.feedback);
            teacher['feedback'] = info;
            return res.json(teacher)
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err);
        })
});


module.exports = router;