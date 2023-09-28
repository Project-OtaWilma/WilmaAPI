const { object } = require('joi');
const { parse } = require('node-html-parser');
const request = require('request');

const { grades } = require('../requests/responses');

const getGradeBook = (auth, limit, filter) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/choices?view=gradebook`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve gradebook', status: 501 });

            // Wilma2SID was incorrect
            grades.validateGradebookGet(response)
                .then(() => {
                    try {
                        const gradebook = parseGrades(response.body, limit, filter);
                        return resolve(gradebook);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse grades', message: err, status: 500 });
                    }
                })
                .catch(err => {

                    return reject(err);
                })

        });
    });
}

const getYOresults = (auth) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/forms/49`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve gradebook', status: 501 });

            // Wilma2SID was incorrect
            grades.validateGradebookGet(response)
                .then(() => {
                    try {
                        const gradebook = parseYOresults(response.body);
                        return resolve(gradebook);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse yo-info', message: err, status: 500 });
                    }
                })
                .catch(err => {

                    return reject(err);
                })

        });
    });
}

/*
    Have fun...
*/

const parseGrades = (raw, limit, filter) => {
    const result = {'overview': {}};
    const titles = [];
    const om = [];
    const am = [];

    const grades = [
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        'P',
        'K',
        'S'
    ]

    const optionalSubjectList = [
        'Liikunta',
        'Musiikki',
        'Kuvataide',
        'Opinto-ohjaus',
        'Teatteri',
        'Media',
        'Lukiodiplomit',
        'Temaattiset opinnot',
        'Teknologia',
        'OTA-opinnot',
        'Korkeakouluopinnot',
        'Talous ja nuoret',
        'Muut opinnot'
    ]

    const ignoredSubjectList = [
        'Ruotsi, B1-oppimäärä'
    ]

    const document = parse(raw);

    const appendTitle = (titleElement, value) => {
        const title = titleElement.textContent.trim();
        const info = value.filter(t => t.textContent.trim());

        switch(info.length) {
            case 2:
                titles.push(title);

                if(info[0] && !ignoredSubjectList.includes(title)) om.push(info[0].textContent.trim());
                if(info[0] && !optionalSubjectList.includes(title) && !ignoredSubjectList.includes(title)) am.push(info[0].textContent.trim());

                result[title] =  {
                    grade: info[0] ? info[0].textContent.trim() : null,
                    points: info[1] ? info[1].textContent.trim() : null,
                    courses: {}
                }
                break;
            case 1:
                titles.push(title);
                result[title] =  {
                    grade: null,
                    points: info[1] ? info[1].textContent.trim() : null,
                    courses: {}
                }
                break;
            default:
                titles.push(title);
                result[title] =  {
                    grade: null,
                    points: null,
                    courses: {}
                }
        }
    }

    const appendCourse = (title, value) => {
        const d = title.childNodes.filter(t => t.textContent.trim())[0];
        const [codeElement, nameElement] = d.childNodes;
        const code = codeElement.textContent.trim();
        //const name = codeElement.textContent.trim();

        const info = value.filter(t => t.textContent.trim());

        switch(info.length) {
            case 4:
                result[titles.at(-1)]['courses'][code] = {
                    grade: info[0] ? info[0].textContent.trim() : null,
                    points: info[1] ? info[1].textContent.trim() : null,
                    date: info[2] ? info[2].textContent.trim() : null,
                    teacher: info[3] ? info[3].textContent.trim() : null,
                }
            case 3:
                // why the fuck would you leave fields empty....
                let data = info.filter(c => c).map(c => c.textContent.trim());
                
                const grade = data.filter(c => grades.includes(c))[0];
                if(grade) data.splice(data.indexOf(grade), 1);

                const points = data.filter(c => !Number.isNaN(+c))[0];
                if(points) data.splice(data.indexOf(points), 1);

                result[titles.at(-1)]['courses'][code] = {
                    grade: grade ? grade : null,
                    points: points ? points : null,
                    date: data[0] ? data[0] : null,
                    teacher: data[1] ? data[1] : null
                }
        }
    }


    //regular courses
    document.getElementsByTagName('tr').filter(tr => tr.childNodes.length == 11).forEach(tr => {
        const d = tr.childNodes.filter(td => td.textContent.trim());


        const [title, ...value] = d;

        switch(title.attrs['style']) {
            case 'padding-left : 1.8em;': // titles
                if(value.length >= 3) {
                    appendCourse(title, value);
                }
                else {
                    appendTitle(title, value)
                }
                break;
            case 'padding-left : 2.8em;': // courses
                appendCourse(title, value);
                break;
        }
    })

    document.getElementsByTagName('tr').filter(tr => tr.childNodes.length != 11).forEach(tr => {
        //console.log([tr.toString(), tr.childNodes.length])
        const d = tr.childNodes.filter(td => td.textContent.trim() && !td.attrs['class']);

        const [key, ...values] = d;
        
        switch(values.length) {
            case 1:
                const [value] = values;
                const num = value.textContent.trim();
                result['overview'][key.textContent.trim()] = !isNaN(+num) ? parseInt(num) : num;
                break;
            default:
                const [data] = d;
                if(d.length != 0) {
                    let c = data.childNodes.filter(t => t.textContent.trim()).map(t => t.textContent.trim());
                    
                    const by_type = c.filter(t => grades.includes(t))[0];
                    if(by_type) c.splice(c.indexOf(by_type), 1);

                    const ects = c.filter(t => grades.includes(t))[0];
                    if(ects) c.splice(c.indexOf(by_type), 1);
                    
                    result['overview']['ETCS'] = ects;
                    result['overview']['Suoritukset kurssityypeittäin'] = by_type;
                } 
        }
    })

    result['overview']['Keskiarvo'] = (om.filter(g => !isNaN(+g)).reduce((sum, g) => (sum + parseInt(g)), 0) / om.filter(g => !isNaN(+g)).length).toFixed(2)
    result['overview']['Lukuaineiden keskiarvo'] = (am.filter(g => !isNaN(+g)).reduce((sum, g) => (sum + parseInt(g)), 0) / am.filter(g => !isNaN(+g)).length).toFixed(2)

    return result
}

const parseYOresults = (raw) => {
    const document = parse(raw);
    const result = [];

    const table = document.getElementsByTagName('table').at(1);
    table.getElementsByTagName('tr').slice(1).forEach(column => {
        const [subject, date, info, grade, rejected, points] = column.childNodes.map(c => c.textContent);

        const [pointsOverview, totalPoints] = points.split('=').map(n => n.trim());

        result.push({
            subject: {
                full: subject,
                short: subject.split(' ').at(0)
            },
            date: date == '----' ? null : date,
            info: info == '----' ? null : info,
            grade: grade == '----' ? null : grade,
            rejected: rejected == '----' ? null : rejected,
            points: points == '----' ? null : +totalPoints,
            pointsOvreview: points == '----' ? null : pointsOverview
        })
    })
    return result;
}

module.exports = {
    getGradeBook,
    getYOresults
}