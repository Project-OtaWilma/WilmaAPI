const jwt = require('jsonwebtoken');

const { signature } = require('./secret.json');

const signToken = (payload = {}) => {
    return jwt.sign(payload, signature, { });
}

const validateToken = (req, res) => {
    return new Promise((resolve, reject) => {
        const a = ['Wilma2SID', 'StudentID', 'username', 'iat'];
        const token = req.headers.token;

        if (!token) {
            res.status(401).json({ err: 'Missing authentication parameters: ["token"]', status: 401 });
            return resolve(null);
        }

        jwt.verify(token, signature, (err, decoded) => {
            if (err) {
                res.status(401).json({ err: 'Received invalid jwt token', status: 401 })
                return resolve(null);
            }

            const keys = Object.keys(decoded);

            if (keys.length != a.length || !(keys.filter(x => a.includes(x)).length == a.length)) {
                res.status(400).json({ err: 'jwt token must only contain fields ["Wilma2SID", "StudentID", "username"]', status: 400 })
                return resolve(null);
            }

            return resolve(decoded);
        });
    });

}

module.exports = {
    signToken,
    validateToken
}