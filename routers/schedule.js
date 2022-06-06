const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { generateSchedule } = require('../requests/schedule');


router.get('/schedule', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateRequestHeaders(req, res);
    console.log(Wilma2SID);

    const schedule = await generateSchedule(Wilma2SID).catch(err => { return res.status(err.status).json(err) });
    res.json(schedule);
});


module.exports = router;