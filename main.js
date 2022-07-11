const express = require('express');
const cors = require('cors');
const login = require('./routers/login');
const gradebook = require('./routers/gradebook');
const news = require('./routers/news');
const schedule = require('./routers/schedule');
const message = require('./routers/messages')
const courseTray = require('./routers/course-tray');
const lops = require('./routers/lops');
const teachers = require('./routers/teachers')

const { port } = require('./config.json')

const app = express();
const PORT = process.env.PORT || port;

app.use(express.json());

app.use(cors());
app.use('/api/', login);
app.use('/api/', gradebook);
app.use('/api/', news);
app.use('/api/', schedule);
app.use('/api/', message);
app.use('/api/', courseTray);
app.use('/api/', lops);
app.use('/api/', teachers);

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});

