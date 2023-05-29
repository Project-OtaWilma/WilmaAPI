const express = require('express');
const router = express.Router();
const { schemas, validators } = require('./validator');
const authentication = require('../database/authentication');

const { getRoomSchedule, getRoomList } = require('../requests/rooms');
const { rooms } = require('../database/rooms');

router.get('/rooms/list', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    getRoomList(auth)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            return res.status(err.status ?? 500).json(err)
        });
});

router.get('/rooms/:id/schedule/week/:date', async (req, res) => {
    // validation
    const auth = await authentication.validateToken(req, res);
    if (!auth) return;

    const result = validators.validateRequestParameters(req, res, schemas.rooms.getRoomById);
    if (!result) return

    rooms.getCachedRoom(result.id, result.date)
        .then(cached => {
            cached['info'] = cached['info'] ? cached['info'] : 'ei lisätietoja';

            return res.json({cached: true, ...cached});
        })
        .catch(err => {
            switch(err.status) {
                case 404:
                    getRoomSchedule(auth, result.id, result.date)
                        .then(async (data) => {
                            await rooms.cacheRoom({...data, hash: result.id})
                            data['schedule'] = data['days'];
                            delete data['days'];

                            data['info'] = data['info'] ? data['info'] : 'ei lisätietoja';

                            return res.json({cached: false, ...data});
                        })
                        .catch(err => {
                            console.log(err);
                            return res.status(err.status ?? 500).json(err)
                        });   
                    break;
                default:
                    console.log(err);
                    return res.status(err.status ?? 500).json(err)
            }
        })
});


module.exports = router;