const request = require('request');
const { schedule } = require('../requests/responses');
const { fetchCalendar } = require('./calendar');


const fetchSchedule = (Wilma2SID, studentID, date) => {
    return new Promise((resolve, reject) => {
        const form = {
            'date': `${1}.${date.getMonth() + 1}.${date.getFullYear()}`,
            'getfullmonth': true,
            'formkey': studentID,
        }

        const options = {
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
            if (error) return reject({ error: 'Failed to retrieve schedule', status: 501 });

            schedule.validateScheduleGet(response)
                .then(() => {
                    try {
                        const schedule = JSON.parse(response.body);
                        return resolve(schedule);
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

const getScheduleByWeek = (auth, date) => {
    return new Promise(async (resolve, reject) => {
        let dateTimes = [];
        let exams = [];

        const weekRange = calculateWeekRange(date);

        for (let i = 0; i < weekRange.monthRange.length; i++) {
            const month = weekRange.monthRange[i];
            const dateTime = new Date(date.getFullYear(), (month - 1), 2);

            await fetchSchedule(auth.Wilma2SID, auth.StudentID, dateTime)
                .then(schedule => {
                    dateTimes = [...dateTimes, ...schedule.Schedule];
                    exams = [...exams, ...schedule.Exams];
                })
                .catch(err => {
                    return reject(err);
                })

            const parsed = parseSchedule(dateTimes, weekRange.dateRange, weekRange.number, exams, {}, true)
            return resolve(parsed);
        }
    });
}

const getScheduleByMonth = (auth, date) => {
    return new Promise(async (resolve, reject) => {
        let dateTimes = [];
        let exams = [];
        let events = {};

        const dateTime = new Date(date.getFullYear(), date.getMonth(), 1);
        const dateRange = calculateDaysInMonth(date.getMonth(), date.getFullYear());

        Promise.all([fetchSchedule(auth.Wilma2SID, auth.StudentID, dateTime), fetchCalendar(dateRange.at(0), dateRange.at(-1))])
        .then(result => {
            const [schedule, events] = result;

            const parsed = parseSchedule(schedule.Schedule, dateRange, date.getMonth() + 1, exams, events, false)
            return resolve(parsed);
        })
        .catch(err => {
            console.log(err);
            return reject(err);
        })

    });
}

const parseSchedule = (raw, dateTimes, number, exams, events, week) => {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    };

    const weekdays = [
        'Sunnuntai',
        'Maanantai',
        'Tiistai',
        'Keskiviikko',
        'Torstai',
        'Perjantai',
        'Launtai'
    ]

    const result = week ? {
        week: number,
        weekRange: dateTimes.map(d => d.toLocaleDateString('fi-FI', options)),
        days: {}
    } : {
        month: number,
        monthRange: dateTimes.map(d => d.toLocaleDateString('fi-FI', options)),
        days: {}
    }

    dateTimes.forEach(dateTime => {
        const d = dateTime.toLocaleDateString('fi-FI', options).split('.').reverse().join('-');

        const weekday = weekdays[dateTime.getDay()];

        if (!Object.keys(result.days).includes(d)) {
            result.days[d] = {
                day: {
                    date: dateTime.getDay(),
                    caption: `${weekday.substring(0, 2)} ${dateTime.getDate()}.${dateTime.getMonth() + 1}`,
                    full: `${weekday} ${d}`
                },
                lessons: [],
                exams: [],
                events: ((events ?? {})[d] ?? {}).events ?? []
            };
        }

        raw.forEach(hour => {
            if (hour.DateArray.includes(d)) {

                const exam = exams.find(e => e.Date == `${dateTime.getDate()}.${dateTime.getMonth() + 1}.${dateTime.getFullYear()}`);

                const hourData = {
                    start: hour.Start,
                    startRaw: toMinutes(hour.Start),
                    end: hour.End,
                    endRaw: toMinutes(hour.End),
                    durationRaw: (toMinutes(hour.End) - toMinutes(hour.Start)),
                    groups: hour.Groups.map(group => {
                        return {
                            code: group.ShortCaption,
                            name: group.FullCaption,
                            class: group.Class,
                            teachers: group.Teachers ? group.Teachers.map(teacher => {
                                return {
                                    id: teacher.Id,
                                    caption: teacher.Caption,
                                    name: teacher.LongCaption
                                }
                            }) : [],
                            rooms: group.Rooms ? group.Rooms.map(room => {
                                return {
                                    id: room.Id,
                                    caption: room.Caption,
                                    name: room.LongCaption
                                }
                            }) : []
                        }
                    })
                }
                if (exam) {
                    const examData = {
                        start: exam.TimeStart ? exam.TimeStart : null,
                        end: exam.TimeEnd ? exam.TimeEnd : null,
                        course: exam.Course,
                        name: exam.Name,
                        info: exam.Info ? exam.Info : null
                    }

                    result.days[d].exams.push(examData)
                }

                result.days[d].lessons.push(hourData);
            }
        });
    })


    return result;
}

const calculateWeekRange = (date) => {
    const result = {
        dateRange: [],
        monthRange: [],
    }

    const day = ((date.getDay() - 1) < 0 || (date.getDay() - 1) > 5) ? 0 : (date.getDay() - 1)
    const delta = [date.getDate() - (6 - (6 - day)), date.getDate() + (6 - day)];
    const week = Array(delta[1] - delta[0] + 1).fill(delta[0]).map((x, y) => x + y)
    
    week.forEach(day => {
        const dateTime = new Date(date.getFullYear(), date.getMonth(), day);
        const month = dateTime.getMonth() + 1;

        if (!result.monthRange.includes(month)) { result.monthRange.push(month); }
        
        result.dateRange.push(dateTime);
    });

    let d = result.dateRange[0];
    let s = (new Date(d.getFullYear(), 0, 0));
    result['number'] = Math.ceil((((d - s)) / (1000 * 60 * 60 * 24)) / 7);

    return result;
}

const calculateDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];

    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return days;
}

const toMinutes = (timeStamp) => timeStamp.split(':').map(i => Number.parseInt(i)).reduce((i, j) => i * 60 + j);

module.exports = {
    getScheduleByWeek,
    getScheduleByMonth
}