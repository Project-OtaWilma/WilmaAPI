const { parse } = require('node-html-parser');
const request = require('request');

const { courseTray } = require('../requests/responses');

const getTrayList = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/selection/view`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve list of available trays', message: response, status: 501 });

            // Wilma2SID was incorrect
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

const getTrayByPeriod = (Wilma2SID, StudentID, target) => {
    return new Promise((resolve, reject) => {
        const form = {
            'message': 'open-tray',
            'target': target,
            'formkey': StudentID,
            'interest': target,
            'refresh': '41765',
            'extras': ''
        }

        var options = {
            'method': 'POST',
            'url': `https://espoo.inschool.fi/selection/postback`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
            form: form
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve the tray', message: response, status: 501 });

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

const getCourseByID = (Wilma2SID, target) => {
    return new Promise((resolve, reject) => {

        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/selection/getback?message=group-info&target=${target}`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve the course information', message: response, status: 501 });

            // Wilma2SID was incorrect

            courseTray.validateCourseTrayGetCourse(response)
                .then(() => {
                    try {
                        const list = parseCourse(response.body);
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


const selectCourse = (Wilma2SID, StudentID, target) => {
    return new Promise((resolve, reject) => {
        const form = {
            'message': 'pick-group',
            'target': target,
            'formkey': StudentID,
            'refresh': '41765',
            'extras': ''
        }

        var options = {
            'method': 'POST',
            'url': `https://espoo.inschool.fi/selection/postback`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
            form: form
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve the tray', message: response, status: 501 });


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

const deSelectCourse = (Wilma2SID, StudentID, target) => {
    return new Promise((resolve, reject) => {
        const form = {
            'message': 'unpick-group',
            'target': target,
            'formkey': StudentID,
            'refresh': '41765',
            'extras': ''
        }

        var options = {
            'method': 'POST',
            'url': `https://espoo.inschool.fi/selection/postback`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
            form: form
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve the tray', message: response, status: 501 });


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

// Parser - v0.0.1 (13/06/2022)
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

                    const tray = {
                        name: data.textContent.trim(),
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

// Parser - v0.0.1 (13/06/2022)
// Expensice (~700ms)
const parseTray = (raw) => {
    const document = parse(raw);
    const data = document.childNodes[1];
    const titles = [];
    const result = {};

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
        titles.push(title);
        result[title] = [];

        courses.childNodes[1].childNodes.filter(c => c.rawTagName == 'a').forEach(c => {
            const course = {
                hash: null,
                class: null,
                code: null,
                subject: null,
                name: null,
                students: 0,
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

                if (d.includes('opiskelijaa')) {
                    course.students = Number.parseInt(d.split(' ')[0]);
                }

                if (d.includes('Tämä kurssi on jo suoritettu.')) {
                    course.info.graded = true;
                    course.info.grade = d.split('Arvosana: ')[1];
                }
            });

            course.name = info[0];
            result[titles[titles.length - 1]].push(course);
        })
    });

    return result;
}

const parseCourse = (raw) => {
    const regex = ['</td></tr>', '<tr><th>', '</th><td>', '</table>', '<table>'];
    const ignore = [0, 37];

    const course = [];
    const data = {};

    raw
        .replace('<tr><td colspan=\\"2\\" class=\\"coursename\\">', 'nimi')
        .split('\\n')
        .filter(l => !regex.includes(l)).map((l, i) => {

            l = l.split('<br>').filter(p => p != '').map(p => { return p.trim() })

            if (!ignore.includes(i)) {
                if (i % 2 == 0) {
                    return { value: l };
                }
                else if (l != '') {
                    return { key: l };
                }
            }

            return null
        })
        .filter(l => !!l)
        .forEach((l) => {
            if (l['key']) {
                course.push({ key: l.key, value: [] });
            }
            if (l['value']) {
                course[course.length - 1].value.push(l.value);
            }
        })



    course.forEach(d => {
        data[d.key] = Parse(d.value.flat());
    });

    delete data["');"]
    return data
}

const Parse = (value) => {
    if (!value) return null;
    return value.length > 1 ? value : value[0];
}

const parsePostResponse = (raw) => {
    return new Promise((resolve, reject) => {

        if (raw.includes('srvError')) {
            return reject({ err: "Couldn't update your selection", message: raw.trim().split('srvEndOfResponse()')[0].trim(), status: 303 });
        }

        return resolve({ success: true });
    })
}


module.exports = {
    getTrayList,
    getTrayByPeriod,
    getCourseByID,
    selectCourse,
    deSelectCourse
}