const { authorize } = require('../google/authorize');
const { google } = require('googleapis');

const SCHOOL_CALENDAR_ID = 'edu.espoo.fi_eesj9p9mldus3sdabj39m306gg@group.calendar.google.com';

const fetchCalendar = (start = new Date(), end = new Date()) => {
    return new Promise((resolve, reject) => {
        const dateOptions = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        };

        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };

        const result = {};

        authorize().then(async auth => {
            const calendar = google.calendar({version: 'v3', auth});

            const res = await calendar.events.list({
                calendarId: SCHOOL_CALENDAR_ID,
                timeMin: start,
                timeMax: end,
                maxResults: 50,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = res.data.items;
            if (!events || events.length === 0) {
                return resolve(result);
            }
        
            events.forEach((event, i) => {
                if (event.start.dateTime) {
                    const start = new Date(event.start.dateTime);
                    const end = new Date(event.end.dateTime);
                    const raw = start.toLocaleDateString('fi-FI', dateOptions).split('.').reverse().join('-');

                    const startRaw = start.toLocaleTimeString('fi-FI', timeOptions);
                    const endRaw = end.toLocaleTimeString('fi-FI', timeOptions);
                                        
                    if (!result[raw]) result[raw] = {date: raw, events: []}
                    result[raw].events.push({
                        fullDay: false,
                        summary: event.summary,
                        start: startRaw,
                        end: endRaw,
                    })
                }

                if (event.start.date) {
                    const start = new Date(event.start.date);
                    const end = new Date(event.end.date);
                    const dateRange = calculateDateRange(start, end);

                    const startRaw = start.toLocaleDateString('fi-FI', dateOptions).split('.').reverse().join('-');
                    const endRaw = end.toLocaleDateString('fi-FI', dateOptions).split('.').reverse().join('-');

                    dateRange.forEach(date => {
                        const raw = date.toLocaleDateString('fi-FI', dateOptions).split('.').reverse().join('-');

                        if (!result[raw]) result[raw] = {date: raw, events: []}
                        result[raw].events.push({
                            fullDay: true,
                            summary: event.summary,
                            startDate: startRaw,
                            endDate: endRaw,
                        })
                    })

                }

            });

            return resolve(result);
        })
        .catch(err => {
            console.log(err);
            return reject({err: "failed to fetch Google's calendar API", status: 500});
        })
    });
}

const calculateDateRange = (start = new Date(), end = new Date()) => {
    // God I love js's mutability
    let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const result = [start];

    while (d.getDate() != end.getDate()) {
        d.setDate(d.getDate() + 1);
        result.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    }

    return result.length <= 2 ? [start] : result;
}

module.exports = {
    fetchCalendar
}