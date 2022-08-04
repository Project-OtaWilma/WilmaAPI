const request = require('request');
const { parse } = require('node-html-parser');

const parseCookie = (cookie) => {
    return new Promise(async (resolve, reject) => {
        try {
            const [key, ...value] = cookie.split('=');
            return resolve({ key: key, value: value.join('=').split(';'), raw: cookie });
        } catch (err) {
            return reject({ err: 'Invalid login-credentials', message: err, status: 401 });
        }
    });
}

const parseStudent = (raw) => {
    return new Promise((resolve, reject) => {
        try {
            const document = parse(raw);
            const value =  document.getElementById('formid').attrs.value;
            return resolve(value);
        } catch(err) {
            return reject({err: 'Failed to parse studentID', message: err, status: 501});
        }
    });
}

const parseTitle = (raw) => {
    return new Promise((resolve, reject) => {
        try {
            const document = parse(raw);
            const title = document.getElementsByTagName('title')[0].rawText.trim();
            return resolve(title);
        } catch(err) {
            return reject({err: 'Failed to parse title', message: err, status: 501});
        }
    });
} 

const parseName = (raw) => {
    return new Promise((resolve, reject) => {
        try {
            const document = parse(raw);
            const nameElement = document.getElementsByTagName('span').filter(s => s.attrs.class == 'teacher')[0];

            return resolve({username: nameElement.textContent});
        } catch(err) {
            return reject({err: 'Failed to parse title', message: err, status: 501});
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