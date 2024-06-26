import crypto from 'crypto';
import { hmacKey } from './hmac.js';

const verifySolution = (req, res) => {
  const payload = req.body.altcha;
  const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));

  const algOk = data.algorithm === 'SHA-256';
  const challengeOk = crypto.createHash('sha256').update(data.salt + data.number).digest('hex') === data.challenge;
  const signatureOk = crypto.createHmac('sha256', hmacKey).update(data.challenge).digest('hex') === data.signature;

  if (algOk && challengeOk && signatureOk) {
    res.json({ verified: true });
  } else {
    res.json({ verified: false });
  }
};

export default verifySolution;