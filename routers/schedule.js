const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { getSchedule, getScheduleByDate, getScheduleByWeek } = require('../requests/schedule');

router.get('/schedule/date/:date', async (req, res) => {
    // validation

    const StudentID = validators.validateStudentID(req, res);
    if (!StudentID) return

    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return


    const result = validators.validateRequestParameters(req, res, schemas.schedule.getScheduleByDate);

    if (!result) return

    getScheduleByDate(Wilma2SID, StudentID, result.date)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});

router.get('/schedule/week/:date', async (req, res) => {
    // validation

    const StudentID = validators.validateStudentID(req, res);
    if (!StudentID) return

    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return


    const result = validators.validateRequestParameters(req, res, schemas.schedule.getScheduleByDate);

    if (!result) return

    getScheduleByWeek(Wilma2SID, StudentID, result.date)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status).json(err)
        });
});


module.exports = router;