const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { getSchedule } = require('../requests/schedule');

router.get('/schedule/:date', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const StudentID = validators.validateStudentID(req, res);

    const result = validators.validateRequestParameters(req, res, schemas.schedule.getScheduleByDate);

    if(!Wilma2SID) return
    if(!StudentID) return
    if(!result) return

    getSchedule(Wilma2SID, StudentID, result.date)
    .then(data => {
        res.json(data.Schedule);
    })
    .catch(err => {
        return res.status(err.status).json(err)
    });
});


module.exports = router;