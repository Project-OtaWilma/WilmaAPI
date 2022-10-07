const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getScheduleByDate, getScheduleByWeek } = require('../requests/schedule');

router.get('/schedule/date/:date', async (req, res) => {
    // validation
    const result = validators.validateRequestParameters(req, res, schemas.schedule.getScheduleByDate);
    if (!result) return

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getScheduleByDate(auth, result.date)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});

router.get('/schedule/week/:date', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const result = validators.validateRequestParameters(req, res, schemas.schedule.getScheduleByDate);
    if (!result) return


    getScheduleByWeek(auth, result.date)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status).json(err)
        });
});


module.exports = router;