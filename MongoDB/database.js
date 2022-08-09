const { MongoClient } = require('mongodb');
const { user, password, host, port, apiKey } = require('./secret.json');
const shortid = require('shortid');
const account = require('../account/account-manager');

const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=DEFAULT`;

const getCourseById = (lops, id) => {
    return new Promise((resolve, reject) => {

        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const query = { code: id }

            db.collection(lops).find(query).project({ '_id': 0 }).toArray((err, res) => {
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

            db.collection(lops).find({}).project(projection).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                res.forEach(course => {
                    if (!result[course.subject]) result[course.subject] = [];

                    result[course.subject].push(course);
                })

                return resolve(result);
            });
        })
    });
}

const getTeacherList = () => {
    return new Promise((resolve, reject) => {
        const result = {};
        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const projection = {
                "_id": 0,
                "hash": 0,
                "Opintoviikkoja": 0,
                "feedback": 0
            }

            db.collection('teachers').find({}).sort({ name: 1 }).project(projection).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                res.forEach(teacher => {
                    const letter = teacher.name.substring(0, 1);

                    if (!Object.keys(result).includes(letter)) {
                        result[letter] = [];
                    }

                    result[letter].push(teacher);
                })

                return resolve(result);
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

            db.collection('teachers').find(query).project({ '_id': 0 }).toArray((err, res) => {
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

            db.collection('teachers').find(query).project({ '_id': 0 }).toArray((err, res) => {
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

        if (r.secret != apiKey) return reject({ err: 'Invalid credentials', status: 401 });

        getTeacherByName(r['teacher'])
            .then(teacher => {
                if (teacher.feedback['reviewers'].includes(r['sender'])) return reject({ err: 'Cannot give multiple ratings to same teacher', status: 400 });

                MongoClient.connect(url, (err, database) => {
                    if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                    const db = database.db('Wilma');
                    const query = { name: r['teacher'] }

                    const id = shortid.generate();

                    const comment = {
                        content: r["comment"],
                        id: id
                    };

                    const values = {
                        $push: {
                            "feedback.reviewers": r["sender"],
                            "feedback.course-pace": r["course-pace"],
                            "feedback.course-applicability": r["course-applicability"],
                            "feedback.course-style": r["course-style"],
                            "feedback.course-difficulty": r["course-difficulty"],
                            "feedback.return-speed": r["return-speed"],
                            "feedback.ability-to-self-study": r["ability-to-self-study"],
                            "feedback.comments": comment
                        },
                        $inc: {}
                    }

                    r["teacher-adjectives"].forEach(adjective => {
                        const path = {};
                        path[`feedback.teacher-adjectives.${adjective}`] = 1;

                        values['$inc'] = { ...values['$inc'], ...path };
                    });

                    db.collection('teachers').updateOne(query, values, (err, res) => {
                        if (err) { return reject({ err: 'Failed to connect to database', status: 500 }); }

                        console.log(res);

                        database.close();

                        if (res.modifiedCount < 1) return reject({ err: "Teacher with specified name wasn't found from database", status: 400 });

                        return resolve({ id: id, hash: teacher['hash'] });
                    });

                })
            })
            .catch(err => {
                return reject(err);
            })

    });
}

const parseFeedback = (raw) => {
    const result = {};
    const length = raw['course-pace'].length;

    result['reviews'] = raw['reviewers'].length;

    result['course-pace'] = average(raw['course-pace']);
    result['course-applicability'] = average(raw['course-applicability']);
    result['course-style'] = average(raw['course-style']);
    result['course-difficulty'] = average(raw['course-difficulty']);
    result['teacher-adjectives'] = [];

    Object.keys(raw['teacher-adjectives']).forEach(adjective => {
        result['teacher-adjectives'].push({
            adjective: adjective,
            percentage: percentage(length, raw['teacher-adjectives'][adjective])
        })
    })

    const comments = raw['comments'].filter(c => c);

    result['comments'] = comments.map(c => c['id'] ? c['content'] : c);
    result['teacher-adjectives'].sort((a, b) => { return b.percentage - a.percentage });

    return result;
}

const deleteComment = (hash, id, secret) => {
    return new Promise((resolve, reject) => {

        if (secret != apiKey) return reject({ err: 'Invalid credentials', status: 401 });

        getTeacherById(hash)
        .then(teacher => {
            MongoClient.connect(url, (err, database) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });
    
                const db = database.db('Wilma');
    
                const query = { hash: hash }

                const update = {
                    $pull: {
                        'feedback.comments': {
                            id: id
                        }
                    }
                }
    
                db.collection('teachers').updateOne(query, update, (err, res) => {
                    if (err) return reject({ err: 'Failed to connect to database', status: 500 });
    
                    database.close();
    
                    return resolve(res);
                });
            })
        })
        .catch(err => {
            return reject(err);
        })
    });
}

const average = (list) => {
    if (list.length < 2) return 'Ei riittävästi dataa';
    return (list.reduce((a, b) => a + b, 0) / list.length);
}

const percentage = (max, num) => {
    return ((num / max) * 100)
}

const getCourseApplicantList = (code) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, database) => {
            if (err) return reject({ err: 'Failed to connect to database', status: 500 });

            const db = database.db('Wilma');

            const query = { code: code }

            db.collection('course-tray').find(query).toArray((err, res) => {
                if (err) return reject({ err: 'Failed to connect to database', status: 500 });

                database.close();

                if(res.length < 1) return resolve([]);

                const interested = res[0]['interested'];
                return resolve(interested);
            });
        })
    })
}

const applyForFullCourse = (Wilma2SID, code) => {
    return new Promise((resolve, reject) => {
        account.Authenticate(Wilma2SID)
            .then(user => {

                getCourseApplicantList(code)
                    .then(list => {
                        if(list.includes(user.username)) return reject({err: 'You are already applied to this course', status: 400});

                        MongoClient.connect(url, (err, database) => {
                            if (err) return reject({ err: 'Failed to connect to database', status: 500 });
                
                            const db = database.db('Wilma');
                
                            const query = { code: code }
                            const update = {
                                $push: {
                                    interested: user.username
                                }
                            }
                
                            db.collection('course-tray').findOneAndUpdate(query, update, {upsert: true}, (err, res) => {
                                if (err) return reject({ err: 'Failed to connect to database', status: 500 });
                
                                database.close();
                
                                return resolve(res);
                            });
                        })
                    })
                    .catch(err => {
                        return reject(err);
                    })
                .catch(err => {
                    return reject(err);
                })
        })
    });
}

const checkApplicationStatus = (Wilma2SID, code) => {
    return new Promise((resolve, reject) => {
        account.Authenticate(Wilma2SID)
            .then(user => {
                getCourseApplicantList(code)
                    .then(list => {
                        console.log(list);
                        return resolve({applied: list.includes(user.username), length: list.length});
                    })
                    .catch(err => {
                        return reject(err);
                    })

                })
                .catch(err => {
                    return reject(err);
                })
})
}


module.exports = {
    lops: {
        getCourseById,
        getCourseList
    },
    teachers: {
        getTeacherList,
        getTeacherById,
        getTeacherByName,
        rateTeacher,
        parseFeedback,
        deleteComment
    },
    courseTray: {
        applyForFullCourse,
        checkApplicationStatus
    }
}





