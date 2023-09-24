const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getGradeBook, getYOresults } = require('../requests/gradebook');


router.get('/gradebook', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;
    const filter = req.query.filter ? req.query.filter : null;

    getGradeBook(auth, limit, filter)
        .then(grades => {
            res.json(grades);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/yo-results', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getYOresults(auth)
        .then(grades => {
            res.json(grades);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});


module.exports = router;