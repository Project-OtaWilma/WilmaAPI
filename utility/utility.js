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

const getStudentID = (Wilma2SID) => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://espoo.inschool.fi/schedule`,
            'headers': {
                'Cookie': `Wilma2SID=${Wilma2SID}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'followRedirect': false,
        };

        request(options, function (error, response) {
            if (error) return reject({ error: 'Failed to retrieve token required for schedule', message: response, status: 501 });

            // Validate response
            if(!response.body) { return reject({err: "Invalid credentials", status: 401}) }

            parseStudent(response.body)
                .then(studentID => {
                    return resolve(studentID);
                })
                .catch(err => {
                    return reject(err);
                })
        });
    });
}


module.exports = {
    cookies: {
        parseCookie
    },
    parsers: {
        parseStudent,
        parseTitle,
    },
    requests: {
        getStudentID
    }
}