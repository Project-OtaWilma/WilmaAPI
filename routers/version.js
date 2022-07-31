const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');

const { version } = require('../package.json');



router.get('/version/get', async (req, res) => {

    res.json({ version: version })
    /*
    lops.getCourseById(request.lops, request.id)
        .then(course => {
            res.json(course);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
    */
});



module.exports = router;