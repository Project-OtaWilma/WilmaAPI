const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { getGradeBook } = require('../requests/gradebook');


router.get('/gradebook', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateRequestHeaders(req, res);
    console.log(Wilma2SID);

    const grades = await getGradeBook(Wilma2SID).catch(err => { return res.status(err.status).json(err) });
});


module.exports = router;