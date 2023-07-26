const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getAbsenceList } = require('../requests/absences');


router.get('/absences/:start/:end', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const result = validators.validateRequestParameters(req, res, schemas.schedule.getEventsByDate);
    if (!result) return

    getAbsenceList(auth, result.start, result.end)
        .then(grades => {
            res.json(grades);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});


module.exports = router;