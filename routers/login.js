const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { StartSession, Logout} = require('../account/account-manager');
const { json } = require('express/lib/response');

router.post('/login', async (req, res) => {
    // validation
    const request = validators.validateRequestBody(req, res, schemas.login.postLogin);

    if (!request) return;

    const session = await StartSession({ Username: request.username, Password: request.password }).catch(err => { res.status(err.status).json(err); });
    res.json(session);
});

router.post('/logout', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if(!Wilma2SID) return;

    const StudentID = validators.validateStudentID(req, res);
    if(!StudentID) return;

    Logout(Wilma2SID, StudentID)
    .then(status => {
        res.json(status);
    })
    .catch(err => { res.status(err.status).json(err); });
});


module.exports = router;