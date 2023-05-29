const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');
const { schemas, validators } = require('./validator');

const { lops } = require('../database/lops');


router.get('/lops/:lops/courses/get/:id', async (req, res) => {
    // Validation
    const request = validators.validateRequestParameters(req, res, schemas.lops.GetLopsCourseByID);

    if (!request) return;

    lops.getCourseById(request.lops, request.id)
        .then(course => {
            res.json(course);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/lops/:lops/courses/subject/:id', async (req, res) => {
    // Validation
    const request = validators.validateRequestParameters(req, res, schemas.lops.GetLopsCourseByID);

    if (!request) return;

    lops.getCourseType(request.lops, request.id)
        .then(course => {
            res.json(course);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});


router.get('/lops/:lops/courses/list/', limiter.cacheable, async (req, res) => {
    // Validation
    const request = validators.validateRequestParameters(req, res, schemas.lops.GetCourseList);

    if (!request) return;

    lops.getCourseList(request.lops)
        .then(list => {
            res.json(list);
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err)
        });
});


module.exports = router;