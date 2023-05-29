const { parse } = require('node-html-parser');
const request = require('request');
const { courseTray } = require('../requests/responses');

const getTrayList = (auth) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/selection/view`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve list of available trays', status: 501 });

            courseTray.validateCourseTrayGetList(response)
                .then(() => {
                    try {
                        const list = parseTrayList(response.body);
                        return resolve(list);
                    } catch (err) {
                        return reject({ err: 'Failed to parse course-tray', message: err, status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

const getTrayByPeriod = (auth, target) => {
    return new Promise((resolve, reject) => {
        const form = {
            'message': 'open-tray',
            'target': target,
            'formkey': auth.StudentID,
            'interest': auth.target,
            'refresh': '41765',
            'extras': ''
        }

        var options = {
            'method': 'POST',
            'url': `https://espoo.inschool.fi/selection/postback`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
            form: form
        };

        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve the tray', status: 501 });

            // Wilma2SID was incorrect

            courseTray.validateCourseTrayGetByPeriod(response)
                .then(() => {
                    try {
                        const list = parseTray(response.body);
                        return resolve(list);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse course-tray', message: err, status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                });

        });
    });
}

const getCourseByID = (auth, target, static) => {
    return new Promise((resolve, reject) => {

        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/selection/getback?message=group-info&target=${target}`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve the course information', status: 501 });

            courseTray.validateCourseTrayGetCourse(response)
                .then(() => {
                    try {
                        const list = static ? parseCourseData(response.body) : parseCourseStudents(response.body);
                        return resolve(list);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse the course information', message: err, status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                });

        });
    });
}

const getSelectedCourses = (auth) => {
    return new Promise((resolve, reject) => {
        const options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/trays?viewall`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve list of available trays', status: 501 });

            courseTray.validateCourseTrayGetSelectedCourses(response)
                .then(() => {
                    try {
                        const list = parseSelectedList(response.body);
                        return resolve(list);
                    } catch (err) {
                        return reject({ err: 'Failed to parse course-tray', message: err, status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

const selectCourse = (auth, target) => {
    return new Promise((resolve, reject) => {
        const form = {
            'message': 'pick-group',
            'target': target,
            'formkey': auth.StudentID,
            'refresh': '41765',
            'extras': ''
        }

        var options = {
            'method': 'POST',
            'url': `https://espoo.inschool.fi/selection/postback`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
            form: form
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve the tray', status: 501 });

            courseTray.validateCourseTrayGetByPeriod(response)
                .then(() => {
                    try {
                        const status = parsePostResponse(response.body);
                        return resolve(status);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse response', message: err, status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                });

        });
    });
}

const deSelectCourse = (auth, target) => {
    return new Promise((resolve, reject) => {
        const form = {
            'message': 'unpick-group',
            'target': target,
            'formkey': auth.StudentID,
            'refresh': '41765',
            'extras': ''
        }

        var options = {
            'method': 'POST',
            'url': `https://espoo.inschool.fi/selection/postback`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
            form: form
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve the tray', status: 501 });


            courseTray.validateCourseTrayGetByPeriod(response)
                .then(() => {
                    try {
                        const status = parsePostResponse(response.body);
                        return resolve(status);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse response', message: err, status: 500 });
                    }
                })
                .catch(err => {
                    return reject(err);
                });

        });
    });
}

const parseTrayList = (raw) => {
    const document = parse(raw);

    const titles = [];
    const trays = {
        own: {

        }
    }

    document.getElementById('own-schools').childNodes.forEach(e => {
        switch (e.rawTagName) {
            case 'h4':
                titles.push(e.textContent);
                trays.own[titles[titles.length - 1]] = [];
                break;
            case 'ul':
                e.childNodes.filter(c => c.childNodes.length > 0 && c.childNodes).forEach(cc => {
                    const data = cc.childNodes.filter(ccc => ccc.rawTagName == 'a')[0];
                    const status = data.attrs['title'] ?? 'Ilmoittautuminen mahdollista';
                    const tray = {
                        name: data.textContent.trim(),
                        status: status,
                        closed: status.includes('päättynyt') ||status.includes('alkaa'),
                        href: data.attrs.href
                    };

                    trays.own[titles[titles.length - 1]].push(tray);
                });
                break;
            default:
                break;
        }
    });

    return trays;
}

const parseTray = (raw) => {
    const document = parse(raw);
    const data = document.childNodes[1];
    const result = [];

    data.childNodes.filter(el => el.rawTagName).forEach((el, i) => {
        let title;
        let courses;

        if (i == 0) {
            title = el.childNodes[1].textContent;
            courses = el.childNodes[2];
        }
        else {
            title = el.childNodes[0].textContent;
            courses = el.childNodes[1];
        }

        result.push({ title: title, courses: [] })

        courses.childNodes[1].childNodes.filter(c => c.rawTagName == 'a').forEach(c => {
            const course = {
                hash: null,
                class: null,
                code: null,
                subject: null,
                name: null,
                info: {
                    teacher: null,
                    graded: false,
                    grade: null,
                    locked: false,
                    full: false,
                }
            };

            course.code = c.textContent;
            course.subject = course.code.replace(/[0-9]/g, '').replace('.', '');

            const data = c.rawAttrs.split('"');
            const info = data[5].trim().split('\\n')

            course.class = data[3].trim().replace('\\', '');
            course.hash = data[1].trim().replace('\\', '');

            info.forEach(d => {
                if (d == 'Ryhmä on lukittu.') {
                    course.info.locked = true;
                }

                if (d == 'Ryhmä on jo täynnä.') {
                    course.info.full = true;
                }

                if (d.includes('Opettaja:')) {
                    course.info.teacher = d.split(': ')[1];
                }

                if (d.includes('Tämä kurssi on jo suoritettu.')) {
                    course.info.graded = true;
                    course.info.grade = d.split('Arvosana: ')[1];
                }
            });

            course.name = info[0];
            result[result.length - 1].courses.push(course);
        })
    });
    return result;
}

const parseCourseData = (raw) => {
    const document = parse(raw);
    const keys = [];
    const result = {};

    document.childNodes.filter(c => c.childNodes.length > 0).forEach(c => {

        c.childNodes.forEach((cc, i) => {
            delete c.childNodes[1];

            cc.childNodes.forEach((field, e) => {
                const text = field.textContent.replaceAll('\\n', '')
                switch (e) {
                    case 0:
                        if (text != '') {
                            keys.push(text);
                            result[text] = null;
                        }
                        break;
                    case 1:
                        result[keys[keys.length - 1]] = text;

                        break;
                }
            });
        })
    })

    return result
}

const parseSelectedList = (raw) => {
    const document = parse(raw);
    const result = [];

    const ignore = [
        '1899-1900(Otaniemen lukio, Espoo)'
    ]

    let current = null;

    document.getElementsByTagName('tr').filter(tr => tr.childNodes.length >= 6 && tr.childNodes.length <= 8 ).forEach(tr => {
        if (tr.childNodes.length == 8) {
            current = tr.childNodes[0].textContent.trim();
            return;
        }

        const code = tr.childNodes.length == 6 ? tr.childNodes[2].textContent : tr.childNodes[3].textContent;
        const period = tr.childNodes.length == 6 ? tr.childNodes[1].textContent : tr.childNodes[2].textContent;
        const bar = tr.childNodes.length == 6 ? tr.childNodes[0].textContent : tr.childNodes[1].textContent;

        if(!result.includes(code) && !ignore.includes(current)) result.push({
            code: code,
            period: period,
            bar: bar,
            tray: current
        }); 
    })

    return result
}
const parseCourseStudents = (raw) => {
    const field = raw.split('<th>').filter(c => c.includes('Ilmoittautuneita'));

    if (field.length < 1) return { students: 'Ilmottautuneiden määrää ei ole ilmoitettu' };

    const value = parse(field[0]).getElementsByTagName('td')[0].textContent.replaceAll('\\n', '');

    return { students: value }
}

const parsePostResponse = (raw) => {
    return new Promise((resolve, reject) => {
        if (raw.includes('srvError')) {
            const split = raw.trim().split("'");
            const parsed = split.at(-2).trim();

            return reject({ err: "Couldn't update your selection", error: parsed, status: 400 });
        }

        return resolve({ success: true });
    })
}


module.exports = {
    getTrayList,
    getTrayByPeriod,
    getCourseByID,
    selectCourse,
    deSelectCourse,
    getSelectedCourses
}