const request = require('request');
const { schedule } = require('../requests/responses');
const { parse } = require('node-html-parser')


const getRoomSchedule = (auth, roomId, date) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/profiles/rooms/${roomId}?date=${date.toLocaleDateString('FI-fi')}`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false
        };

        request(options, async function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve schedule', status: 501 });

            schedule.validateScheduleGet(response)
                .then(() => {
                    try {
                        const parsed = parseSchedule(response.body, date);
                        return resolve(parsed);
                    } catch (e) {
                        console.log(e);
                        return reject({ err: 'Failed to parse schedule', status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                })
        });
    })
}

const getRoomList = (auth) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/profiles/rooms/`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false
        };

        request(options, async function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve schedule', status: 501 });

            schedule.validateScheduleGet(response)
                .then(() => {
                    try {
                        const parsed = parseRoomList(response.body);
                        return resolve(parsed);
                    } catch (e) {
                        console.log(e);
                        return reject({ err: 'Failed to parse schedule', status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                })
        });
    })
}

const parseSchedule = (raw, date) => {
    const options = { 'day': '2-digit', 'month': '2-digit', 'year': 'numeric' };
    const result = {};

    const document = parse(raw)
    const title = document.getElementsByTagName('title')[0];
    const [roomNumber, ...nameRaw] = title.textContent.trim().split(' ').slice(1);

    result['roomNumber'] = roomNumber;
    result['img'] = `https://wilma.otawilma.fi/rooms/${roomNumber}.jpg`;
    result['name'] = nameRaw.join(' ').replace(' - Wilma', '');

    const jRaw = (document.getElementsByTagName('script').at(-1).textContent.trim());
    const list = JSON.parse(`[${jRaw.split('};')[0].split('[').pop().split(']')[0]}]`);
    const weekdays = ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'];

    const { range, number } = calculateWeekRange(date);

    result['week'] = number;
    result['weekRange'] = range.map(d => d.toLocaleDateString('FI-fi', options));

    result.days = range.reduce((a, v) => ({
        ...a, [v.toLocaleDateString('FI-fi', options)]: {
            day: {
                date: v.getDay(),
                caption: `${weekdays[v.getDay()].substring(0, 2)} ${v.getDate()}.${v.getMonth() + 1}`,
                full: `${weekdays[v.getDay()]} ${v.getDate()}.${v.getMonth() + 1}.${v.getFullYear()}`,
            },
            lessons: []
        }
    }), {});

    list.forEach(lesson => {
        const weekday = [(lesson.X1 / 10000)];
        const date = range[Math.floor(weekday)];
        const dateString = date.toLocaleDateString('FI-fi', options);

        result.days[dateString].lessons.push({
            start: toTimestamp(lesson.Start),
            startRaw: lesson.Start,
            end: toTimestamp(lesson.End),
            endRaw: lesson.End,
            durationRaw: lesson.End - lesson.Start,
            groups: [
                {
                    code: Object.values(lesson.Text)[0].split(' ').at(-1),
                    name: Object.values(lesson.LongText)[0].split(' ').slice(1).join(' '),
                    class: null,
                    teachers: Object.keys(lesson.OpeInfo).map(i => {
                        const teacher = Object.values(lesson.OpeInfo[i]).at(0) ?? {};
                        return {
                            id: teacher.kortti,
                            caption: teacher.lyhenne,
                            name: teacher.nimi
                        }
                    })
                }
            ]
        });
    })
    return result;
}

const parseRoomList = (raw) => {
    const document = parse(raw);

    return document.getElementsByTagName('p').filter(t => t.childNodes[0].attrs).map(p => {
        const [a] = p.childNodes;
        const [roomNumber, ...name] = a.textContent.trim().split(' ');

        return {
            id: a.attrs['href'].split('/').at(-1),
            roomNumber: roomNumber,
            name: name.join(' ')
        };
    })
}

const calculateWeekRange = (date = new Date()) => {
    const result = {
        range: [],
        number: null
    }
    const day = ((date.getDay() - 1) < 0 || (date.getDay() - 1) > 5) ? 0 : (date.getDay() - 1)
    const delta = [date.getDate() - (6 - (6 - day)), date.getDate() + (6 - day)];
    const week = Array(delta[1] - delta[0] + 1).fill(delta[0]).map((x, y) => x + y)

    week.forEach(day => {
        const dateTime = new Date(date.getFullYear(), date.getMonth(), day);
        result['range'].push(dateTime);
    });

    let d = result.range[0];
    let s = (new Date(d.getFullYear(), 0, 0));
    result['number'] = Math.ceil((((d - s)) / (1000 * 60 * 60 * 24)) / 7);

    return result;
}

const toMinutes = (timeStamp) => timeStamp.split(':').map(i => Number.parseInt(i)).reduce((i, j) => i * 60 + j);
const toTimestamp = (minutes) => `${Math.floor(minutes / 60)}:${minutes % 60}`;

module.exports = {
    getRoomSchedule,
    getRoomList
}
