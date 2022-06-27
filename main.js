const express = require('express');
const cors = require('cors');
const DataBase = require('./database/database');
const login = require('./routers/login');
const gradebook = require('./routers/gradebook');
const news = require('./routers/news');
const schedule = require('./routers/schedule');
const message = require('./routers/messages')
const courseTray = require('./routers/course-tray');
const lops = require('./routers/lops');

const app = express(); // setup server
const PORT = process.env.PORT || 3001; // Bind port

// Enabled JSON-parsing and authentication
app.use(express.json());
/*
app.use((req, res, next) => {
    if (!req.headers.authorization) return res.status(403).json({ status: 'Missing api-key authorization' });

    DataBase.authentication.Authenticate(req.headers.authorization).then(success => {
        next();
    }).catch(err => {
        return res.status(err.errorCode).json({ error: err.status });
    })
});

*/
app.use(cors());
// Routers
app.use('/api/', login);
app.use('/api/', gradebook);
app.use('/api/', news);
app.use('/api/', schedule);
app.use('/api/', message);
app.use('/api/', courseTray);
app.use('/api/', lops);


// PORT
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});
