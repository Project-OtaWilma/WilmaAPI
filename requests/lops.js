const LOPS2021 = require('../static/lops/LOPS2021.json');

const getCourseByID = (id) => {
    return new Promise((resolve, reject) => {
        const result = {};

        Object.keys(LOPS2021).forEach(s => {
            const subject = LOPS2021[s];

            if (Object.keys(subject).includes(id)) {
                return resolve(subject[id]);
            }
        })

        return reject({ err: "Couldn't locate course with specified ID", status: 400 })
    })
}

const getCourseList = () => {
    return new Promise((resolve, reject) => {
        const result = {};

        Object.keys(LOPS2021).forEach(s => {
            const subject = LOPS2021[s];

            result[s] = {}

            Object.keys(subject).forEach(c => {
                const course = subject[c];

                result[s][c] = {
                    name: course['name'],
                    type: course['type']
                }
            });
        })

        return resolve(result);
    })

}

module.exports = {
    getCourseByID,
    getCourseList
}