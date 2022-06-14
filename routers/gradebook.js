const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { getGradeBook } = require('../requests/gradebook');


router.get('/gradebook', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);

    if(!Wilma2SID) return;

    getGradeBook(Wilma2SID)
    .then(grades => {
        res.json(grades);
    })
    .catch(err => {
        return res.status(err.status).json(err)
    });
});


module.exports = router;