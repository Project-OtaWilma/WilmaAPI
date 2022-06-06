const ical = require('node-ical');
const { parse } = require('node-html-parser');
const request = require('request');

const getScheduleToken = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/schedule`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve gradebook', message: response, status: 501 });

            // Wilma2SID was incorrect
            if (response.body == '') return reject({ error: 'Invalid credentials', message: response.statusCode, status: 401 });

            const token = parseToken(response.body);
            return resolve(token);
        });
    });
}

const getScheduleFile = (Wilma2SID, token) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/schedule/export/students/271885/Wilma.ics?token=02271885x80a5ae5a5dc124ed7eb3deb369794101&p=28&f=56&tstamp=1654534568`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve schedule', message: response, status: 501 });

            // Wilma2SID was incorrect
            if (response.body == '') return reject({ error: 'Invalid credentials', message: response.statusCode, status: 401 });

            const grades = parseSchedule(response.body);
            console.log('Done');
            return resolve(grades);
        });
    });
}

const parseToken = (raw) => {
    return "";
}

const parseSchedule = (raw) => {
    const events = ical.sync.parseICS(raw);
    const filter = Object.keys(events).filter(key => !key.startsWith('www.starsoft.fi'));
    const weekdays = [];

    filter.forEach(key => {
        delete events[key];
    });

    Object.keys(events).forEach(key => {
        const data = events[key].description.split('\n');
        if (data.length > 1) {
            events[key]['class'] = data.length == 2 ? null : data[0];
            events[key]['teacher'] = data.length == 2 ? data[0] : data[1];
            events[key]['range'] = data.length == 2 ? data[1].split('/') : data[2].split('/');
        }

        delete events[key]['rrule'];
        delete events[key]['type'];
        delete events[key]['method'];
    });

    events['count'] = Object.keys(events).length;

    return events;
}

const generateSchedule = (Wilma2SID, token) => {
    return new Promise((resolve, reject) => {
        getScheduleToken(Wilma2SID)
            .then(token => {
                getScheduleFile(Wilma2SID, token)
                    .then(schedule => {
                        return resolve(schedule);
                    })
                    .catch(err => {
                        return reject(err);
                    });
            })
            .catch(err => {
                return reject(err);
            })
    });
}

module.exports = {
    generateSchedule,
}