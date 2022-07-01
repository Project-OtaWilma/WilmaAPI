const { parse } = require('node-html-parser');
const request = require('request');
const { schedule } = require('../requests/responses');



const getSchedule = (Wilma2SID, studentID, date) => {
    return new Promise((resolve, reject) => {
        const form = {
            'date': `${1}.${date.getMonth() + 1}.${date.getFullYear()}`,
            'getfullmonth': true,
            'formkey': studentID,
        }

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
                        const parsed = parseSchedule(schedule.Schedule, date);

                        return resolve(parsed);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse schedule', message: err, status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                })

        });
    });
}

const parseSchedule = (raw, date) => {
    const dateTime = /*`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;*/"2021-09-03"

    const slots = [];
    const result = {}

    raw.forEach(hour => {
        if (hour.DateArray.includes(dateTime)) {
            console.log(hour);
        }

        /*
        const day = hour.Day;
        const duration = `${hour.Start} - ${hour.End}`

        const parser = {
            '08:30 - 09:45': 0,
            '10:00 - 11:15': 1,
            '11:20 - 13:15': 2,
            '13:30 - 14:45': 3,
            '15:00 - 16:15': 4,
            '08:30 - 11:30': 5,
            '12:30 - 15:30': 6
        }

        const slot = `${day}.${parser[duration]}`;
        const c = hour.Groups[0];
        const info = {
            code: c['Caption'],
            name: c['FullCaption'],
            duration: duration,
            class: c['Class'],
            teacher: c['Teachers'].map(t => {
                return {
                    code: t['Caption'],
                    name: t['LongCaption']
                }
            }),
            room: c['Rooms'] ? c['Rooms'][0]['Caption'] : null
        }


        if (!slots.includes(slot)) { slots.push(slot); result[slot] = [] }

        result[slots[slots.length - 1]].push(info);
        */
    });


    return result;
}

module.exports = {
    getSchedule
}