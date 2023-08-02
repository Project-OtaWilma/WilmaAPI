const { parse } = require('node-html-parser');
const request = require('request');
const { absences } = require('./responses');

const getAbsenceList = (auth, start = new Date(), end = new Date()) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/attendance/view?range=-3&first=${start.toLocaleDateString('Fi-fi')}&last=${end.toLocaleDateString('Fi-fi')}`,
            'headers': {
                'Cookie': `Wilma2SID=${auth.Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve gradebook', status: 501 });

            
            absences.validateAbsencesGet(response)
                .then(() => {
                    try {
                        const list = parseAbsences(response.body);
                        return resolve(list);
                    } catch (err) {
                        console.log(err);
                        return reject({ err: 'Failed to parse absences', message: err, status: 500 });
                    }
                })
                .catch(err => {

                    return reject(err);
                })
                
        });
    });
}


const parseAbsences = (raw) => {
    const mapping = {
        'Poissaolo (Selvitä)': 1,
        'Myöhästyminen': 2,
        'Luvallinen poissaolo - Terveydellinen': 111,
        'Luvallinen poissaolo - Koulun antamalla luvalla': 112,
        'Luvaton poissaolo': 21,
        'Muu koulun toiminta': 3,
        'Käy katsomassa Wilmassa': 4,
        'Luvallinen poissaolo - Muu syy': 113,
        // default: 0
    }
    
    const document = parse(raw);
    const result = {};

    const table = document.getElementsByTagName('tbody')[0];

    table.childNodes.filter(c => c.textContent.trim()).forEach(c => {
        const l = c.getElementsByTagName('td');
        const date = l.find(cc => !(!cc.attrs['align'])).textContent.trim().split('.').reverse().join('-');
        const raw = (new Date(date)).toLocaleDateString('Fi-fi', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('.').reverse().join('-');

        if (!result[raw]) result[raw] = {
            groups: [],
            events: []
        };

        l.filter(cc => (cc.attrs['class'] ?? '').includes('event')).forEach(cc => {
            let code = null;
            let data = null;
            let type = null;
            let teacher = null;
            let author = null;
            let description = null;

            const s = cc.attrs.title.split(';').map(c => c.trim());

            if (s.length > 2) {
                [code, type, info] = s;
                [description, teacher, author] = info.split('/').map(c => c.trim());
            } else {
                [code, data] = s;
                [type, teacher, author] = data.split('/').map(c => c.trim());
            }
            

            const event = {
                code,
                label: type,
                type: mapping[type] ?? 0,
                teacher: teacher ?? null,
                author: author ?? null,
                description: description ?? null,
            };

            result[raw].groups.push(code);
            result[raw].events.push(event);
        });

    })

    return result;
}

module.exports = {
    getAbsenceList
}