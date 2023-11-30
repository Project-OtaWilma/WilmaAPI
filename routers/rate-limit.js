const rateLimit = require('express-rate-limit');


const message = { err: 'rate-limit violation', status: 429 }

/*
    Standard rate-limit that is enforced for every endpoint
    (50 request / 10s)
*/
const standard = rateLimit({
    windowMs: 10 * 1000,
    max: 200,
    standardHeaders: true,
    message: {...message, ...{info: 'standard'}}
});

/*
    Rate-limit for cacheable resources such as lists
    (5 request / 10s)
*/
const cacheable = rateLimit({
    windowMs: 10 * 1000,
    max: 5,
    standardHeaders: true,
    message: {...message, ...{info: 'cacheable'}}
})

/*
    Rate-limit for rarely used actions such as login
    (25 request / 1 hour)
*/
const strict = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    message: {...message, ...{info: 'strict'}}
})

/*  
    Rate-limit for server-side communication such as google forms
*/
const ignore = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 0,
    standardHeaders: false
})

module.exports = {
    standard,
    cacheable,
    strict,
    ignore
}
