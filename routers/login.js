const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { StartSession } = require('../account/account-manager');
const { json } = require('express/lib/response');

router.post('/login', async (req, res) => {
    // validation
    const request = validators.validateRequestBody(req, res, schemas.login.postLogin);

    if (!request) return;

    const session = await StartSession({ Username: request.username, Password: request.password }).catch(err => { res.status(err.status).json(err); });
    res.json(session);
});


module.exports = router;