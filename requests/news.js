const { parse } = require('node-html-parser');
const request = require('request');

const { news } = require('../requests/responses');

// https://espoo.inschool.fi/news/22854

const getNewsInbox = (Wilma2SID, path, limit) => {
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
                        const list = parseNewsInbox(response.body, path, limit);
                        return resolve(list);
                    } catch(err) {
                        console.log(err);
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

// rework
const parseNewsInbox = (raw, path, limit) => {
    console.log(path);
    const document = parse(raw);
    const sections = ['Pysyvät tiedotteet', 'Vanhat tiedotteet']
    const translations = {
        'Pysyvät tiedotteet': 'static',
        'Vanhat tiedotteet': 'old',
        'Nykyiset tiedotteet': 'current'
    };
    const titles = [];
    const result = { 'Nykyiset tiedotteet': {} };

    document.getElementsByTagName('div').filter(div => div.rawAttrs = 'class="panel-body"' && div.childNodes.filter(el => el.rawTagName == 'h2').length > 0).forEach(div => {

        div.childNodes.filter(c => c.rawTagName).forEach(c => {
            const data = c.rawText;
            // console.log([c.rawTagName, c.rawText.trim()]);
            switch(c.rawTagName) {
                case 'h2':
                    if(sections.includes(c.textContent.trim())) {
                        titles.push(c.textContent.trim());
                        if(path == c.textContent.trim()) {
                            result[c.textContent.trim()] = [];
                        }
                    }
                    else if(path == 'Nykyiset tiedotteet'){
                        result['Nykyiset tiedotteet'][c.textContent.trim()] = []
                        titles.push(c.textContent.trim());
                    }
                    break;
                case 'div':
                    if(c.childNodes.length > 1 && path == 'Nykyiset tiedotteet') {
                        console.log(path);
                        const newsData = {
                            title: null,
                            description: null,
                            href: null,
                            sender: {
                                name: null,
                                href: null
                            }
                        };

                        c.childNodes.filter(cc => ![0, 3].includes(cc.childNodes.length)).forEach(cc => {
                            switch(cc.childNodes.length) {
                                case 1:
                                    switch(cc.rawTagName) {
                                        case 'h3':
                                            newsData.title = cc.textContent.trim();
                                            break;
                                        case 'p':
                                            newsData.description = cc.textContent.trim();
                                            break;
                                    }
                                    // console.log({t: [cc.rawTagName, cc.textContent.trim()]});
                                    break;
                                case 5:
                                    cc.childNodes.filter(ccc => ccc.rawTagName == 'a').forEach(ccc => {
                                        console.log([ccc.toString()])
                                        switch(ccc.attrs.class) {
                                            case 'profile-link':
                                                newsData.sender.name = ccc.attrs.title;
                                                newsData.sender.href = ccc.attrs.href;
                                                break;
                                            default:
                                                newsData.href = ccc.attrs.href;
                                                break;
                                        }
                                    });
                                    break;
                            }
                        })

                        result['Nykyiset tiedotteet'][titles[titles.length - 1]].push(newsData);
                    }
                    else if(path == titles[titles.length - 1]) {
                        const element = c.childNodes[0];
                        if(element.textContent.trim()) {
                            const href = element.attrs ? element.attrs.href : null;
                            const title = element.textContent;
    
                            result[titles[titles.length - 1]].push(
                                {
                                    title: title,
                                    href: href
                                }
                            )
                        }

                    }
                    break;
            }
        });
    });
    
    return Array.isArray(result[path]) ? result[path].slice(0, limit) : Object.fromEntries(Object.entries(result[path]).slice(0, limit))
}

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