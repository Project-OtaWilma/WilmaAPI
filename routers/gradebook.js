const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { getGradeBook } = require('../requests/gradebook');


router.get('/gradebook', async (req, res) => {
    // Validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;
    const filter = req.query.filter ? req.query.filter : null;

    if (!Wilma2SID) return;

    getGradeBook(Wilma2SID, limit, filter)
        .then(grades => {
            res.json(grades);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});


module.exports = router;