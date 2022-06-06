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

module.exports = {
    parseCookie
}