const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getHomework } = require('../requests/homework');

router.get('/homework', async (req, res) => {
    // validation

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getHomework(auth, new Date())
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err)
        });
});



module.exports = router;