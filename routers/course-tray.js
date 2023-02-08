const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getTrayList, getTrayByPeriod, getCourseByID, selectCourse, deSelectCourse, getSelectedCourses } = require('../requests/course-tray');

router.get('/course-tray/list', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;


    getTrayList(auth)
        .then(list => {
            res.json(list);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/course-tray/:id', async (req, res) => {
    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetTrayByPeriod);
    if (!request) return;

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getTrayByPeriod(auth, request.id)
        .then(tray => {
            res.json(tray);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/course-tray/courses/:id', async (req, res) => {
    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;


    getCourseByID(auth, request.id, true)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/course-tray/courses/info/:id', async (req, res) => {
    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getCourseByID(auth, request.id, false)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});

router.post('/course-tray/select/:id', async (req, res) => {
    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    selectCourse(auth, request.id)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});

router.post('/course-tray/deselect/:id', async (req, res) => {
    // validation
    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;

    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    deSelectCourse(auth, request.id)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/course-tray/selected/list', async (req, res) => {
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getSelectedCourses(auth)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});


module.exports = router;