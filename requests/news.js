const { parse } = require('node-html-parser');
const request = require('request');

const { news } = require('../requests/responses');

// https://espoo.inschool.fi/news/22854

const getNewsInbox = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/news`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve news', message: response, status: 501 });

            news.validateNewsGet(response)
                .then(() => {
                    try {
                        const list = parseNewsInbox(response.body);
                        return resolve(list);
                    } catch(err) {
                        return reject({err: 'Failed to parse the list of news', message: err, status: 500});
                    }
                })
                .catch(err => {
                    return reject(err);
                })
        });
    });
}

const getNewsById = (Wilma2SID, NewsID) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/news/${NewsID}`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };


        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve news', message: response, status: 501 });

            news.validateNewsGetByID(response)
                .then(() => {
                    try {
                        const list = parseNewsById(response.body);
                        return resolve(list);
                    } catch(err) {
                        return reject({err: 'Failed to parse the contant of the news', message: err, status: 500});
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    });
}

// Parser - v0.0.1 (13/06/2022)
const parseNewsInbox = (raw) => {
    const document = parse(raw);
    const sections = ['Pysyvät tiedotteet', 'Vanhat tiedotteet']
    const titles = [];
    const result = { 'Nykyiset tiedotteet': [] };

    document.getElementsByTagName('div').filter(div => div.rawAttrs = 'class="panel-body"' && div.childNodes.filter(el => el.rawTagName == 'h2').length > 0).forEach(div => {

        div.childNodes.forEach(c => {
            const data = c.rawText;

            if (c.rawTagName == 'h2') {
                titles.push(data);
                if (sections.includes(data)) {
                    result[data] = { news: [] }
                }
            }
            else if (c.rawTagName == 'div') {
                if (sections.includes(titles[titles.length - 1])) {
                    const subject = c.childNodes[0].text;
                    const href = c.childNodes[0].rawAttrs.split('href=')[1].replace('"', '');

                    result[titles[titles.length - 1]].news.push({ subject: subject, href: href });
                }
                else {
                    const subject = c.getElementsByTagName('h3')[0].text.trim();
                    const description = c.getElementsByTagName('p')[0] ? c.getElementsByTagName('p')[0].text : null;
                    const links = c.getElementsByTagName('span')[0].childNodes.filter(c => c.nodeType == 1);
                    const href = links[0].rawAttrs.split('href=')[1].replace('"', '');
                    const sender = links[1].rawAttrs;
                    const name = sender.split('title=')[1]
                    const link = sender.split(' ')[0].split('href=')[1] ? sender.split(' ')[0].split('href=')[1].replace('"', '') : null;

                    result['Nykyiset tiedotteet'].push({ date: titles[titles.length - 1], subject: subject, description: description, href: href, sender: { name: name, href: link } });
                }

            }
        });
    });

    return result;
}

// Parser - v0.0.1 (13/06/2022)
const parseNewsById = (raw) => {
    const document = parse(raw);
    const sections = ['Pysyvät tiedotteet', 'Vanhat tiedotteet', 'Viimeaikaiset tiedotteet'];

    const result = {
        title: null,
        data: []
    }

    result.title = document.getElementsByTagName('h2').filter(h2 => !sections.includes(h2.text))[0].text.trim();

    result.data = document.getElementById('news-content').childNodes.filter(c => c.toString().trim()).map(c => {
        switch (c.rawTagName) {
            case 'h2':
                return { title: c.text.trim().replace('\r\n', '') }
            case 'p':
                const data = c.childNodes.map(c => { return c.text.replace('\r\n', '') }).filter(d => d.trim());
                return { p: data.filter(d => d).join('') }
        }
    }).filter(c => c && (c.p || c.title));

    return result;
}

module.exports = {
    getNewsInbox,
    getNewsById
}