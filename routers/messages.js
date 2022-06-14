const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { sendMessage, getMessageInbox, getMessageOutBox, getMessageByID } = require('../requests/messages');


router.post('/messages', async (req, res) => {
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

router.get('/messages/inbox', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    const request = validators.validateRequestBody(req, res, schemas.messages.sendMessage);

    if (!Wilma2SID) return;
    if (!request) return;

    getMessageInbox(Wilma2SID)
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
    const request = validators.validateRequestBody(req, res, schemas.messages.sendMessage);

    if (!Wilma2SID) return;
    if (!request) return;

    getMessageOutBox(Wilma2SID)
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