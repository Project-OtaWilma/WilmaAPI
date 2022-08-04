const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');
const { schemas, validators } = require('./validator');

const { getTrayList, getTrayByPeriod, getCourseByID, selectCourse, deSelectCourse } = require('../requests/course-tray');
const { courseTray } = require('../MongoDB/database');

router.get('/course-tray/list', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;


    getTrayList(Wilma2SID)
        .then(list => {
            res.json(list);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status).json(err)
        });
});

router.get('/course-tray/:id', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;

    const StudentID = validators.validateStudentID(req, res);
    if (!StudentID) return;

    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetTrayByPeriod);
    if (!request) return;

    getTrayByPeriod(Wilma2SID, StudentID, request.id)
        .then(tray => {
            res.json(tray);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});

router.get('/course-tray/courses/:id', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;

    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;

    getCourseByID(Wilma2SID, request.id, true)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});

router.get('/course-tray/courses/info/:id', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;

    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;

    getCourseByID(Wilma2SID, request.id, false)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});

router.get('/course-tray/courses/applicants/:id', async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;

    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;

    courseTray.checkApplicationStatus(Wilma2SID, request.id)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status).json(err);
        });
});

router.post('/course-tray/select/:id', limiter.actions, async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;

    const StudentID = validators.validateStudentID(req, res);
    if (!StudentID) return;

    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;


    selectCourse(Wilma2SID, StudentID, request.id)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});

router.post('/course-tray/deselect/:id', limiter.actions, async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;

    const StudentID = validators.validateStudentID(req, res);
    if (!StudentID) return;

    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);
    if (!request) return;

    deSelectCourse(Wilma2SID, StudentID, request.id)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});

router.post('/course-tray/apply/:code', limiter.actions, async (req, res) => {
    // validation
    const Wilma2SID = validators.validateWilma2SID(req, res);
    if (!Wilma2SID) return;

    const request = validators.validateRequestParameters(req, res, schemas.courseTray.applyFullCourse);
    if (!request) return;

    courseTray.applyForFullCourse(Wilma2SID, request.code)
        .then(status => {
            res.json(status);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status).json(err)
        });
});

module.exports = router;