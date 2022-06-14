const { parse } = require('node-html-parser');
const request = require('request');
const { schedule } = require('../requests/responses');



const getSchedule = (Wilma2SID, studentID, date) => {
    return new Promise((resolve, reject) => {
        const form = {
            'date': `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`,
            'getfullmonth': true,
            'formkey': studentID,
        }

        console.log(form);

        var options = {
            'method': 'POST',
            'url': `https://espoo.inschool.fi/overview`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
            form: form
        };


        request(options, async function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve schedule', message: response, status: 501 });

            schedule.validateScheduleGet(response)
            .then(() => {
                try {
                    const schedule = JSON.parse(response.body);
                    return resolve(schedule);
                } catch(err) {
                    return reject({err: 'Failed to parse schedule', message: err, status: 500});
                }
            })
            .catch(err => {
                return reject(err);
            })

        });
    });
}

module.exports = {
    getSchedule
}