const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');

const { getCourseByID, getCourseList } = require('../requests/lops');


router.get('/lops/courses/get/:id', async (req, res) => {
    // Validation
    const request = validators.validateRequestParameters(req, res, schemas.courseTray.GetCourseByID);

    if (!request) return;

    getCourseByID(request.id)
        .then(course => {
            res.json(course);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});

router.get('/lops/courses/list/', async (req, res) => {
    // Validation

    getCourseList()
        .then(list => {
            res.json(list);
        })
        .catch(err => {
            return res.status(err.status).json(err)
        });
});


module.exports = router;