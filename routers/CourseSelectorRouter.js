const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { schemas, validators } = require('./validator');

// https://wilma.tuukk.dev:8080/api/...
router.get('/code/:code', async (req, res) => {
    // validation
    if (!validators.validateRequestParameters(req, res, schemas.courseTray.getCourseByCode)) return;

    console.log(req.params);
    res.json({ status: 'success!' });
});

router.get('/teacher/:teacher', async (req, res) => {
    // validation
    if (!validators.validateRequestParameters(req, res, schemas.courseTray.getCoursesByTeacher)) return;
    console.log(req.params);
    res.json({ status: 'success!' });
});

router.get('/period/:period', async (req, res) => {
    // validation
    if (!validators.validateRequestParameters(req, res, schemas.courseTray.getCoursesByPeriod)) return;
    console.log(req.params);
    res.json({ status: 'success!' });
});

router.get('/period/:period/:bar', async (req, res) => {
    // validation
    if (!validators.validateRequestParameters(req, res, schemas.courseTray.getCoursesByBar)) return;
    console.log(req.params);
    res.json({ status: 'success!' });
});


module.exports = router;
