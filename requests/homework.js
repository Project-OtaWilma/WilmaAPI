const request = require('request');
const { homework } = require('../requests/responses');
const { lops } = require('../database/database');


const fetchHomework = (auth) => {
    return new Promise((resolve, reject) => {
        const date = new Date();

        const form = {
            'date': `${1}.${date.getMonth() + 1}.${date.getFullYear()}`,
            'getfullmonth': true,
            'formkey': auth.StudentID,
        }

        const options = {
            'method': 'POST',
            'url': `https://espoo.inschool.fi/overview`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
            form: form
        };


        request(options, async function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve schedule', status: 501 });

            homework.validateHomeworkGet(response)
                .then(() => {
                    try {
                        const overview = JSON.parse(response.body);
                        return resolve(overview.Groups);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse schedule', message: err, status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                })

        });
    })
}

const getHomework = (auth) => {
    return new Promise((resolve, reject) => {
        fetchHomework(auth)
        .then(groups => {
            const result = groups.map(group => {return {
                name: group.CourseName,
                code: group.CourseCode,
                caption: group.Caption,
                teachers: group.Teachers ? group.Teachers.map(teacher => {return {
                    teacher: teacher.TeacherCode,
                    name: teacher.TeacherName,
                    href: teacher.TeacherId,
                }}) : [],
                homework: group.Homework.map(h => {return {
                    date: h.Date,
                    assignment: h.Homework
                }}),
                diary: group.Diary.map(d => {return d.Note ? {
                    date: d.Date,
                    lesson: d.Lesson,
                    note: d.Note,
                    teacher: {
                        code: d.TeacherCode,
                        name: d.TeacherName,
                        href: d.TeacherId
                    }
                } : null}).filter(n => n)
            }})

            return resolve(result);
        })
        .catch(err => {
            return reject(err);
        })
    });
}




module.exports = {
    getHomework
}