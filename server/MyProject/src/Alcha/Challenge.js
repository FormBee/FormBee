// import crypto from 'crypto';
const crypto = require('crypto');
const hmacKey = 'a5b8c3d7e4f6g1h9i2j0k4l8m7n3o5p9';
const generateRandomString = () => crypto.randomBytes(10).toString('hex');
const generateRandomInt = () => Math.floor(Math.random() * 1000000);

const createChallenge = (req, res) => {
    console.log("create challenge");
    const salt = generateRandomString();
    const secretNumber = generateRandomInt();
    const challenge = crypto.createHash('sha256').update(salt + secretNumber).digest('hex');
    const signature = crypto.createHmac('sha256', hmacKey).update(challenge).digest('hex');
    console.log(challenge);
    console.log(signature);

  res.json({
    algorithm: 'SHA-256',
    challenge,
    salt,
    signature,
  });
};


module.exports = createChallenge;
