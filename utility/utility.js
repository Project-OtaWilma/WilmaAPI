const { optional, options } = require('joi');
const { parse } = require('node-html-parser');

const wilmaRequest = (options = {
    url: '',
    method: 'GET',
    body: {},
    args: {},
    errors: {}
}, auth) => {

    if (!options.url) return reject({ err: `Invalid endpoint`, status: 500 })

    return new Promise((resolve, reject) => {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        if (auth) headers['Cookie'] = `Wilma2SID=${auth.Wilma2SID}`;

        const request = {
            'method': options.method,
            'url': options.url,
            'headers': headers,
            'followRedirect': false,
            ...options.args
        };

        if (options.body) request['body'] = JSON.stringify(options.body)

        request(request, (err, response) => {
            if (err) return reject({ err: `Failed to reach endpoint "${request.url}"`, status: 501 });

        });
    });
}

const parseCookie = (cookie) => {
    return new Promise(async (resolve, reject) => {
        try {
            const [key, ...value] = cookie.split('=');
            return resolve({ key: key, value: value.join('=').split(';'), raw: cookie });
        } catch (err) {
            return reject({ err: 'Failed to parse Cookie', message: err, status: 401 });
        }
    });
}

const parseStudent = (raw) => {
    return new Promise((resolve, reject) => {
        try {
            const document = parse(raw);
            const value = document.getElementById('formid').attrs.value;
            return resolve(value);
        } catch (err) {
            return reject({ err: 'Failed to parse studentID', message: err, status: 501 });
        }
    });
}

const parseTitle = (raw) => {
    return new Promise((resolve, reject) => {
        try {
            const document = parse(raw);
            const title = document.getElementsByTagName('title')[0].rawText.trim();
            return resolve(title);
        } catch (err) {
            return reject({ err: 'Failed to parse title', message: err, status: 501 });
        }
    });
}

const parseName = (raw) => {
    return new Promise((resolve, reject) => {
        try {
            const document = parse(raw);
            const nameElement = document.getElementsByTagName('span').filter(s => s.attrs.class == 'teacher')[0];

            return resolve({ username: nameElement.textContent });
        } catch (err) {
            return reject({ err: 'Failed to parse name', message: err, status: 501 });
        }
    });
}



module.exports = {
    cookies: {
        parseCookie
    },
    parsers: {
        parseStudent,
        parseTitle,
        parseName
    }
}