const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getNewsInbox, getNewsById } = require('../requests/news');


router.get('/news/current', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;

    getNewsInbox(auth, 'Nykyiset tiedotteet', limit)
        .then(news => {
            return res.json(news);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });

});

router.get('/news/static', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;

    getNewsInbox(auth, 'Pysyvät tiedotteet', limit)
        .then(news => {
            return res.json(news);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });

});

router.get('/news/old', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;

    getNewsInbox(auth, 'Vanhat tiedotteet', limit)
        .then(news => {
            return res.json(news);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });

});

router.get('/news/:id=?', async (req, res) => {
    // validation
    const result = validators.validateRequestParameters(req, res, schemas.news.getNewsById);
    if (!result) return;

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getNewsById(auth, result.id)
        .then(news => {
            return res.json(news);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});


module.exports = router;