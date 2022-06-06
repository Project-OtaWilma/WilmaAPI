const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { getNewsInbox, getNewsById } = require('../requests/news');


router.get('/news', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateRequestHeaders(req, res);
    console.log(Wilma2SID);

    getNewsInbox(Wilma2SID)
        .then(news => {
            return res.json(news);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });

});

router.get('/news/:id=?', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateRequestHeaders(req, res);
    const result = validators.validateRequestParameters(req, res, schemas.news.getNewsById);

    // Invalid ID
    if (!result) return;

    console.log(Wilma2SID);

    getNewsById(Wilma2SID, result.id)
        .then(news => {
            return res.json(news);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});


module.exports = router;