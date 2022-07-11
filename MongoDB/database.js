const { MongoClient } = require('mongodb');
const { user, password, host, port, apiKey } = require('./secret.json');

const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=DEFAULT`;

const getCourseById = (id) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const query = { code: id }

            db.collection('LOPS2021').find(query).project({'_id': 0}).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                if (res.length < 1) return reject({ err: "Couldn't locate a course with specified id", status: 400 });

                return resolve(res[0]);
            });
        })

    });
}

const getCourseList = () => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const projection = {
                "_id": 0,
                "name": 0,
                "Tyyppi": 0,
                "Opintoviikkoja": 0,
                "Opintopisteitä": 0,
                "Sisältö": 0,
                "Tavoitteet": 0,
                "Kuvaus": 0,
                "OPS": 0
            }

            db.collection('LOPS2021').find({}).project(projection).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                if (res.length < 1) return reject({ err: "Couldn't locate a course with specified id", status: 400 });

                return resolve(res);
            });
        })
    });
}

const getTeacherByName = (name) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const query = { name: name }

            db.collection('teachers').find(query).project({'_id': 0}).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                if (res.length < 1) return reject({ err: "Couldn't locate a teacher with specified id", status: 400 });

                return resolve(res[0]);
            });
        })
    });
}

const getTeacherById = (id) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const query = { hash: id }

            db.collection('teachers').find(query).project({'_id': 0}).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                if (res.length < 1) return reject({ err: "Couldn't locate a teacher with specified id", status: 400 });

                return resolve(res[0]);
            });
        })
    });
}

const rateTeacher = (r) => {
    return new Promise((resolve, reject) => {

        if(r.secret != apiKey) return reject({ err: 'Invalid credentials', status: 401 });
        
        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');
            const query = { name: r['teacher'] }

            const values = {
                $push: {
                    "feedback.course-pace": r["course-pace"],
                    "feedback.course-applicability": r["course-applicability"],
                    "feedback.course-style": r["course-style"],
                    "feedback.course-difficulty": r["course-difficulty"],
                    "feedback.ability-to-self-study": r["ability-to-self-study"],
                    "feedback.comments": r["comment"]
                },
                $inc: {}
            }

            r["teacher-adjectives"].forEach(adjective => {
                const path = {};
                path[`feedback.teacher-adjectives.${adjective}`] = 1;
                
                values['$inc'] = {...values['$inc'], ...path};
            });
            
            db.collection('teachers').updateOne(query, values, (err, res) => {
                if (err) { return reject({ err: 'Failed to connect to database', status: 500 });}

                console.log(res);

                database.close();

                if (res.modifiedCount < 1) return reject({ err: "Couldn't locate teacher with specified name wasn't found from database", status: 400 });

                return resolve({ status: 200 });
            });
            
        })
    });
}

module.exports = {
    lops: {
        getCourseById,
        getCourseList
    },
    teachers: {
        getTeacherById,
        getTeacherByName,
        rateTeacher
    }
}





