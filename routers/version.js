const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');

const { version } = require('../package.json');



router.get('/version/get', async (req, res) => {
    res.json({ version: version })
});



module.exports = router;