const { authorize } = require('../google/authorize');
const { google } = require('googleapis');

const SCHOOL_CALENDAR_ID = 'edu.espoo.fi_eesj9p9mldus3sdabj39m306gg@group.calendar.google.com';
const SESSION_CACHE = {
    dateRange: [],
    events: [],
    cacheAge: new Date()
};

const fetchCalendar = (start = new Date(), end = new Date()) => {
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit'
    };

    return new Promise((resolve, reject) => {
        const dateRange = calculateDateRange(start, end).map(date => toWilmaFormat(date));

        const result = {};

        authorize().then(async auth => {
            const calendar = google.calendar({version: 'v3', auth});
            let events = [];

            const s = toWilmaFormat(start);
            const e = toWilmaFormat(end);

            const cached = SESSION_CACHE.dateRange.includes(s) && SESSION_CACHE.dateRange.includes(e);
            
            if (cached) {
                events = SESSION_CACHE.events;
            } else {
                await calendar.events.list({
                    calendarId: SCHOOL_CALENDAR_ID,
                    timeMin: start,
                    timeMax: end,
                    maxResults: 50,
                    singleEvents: true,
                    orderBy: 'startTime',
                    timeZone: 'EEST'
                }).then(res => {
                    console.log(`> Fetch calendar for ${s} - ${e}`);
                    events = res.data.items;
                    SESSION_CACHE.events = [...SESSION_CACHE.events, ...events.filter(e => !SESSION_CACHE.events.find(event => event.id == e.id))];
                    SESSION_CACHE.dateRange = [...SESSION_CACHE.dateRange, ...dateRange.filter(d => !SESSION_CACHE.dateRange.includes(d))];
                })
                .catch(err => {
                    console.log(err);
                    return reject({err: "failed to fetch Google's calendar API", status: 500});
                });
            }


            if (!events || events.length === 0) {
                return resolve(result);
            }
        
            events.forEach(event => {
                if (event.start.dateTime) {
                    const start = new Date(event.start.dateTime);
                    const end = new Date(event.end.dateTime);
                    const raw = toWilmaFormat(start);

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

                    const startRaw = toWilmaFormat(start);
                    const endRaw = toWilmaFormat(end);

                    dateRange.forEach(date => {
                        const raw = toWilmaFormat(date);

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



const toWilmaFormat = date => date.toLocaleDateString('Fi-fi', {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
}).split('.').reverse().join('-');

module.exports = {
    fetchCalendar
}