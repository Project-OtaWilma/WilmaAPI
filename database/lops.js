const { MongoClient } = require('mongodb');
const { user, password, host, port, apiKey } = require('./secret.json');
const shortid = require('shortid');
const account = require('../account/account-manager');

const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=DEFAULT`;
//const url = `mongodb://localhost:27020/mydb`;

const getCourseById = (lops, id) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const query = { code: id }

            db.collection(`${lops}-v2`).find(query).project({ '_id': 0 }).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                if (res.length < 1) return reject({ err: "Couldn't locate a course with specified id", status: 400 });

                return resolve(res[0]);
            });
        })

    });
}

const getCourseType = (lops, id) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const query = { code: id }

            const projection = {
                '_id': 0,
                'subject': 0,
                'code': 0,
                'name': 0,
                'Opintopisteitä': 0,
                'Sisältö': 0,
                'Tavoitteet': 0,
                'OPS': 0,
            }

            db.collection(`${lops}-v2`).find(query).project(projection).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                if (res.length < 1) return reject({ err: "Couldn't locate a course with specified id", status: 400 });

                return resolve(res[0]);
            });
        })

    });
}

const getCourseList = (lops) => {
    return new Promise((resolve, reject) => {
        const result = {};
        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const projection = {
                "_id": 0,
                "Tyyppi": 0,
                "Opintoviikkoja": 0,
                "Opintopisteitä": 0,
                "Sisältö": 0,
                "Tavoitteet": 0,
                "Kuvaus": 0,
                "OPS": 0
            }

            db.collection(`${lops}-v2`).find({}).project(projection).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                res.forEach(course => {
                    if (!result[course.subject]) result[course.subject] = {};
                    const code = course.code;
                    result[course.subject][code] = course;
                })

                return resolve(result);
            });
        })
    });
}

module.exports = {
    lops: {
        getCourseById,
        getCourseList,
        getCourseType
    }
}