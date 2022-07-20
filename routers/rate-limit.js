const rateLimit = require('express-rate-limit');


const message = { err: 'rate-limit violation', status: 429 }

/*
    Standard rate-limit that is enforced for every endpoint
    (250 request / 10 min)
*/
const standard = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 250,
    standardHeaders: true,
    message: message
});

/*
    Rate-limit for cacheable resources such as lists
    (25 request / 10 min)
*/
const cacheable = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    message: message
})

/*
    Rate-limit for actions such as selecting and deselcting courses
    (100 request / 0.5 hour)
*/
const actions = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    message: message
})

/*
    Rate-limit for rarely used actions such as login
    (15 request / 1 hour)
*/
const strict = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    message: message
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
    actions,
    strict,
    ignore
}