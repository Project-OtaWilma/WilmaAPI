const express = require('express');
const router = express.Router();
const limiter = require('./rate-limit');
const { schemas, validators } = require('./validator');

const { lops } = require('../MongoDB/database');


router.get('/lops/:lops/courses/get/:id', limiter.cacheable, async (req, res) => {
    // Validation
    const request = validators.validateRequestParameters(req, res, schemas.lops.GetLopsCourseByID);

    if (!request) return;

    lops.getCourseById(request.lops, request.id)
        .then(course => {
            res.json(course);
        })
        .catch(err => {
            return res.status(err.status).json(err)
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
            return res.status(err.status).json(err)
        });
});


module.exports = router;