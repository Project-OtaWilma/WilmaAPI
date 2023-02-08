const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { StartSession, Logout, Authenticate } = require('../account/account-manager');

router.post('/login', limiter.strict, async (req, res) => {
    // validation
    const request = validators.validateRequestBody(req, res, schemas.login.postLogin);

    if (!request) return;

    const session = await StartSession({ Username: request.username, Password: request.password }).catch(err => { res.status(err.status ?? 500).json(err); });
    res.json(session);
});

router.post('/logout', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    Logout(auth)
        .then(status => {
            res.json(status);
        })
        .catch(err => { res.status(err.status ?? 500).json(err); });
});

router.post('/authenticate', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    Authenticate(auth)
        .then(status => {
            res.json(status);
        })
        .catch(err => { res.status(err.status ?? 500).json(err); });
});


module.exports = router;