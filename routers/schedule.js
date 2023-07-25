const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getScheduleByWeek, getScheduleByMonth } = require('../requests/schedule');
const { fetchCalendar } = require('../requests/calendar');

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
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/schedule/month/:date', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const result = validators.validateRequestParameters(req, res, schemas.schedule.getScheduleByDate);
    if (!result) return


    getScheduleByMonth(auth, result.date)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/schedule/month/events/:start/:end', async (req, res) => {

    const result = validators.validateRequestParameters(req, res, schemas.schedule.getEventsByDate);
    if (!result) return

    fetchCalendar(result.start, result.end)
        .then((events) => {
            res.json(events);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err)
        });
});


module.exports = router;