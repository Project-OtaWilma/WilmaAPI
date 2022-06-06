const { parse } = require('node-html-parser');
const request = require('request');

const getGradeBook = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/choices?view=gradebook`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve gradebook', message: response, status: 501 });

            // Wilma2SID was incorrect
            if (response.body == '') return reject({ error: 'Invalid credentials', message: response.statusCode, status: 401 })

            const grades = parseGrades(response.body);
            console.log('Done');
            return resolve(grades);
        });
    });
}

const parseGrades = (raw) => {
    const document = parse(raw);
    const grades = ['P', 'S', 'K'];
    const sections = ['Suoritukset kurssityypeittäin', 'ECTS', 'Lu21 pakollinen moduuli', 'Lu21 valtakunnallinen valinnainen moduuli', 'Lu21 paikallinen opintojakso', 'Yhteensä'];
    const subjectList = [
        'Äidinkieli ja kirjallisuus, suomen kieli ja kirjallisuus',
        'Äidinkieli ja kirjallisuus, suomi toisena kielenä ja kirjallisuus',
        'Ruotsi, B1-oppimäärä',
        'Ruotsi, A1-oppimäärä',
        'Englanti, A-oppimäärä',
        'Espanja, A-oppimäärä',
        'Espanja, B2-oppimäärä',
        'Espanja, B3-oppimäärä',
        'Italia, B3-oppimäärä',
        'Ranska, A-oppimäärä',
        'Ranska, B2-oppimäärä',
        'Ranska, B3-oppimäärä',
        'Saksa, A-oppimäärä',
        'Saksa, B2-oppimäärä',
        'Saksa, B3-oppimäärä',
        'Venäjä, A-oppimäärä',
        'Venäjä, B2-oppimäärä',
        'Venäjä, B3-oppimäärä',
        'Kiina, B3-oppimäärä',
        'Japani, B3-oppimäärä',
        'Matematiikan yhteinen opintokokonaisuus',
        'Matematiikan pitkä oppimäärä',
        'Matematiikan lyhyt oppimäärä',
        'Biologia',
        'Maantiede',
        'Fysiikka',
        'Kemia',
        'Filosofia',
        'Psykologia',
        'Historia',
        'Yhteiskuntaoppi',
        'Uskonto/elämänkatsomustieto',
        'Terveystieto',
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
        'Lukiokoulutusta täydentävä oma äidinkieli (venäjä)',
        'Muut opinnot',
    ]
    const courses = [];
    const titles = [];
    const subjects = [];
    let result = {};

    document.getElementsByTagName('tr').forEach(tr => {
        tr.childNodes.filter(td => td.rawText.trim()).forEach(td => {

            td.childNodes.filter(td => (td.rawText.trim())).forEach(td => {
                const data = td.rawText.trim();

                // Titles
                if (sections.includes(data)) {
                    titles.push(data);
                    result[data] = null;
                }
                // Subjects
                else if (td.nodeType == 1) {
                    if (subjectList.includes(data)) {
                        console.log("subject: " + data);
                        subjects.push(data);
                        result[data] = { grade: null, points: null, courses: {} }
                    }
                    else {
                        courses.push(data);
                        result[subjects[subjects.length - 1]].courses[data] = { grade: null, points: null, date: null, teacher: null, info: null }
                    }
                }
                // Course information
                else if (td.nodeType == 3) {
                    // Date
                    if (titles.length > 0) {
                        result[titles[titles.length - 1]] = data;
                    }
                    else if (data.split('.').length > 1) {
                        if (Object.keys(result[subjects[subjects.length - 1]].courses).length > 0) {
                            if (!result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].date) {
                                result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].date = data;
                            }
                        }
                    }
                    //  Grades and points
                    else if (Number.isInteger(Number.parseInt(data)) || grades.includes(data)) {
                        if (!result[subjects[subjects.length - 1]].grade && subjects[subjects.length - 1] != 'Teknologia') {
                            result[subjects[subjects.length - 1]].grade = data;
                        }
                        else if (!result[subjects[subjects.length - 1]].points && subjects[subjects.length - 1] != 'Teknologia') {
                            result[subjects[subjects.length - 1]].points = data;
                        }
                        else if (Object.keys(result[subjects[subjects.length - 1]].courses).length > 0) {
                            if (!result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].grade) {
                                result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].grade = data;
                            }
                            else if (!result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].points) {
                                result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].points = data;
                            }
                        }

                    }
                    // Teacher and additional information
                    else {
                        if (Object.keys(result[subjects[subjects.length - 1]].courses).length > 0) {
                            if (!result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].teacher) {
                                result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].teacher = data;
                            }
                            else if (!result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].info) {
                                result[subjects[subjects.length - 1]].courses[courses[courses.length - 1]].info = data;
                            }
                        }
                    }
                }
            });


        })

    });
    return result;
}

module.exports = {
    getGradeBook,
}