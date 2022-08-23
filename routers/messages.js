const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');
const { schemas, validators } = require('./validator');

const { getReceiverList, sendMessage, getMessageInbox, getMessageOutbox, getAppointments, getAnnouncements, getMessageByID } = require('../requests/messages');


router.post('/messages/send', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;

    const StudentID = validators.validateStudentID(req, res);
    if (!StudentID) return;

    const request = validators.validateRequestBody(req, res, schemas.messages.sendMessage);
    if (!request) return;

    sendMessage(Wilma2SID, StudentID, request.receiverType, request.receiver, request.subject, request.content)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});

router.post('/messages/reply', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const request = validators.validateRequestBody(req, res, schemas.messages.sendMessage);

    if (!Wilma2SID) return;
    if (!request) return;

    sendMessage(Wilma2SID, request.receiverType, request.receiver, request.subject, request.content)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});

router.post('/messages/remove', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const request = validators.validateRequestBody(req, res, schemas.messages.sendMessage);

    if (!Wilma2SID) return;
    if (!request) return;

    sendMessage(Wilma2SID, request.receiverType, request.receiver, request.subject, request.content)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});

router.get('/messages/recipients', limiter.cacheable, async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);

    if (!Wilma2SID) return;

    getReceiverList(Wilma2SID)
        .then(list => {
            res.json(list);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});

router.get('/messages/inbox', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const limit = req.query.limit ? req.query.limit : 1000;
    if (!Wilma2SID) return;

    getMessageInbox(Wilma2SID, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});

router.get('/messages/outbox', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const limit = req.query.limit ? req.query.limit : 1000;

    if (!Wilma2SID) return;

    getMessageOutbox(Wilma2SID, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});

router.get('/messages/appointments', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const limit = req.query.limit ? req.query.limit : 1000;

    if (!Wilma2SID) return;

    getAppointments(Wilma2SID, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});

router.get('/messages/announcements', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const limit = req.query.limit ? req.query.limit : 1000;

    if (!Wilma2SID) return;

    getAnnouncements(Wilma2SID, limit)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});

router.get('/messages/:id', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const request = validators.validateRequestParameters(req, res, schemas.messages.getMessageByID);

    if (!Wilma2SID) return;
    if (!request) return;

    getMessageByID(Wilma2SID, request.id)
        .then(session => {
            res.json(session);
        })
        .catch(err => {
            res.status(err.status).json(err);
        });
});


module.exports = router;