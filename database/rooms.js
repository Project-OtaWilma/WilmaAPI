const { MongoClient } = require('mongodb');
const { user, password, host, port, apiKey } = require('./secret.json');
const account = require('../account/account-manager');

//const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=DEFAULT`;
const url = `mongodb://localhost:27017/`;

const cacheRoom = (room) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            console.log(err);
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const weekrange = room['weekRange'];
            delete room['weekRange'];

            const query = { roomNumber: room['roomNumber'] }
            const update = {
                $set: {
                    ...room
                },
                $push: {
                    weekRange: {
                        $each: [
                            ...weekrange
                        ]
                    }
                }
            }

            console.log(update);

            db.collection(`rooms`).updateOne(query, update, {upsert: true}, (err, res) => {
                console.log(err);
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                console.log(res);
                return resolve(res);
            });
        })

    });
}

const getCachedRoom = (id, date = new Date) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            console.log(err);
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const query = { hash: id, weekRange: date.toLocaleDateString('Fi-fi')}

            db.collection(`rooms`).find(query).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });
                database.close();

                if(res.length == 0) return reject({err: "Room-cache didn't contain requested resource", status: 404});

                return resolve(res[0]);
            });
        })

    });
}

module.exports = {
    rooms: {
        cacheRoom,
        getCachedRoom
    }
}