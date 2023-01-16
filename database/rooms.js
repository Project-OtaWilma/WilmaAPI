const { MongoClient } = require('mongodb');
const { user, password, host, port, apiKey } = require('./secret.json');
const account = require('../account/account-manager');

const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=DEFAULT`;
//const url = `mongodb://127.0.0.1:27017/`;

const cacheRoom = (room) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            // TODO use these later to see weather room is occupied
            const currentDate = (new Date).toLocaleDateString('Fi-fi', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const currentTime = toMinutes((new Date).toLocaleTimeString('FI-fi').replaceAll('.', ':'));

            const weekNumber = room['week'];
            delete room['week'];

            const weekrange = room['weekRange'];
            delete room['weekRange'];

            const days = room['days'];
            delete room['days'];

            const query = { roomNumber: room['roomNumber'] }
            const update = {
                $set: {
                    ...room,
                    [`schedule.${weekNumber}`]: days,
                    ...weekrange.reduce((a, v) => ({ ...a, [`weekrange.${v.replaceAll('.', '-')}`]: weekNumber }), {})
                }
            }

            db.collection(`rooms`).updateOne(query, update, { upsert: true }, (err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                return resolve(res);
            });
        })

    });
}

const getCachedRoom = (id, date = new Date) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');
            const queryDate = date.toLocaleDateString('Fi-fi', { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('.', '-');

            const query = {
                hash: id,
                [`weekrange.${queryDate}`]: {
                    $exists: true
                }
            }

            db.collection(`rooms`).find(query).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });
                database.close();

                if (res.length == 0) return reject({ err: "Room-cache didn't contain requested resource", status: 404 });

                const weekNumber = res[0].weekrange[queryDate];
                const result = {
                    ...res[0], ...{
                        week: weekNumber,
                        weekrange: Object.keys(res[0].weekrange).filter(d => res[0].weekrange[d] == weekNumber),
                        schedule: res[0].schedule[`${weekNumber}`],
                        _id: undefined
                    }
                }

                return resolve(result);
            });
        })

    });
}

const toMinutes = (timeStamp) => timeStamp.split(':').map(i => Number.parseInt(i)).reduce((i, j) => i * 60 + j);

module.exports = {
    rooms: {
        cacheRoom,
        getCachedRoom
    }
}