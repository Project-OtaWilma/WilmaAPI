const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getRoomSchedule, getRoomList } = require('../requests/rooms');

router.get('/rooms/list', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getRoomList(auth)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status).json(err)
        });
});

router.get('/rooms/:id/schedule/week/:date', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const result = validators.validateRequestParameters(req, res, schemas.rooms.getRoomById);
    if (!result) return


    getRoomSchedule(auth, result.id, result.date)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status).json(err)
        });
});


module.exports = router;