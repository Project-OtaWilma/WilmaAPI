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
            if (error) return reject({ error: 'Failed to retrieve gradebook', message: response, status: 501 });

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

/*
    Have fun...
*/

const parseGrades = (raw, limit, filter) => {
    const document = parse(raw);

    const grades = ['P', 'S', 'K'];
    const sections = [
        'Suoritukset kurssityypeittäin',
        'ECTS',
        'Lu21 pakollinen moduuli',
        'Lu21 valtakunnallinen valinnainen moduuli',
        'Lu21 paikallinen opintojakso',
        'Lu21 temaattiset opinnot -opintojakso',
        'Yhteensä'
    ];

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
        'Teemaopinnot',
        'Monitieteinen ajattelu',
        'Tutkiva työskentely teknologialla',
        'Osaaminen arjessa',
        'Lukiodiplomikurssit',
        'Taiteiden väliset kurssit',
        'Espoo-opinnot',
        'Teatteri ja ilmaisu',
        'Media',
        'Teatteri',
        'Media',
        'Lukiodiplomit',
        'Temaattiset opinnot',
        'Teknologia',
        'Kotitalous',
        'Käsityö',
        'OTA-opinnot',
        'Korkeakouluopinnot',
        'Lukiokoulutusta täydentävä oma äidinkieli (unkari)',
        'Lukiokoulutusta täydentävä oma äidinkieli (albania)',
        'Lukiokoulutusta täydentävä oma äidinkieli (englanti)',
        'Lukiokoulutusta täydentävä oma äidinkieli (espanja)',
        'Lukiokoulutusta täydentävä oma äidinkieli (portugali)',
        'Lukiokoulutusta täydentävä oma äidinkieli (puola)',
        'Lukiokoulutusta täydentävä oma äidinkieli (ranska)',
        'Lukiokoulutusta täydentävä oma äidinkieli (saksa)',
        'Lukiokoulutusta täydentävä oma äidinkieli (venäjä)',
        'Lukiokoulutusta täydentävä oma äidinkieli (arabia)',
        'Lukiokoulutusta täydentävä oma äidinkieli (farsi/dari)',
        'Lukiokoulutusta täydentävä oma äidinkieli (kurdi)',
        'Lukiokoulutusta täydentävä oma äidinkieli (mandariinikiina)',
        'Lukiokoulutusta täydentävä oma äidinkieli (somali)',
        'Lukiokoulutusta täydentävä oma äidinkieli (venäjä)',
        'Talous ja nuoret',
        'Muut opinnot',
        'Muualla suoritetut kurssit'
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

    // Good fucking luck debugging this

    const c = []; // Courses
    const titles = []; // Titles
    const s = []; // Subjects
    const am = []; // Average (mandatory)
    const om = []; // Average (optional)
    let r = {}; // Result

    document.getElementsByTagName('tr').forEach(tr => {
        tr.childNodes.filter(td => td.rawText.trim()).forEach(td => {

            td.childNodes.filter(td => (td.rawText.trim())).forEach(td => {
                const d = td.rawText.trim();

                if (sections.includes(d)) {
                    titles.push(d);
                    r['overview'] = r['overview'] ? r['overview'] : {};
                    r['overview'][d] = null;
                }
                else if (td.nodeType == 1 && Object.keys(r).length < (limit + 1)) {
                    if (subjectList.includes(d)) {
                        s.push(d);
                        r[d] = { grade: null, points: null, courses: {} }
                    }
                    else {
                        const h = d.split(' ')[0].trim();
                        c.push(d);
                        r[s[s.length - 1]].courses[d] = { code: h, grade: null, points: null, date: null, teacher: null, info: null }
                    }
                }
                else if (td.nodeType == 3) {
                    if (titles.length > 0) {
                        r['overview'][titles[titles.length - 1]] = d;
                    }
                    else if (Object.keys(r).length < (limit + 1)) {

                        if (d.split('.').length > 1) {
                            if (Object.keys(r[s[s.length - 1]].courses).length > 0) {
                                if (!r[s[s.length - 1]].courses[c[c.length - 1]].date) {
                                    r[s[s.length - 1]].courses[c[c.length - 1]].date = d;
                                }
                            }
                        }
                        else if (Number.isInteger(Number.parseInt(d)) || grades.includes(d)) {
                            if (!r[s[s.length - 1]].grade && s[s.length - 1] != 'Teknologia') {

                                if (Number.isInteger(Number.parseInt(d))) {
                                    if (!optionalSubjectList.includes(s[s.length - 1])) {
                                        am.push(Number.parseInt(d));
                                    }

                                    om.push(Number.parseInt(d));
                                }
                                r[s[s.length - 1]].grade = d;
                            }
                            else if (!r[s[s.length - 1]].points && s[s.length - 1] != 'Teknologia') {
                                r[s[s.length - 1]].points = d;
                            }
                            else if (Object.keys(r[s[s.length - 1]].courses).length > 0) {
                                if (!r[s[s.length - 1]].courses[c[c.length - 1]].grade) {
                                    r[s[s.length - 1]].courses[c[c.length - 1]].grade = d;
                                }
                                else if (!r[s[s.length - 1]].courses[c[c.length - 1]].points) {
                                    r[s[s.length - 1]].courses[c[c.length - 1]].points = d;
                                }
                            }

                        }
                        else {
                            if (Object.keys(r[s[s.length - 1]].courses).length > 0) {
                                if (!r[s[s.length - 1]].courses[c[c.length - 1]].teacher) {
                                    r[s[s.length - 1]].courses[c[c.length - 1]].teacher = d;
                                }
                                else if (!r[s[s.length - 1]].courses[c[c.length - 1]].info) {
                                    r[s[s.length - 1]].courses[c[c.length - 1]].info = d;
                                }
                            }
                        }
                    }
                }
            });


        })

    });

    if (s.length > limit) {
        delete r[s[s.length - 1]]
    }

    Object.keys(r).forEach(t => {
        if (!r[t]) {
            delete r[t];
        }
        else if (Object.keys(r[t]).includes(filter)) {
            delete r[t][filter];
        }
    });

    r['overview']['Keskiarvo'] = (om.reduce((a, b) => a + b, 0) / om.length).toFixed(2);
    r['overview']['Lukuaineiden keskiarvo'] = (am.reduce((a, b) => a + b, 0) / am.length).toFixed(2);

    return r;
}

module.exports = {
    getGradeBook,
}