const e = require('express');
const request = require('request');
const { schedule } = require('../requests/responses');

const fs = require('fs');
const path = require('path');

const teachers = require('../static/teachers/OTANIEMENLUKIO.json');
const { resolve } = require('path');


const getTeacher = (id) => {
    return new Promise((resolve, reject) => {
        
        const teacher = teachers[id];
        
        if(!teacher) return reject({ err: "Couldn't locate the teacher with specified name", status: 400 });

        if(!teacher['feedback']) {
            teacher['feedback'] = null;
            return resolve(teacher);
        }

        return resolve({
            name: teacher.name,
            task: teacher.task,
            feedback: {
                'course-pace': average(teacher.feedback['course-pace']),
                'course-applicability': average(teacher.feedback['course-applicability']),
                'course-style': average(teacher.feedback['course-style']),
                'course-difficulty': average(teacher.feedback['course-difficulty']),
                'ability-to-self-study': average(teacher.feedback['ability-to-self-study']),
                'teacher-adjectives': teacher.feedback['teacher-adjectives'],
                'comments': teacher.feedback['comments'].filter(c => c),
            }
        })
    })
}

const rateTeacher = (review = {}) => {
    return new Promise((resolve, reject) => {
        
        const teacher = Object.keys(teachers).find(t => teachers[t].name == review.teacher);
        
        if(!teacher) return reject({ err: "Couldn't locate the teacher with specified name", status: 400 })

        /* Thanks to JSON.stringify() flattening lists for some fucking reason, there must be an element inside the list in initialization...*/

        if(!teachers[teacher]['feedback']) {
            teachers[teacher]['feedback'] = {
                'reviews': [null],
                'course-pace': [null],
                'course-applicability': [null],
                'course-style': [null],
                'course-difficulty': [null],
                'teacher-adjectives': {},
                'ability-to-self-study': [null],
                'comments': [null]
            }
        }

        if(teachers[teacher]['feedback']['reviews'].includes(review.sender)) return reject({err: 'you have already submitted feedback for this teacher', status: 401 });

        const feedback = teachers[teacher]['feedback'];
        
        feedback['reviews'].push(review.sender);
        feedback['course-pace'].push(review['course-pace']);
        feedback['course-applicability'].push(review['course-applicability']);
        feedback['course-style'].push(review['course-style']);
        feedback['course-difficulty'].push(review['course-difficulty']);
        feedback['ability-to-self-study'].push(review['ability-to-self-study']);
        review['teacher-adjectives'].forEach(adjective => {
            if(!Object.keys(feedback['teacher-adjectives']).includes(adjective)) {
                feedback['teacher-adjectives'][adjective] = 0;
            }

            feedback['teacher-adjectives'][adjective]++;
        })

        if(review['comment']) feedback['comments'].push(review['comment']);
        
        fs.writeFile(path.join(__dirname, '../static/teachers/OTANIEMENLUKIO.json'), JSON.stringify(teachers), (err) => {
            if(err) {
                console.log(err);
                return reject({ err: 'Failed to write review', status: 500 });
            }

            return resolve({ status: 200 });
        })
    });
}

const average = (list) => {
    return list.filter(c => c).reduce((a, b) => a + b, 0) / list.filter(c => c != null).length
}

module.exports = {
    rateTeacher,
    getTeacher
}