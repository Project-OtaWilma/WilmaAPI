const express = require('express');
const cors = require('cors');
const responseTime = require('response-time');

const login = require('./routers/login');
const gradebook = require('./routers/gradebook');
const news = require('./routers/news');
const schedule = require('./routers/schedule');
const message = require('./routers/messages')
const courseTray = require('./routers/course-tray');
const lops = require('./routers/lops');
const teachers = require('./routers/teachers')
const version = require('./routers/version');
const homework = require('./routers/homework');
const rooms = require('./routers/rooms');
const absences = require('./routers/absences');

const { authorize } = require('./google/authorize');

const limiter = require('./routers/rate-limit');


const { port } = require('./config.json');

const app = express();
const PORT = process.env.PORT || port;

app.use(express.json());
app.use(responseTime());
app.use(express.static('public'))

app.use(cors());
app.use('/api/', login, limiter.standard);
app.use('/api/', gradebook, limiter.standard);
app.use('/api/', news, limiter.standard);
app.use('/api/', schedule, limiter.standard);
app.use('/api/', message, limiter.standard);
app.use('/api/', courseTray, limiter.standard);
app.use('/api/', lops, limiter.standard);
app.use('/api/', teachers, limiter.standard);
app.use('/api/', version, limiter.standard);
app.use('/api/', homework, limiter.standard);
app.use('/api/', rooms, limiter.standard);
app.use('/api/', absences, limiter.standard);

// initialize google calendar authorization
authorize()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Listening on ${PORT}...`);
    });
})
.catch(err => {
    throw err;
});

