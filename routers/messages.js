const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getMessageInbox, getMessageOutbox, getAppointments, getAnnouncements, getMessageByID, getNewMessages } = require('../requests/messages');


router.get('/messages/inbox', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? req.query.limit : 1000;

    getMessageInbox(auth, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status ?? 500).json(err);
        });
});

router.get('/messages/new', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? req.query.limit : 1000;

    getNewMessages(auth, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status ?? 500).json(err);
        });
});

router.get('/messages/outbox', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? req.query.limit : 1000;

    getMessageOutbox(auth, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status ?? 500).json(err);
        });
});

router.get('/messages/appointments', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? req.query.limit : 1000;

    getAppointments(auth, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status ?? 500).json(err);
        });
});

router.get('/messages/announcements', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const limit = req.query.limit ? req.query.limit : 1000;

    getAnnouncements(auth, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status ?? 500).json(err);
        });
});

router.get('/messages/:id', async (req, res) => {
    const request = validators.validateRequestParameters(req, res, schemas.messages.getMessageByID);
    if (!request) return;

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getMessageByID(auth, request.id)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status ?? 500).json(err);
        });
});


module.exports = router;