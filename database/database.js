const mysql = require('mysql');
const moment = require('moment');
const { DATETIME } = require('mysql/lib/protocol/constants/types');

const pool = mysql.createPool({
    connectionLimit: 10,
    password: '',
    user: 'root',
    database: 'wilma_api',
    host: 'localhost',
    port: 3306
});


const Authenticate = (apiKey) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM api_keys WHERE key_value = ?';

        pool.query(query, [apiKey], (err, results) => {
            if (err) return reject({ errorCode: err.code, status: err });

            // invalid api-key
            if (!results[0]) return reject({ errorCode: 401, status: 'Invalid api-key' });

            const key = results[0];
            const since_last_used = (Date.now() - new Date(key.key_last_used)) / 1000;

            // rate-limit
            if (since_last_used < key.key_time_limit) return reject({ errorCode: 401, status: `Rate-limit violation - this api-key's rate-limit is set to one request / ${key.key_time_limit}s` });

            // key-uses 
            if (key.key_use_count >= key.key_max_uses) return reject({ errorCode: 401, status: `Request-limit violation - this api-key's maximium request-count is set to ${key.key_max_uses} / day` })

            // use the key once
            const query = 'UPDATE api_keys SET key_use_count=?, key_last_used=NOW() WHERE keyid=?';
            pool.query(query, [key.key_use_count + 1, key.keyid], (err, results) => {
                if (err) return reject({ errorCode: err.code, status: err });

                return resolve(results);
            });

        });
    });
}

module.exports = {
    authentication: {
        Authenticate
    }
};