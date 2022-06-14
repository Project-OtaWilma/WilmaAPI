const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { getNewsInbox, getNewsById } = require('../requests/news');


router.get('/news', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);

    if (!Wilma2SID) return;

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
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const result = validators.validateRequestParameters(req, res, schemas.news.getNewsById);

    // Invalid ID
    if (!Wilma2SID) return;
    if (!result) return;

    getNewsById(Wilma2SID, result.id)
        .then(news => {
            return res.json(news);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});


module.exports = router;