// import crypto from 'crypto';
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();
const generateRandomString = () => crypto.randomBytes(10).toString('hex');
const generateRandomInt = () => Math.floor(Math.random() * 1000000);

const createChallenge = (req, res) => {
    console.log("create challenge");
    const salt = generateRandomString();
    const secretNumber = generateRandomInt();
    const challenge = crypto.createHash('sha256').update(salt + secretNumber).digest('hex');
    const signature = crypto.createHmac('sha256', process.env.HMAC).update(challenge).digest('hex');

  res.json({
    algorithm: 'SHA-256',
    challenge,
    salt,
    signature,
  });
};


module.exports = createChallenge;
