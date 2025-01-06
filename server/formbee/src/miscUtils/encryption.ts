import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

export const encrypt = (text: string): string => {
    if (!text) return text; // Handle null case
    const iv = crypto.randomBytes(16); // Must be 16 bytes for AES
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (hash: string): string => {
    if (!hash) return hash; // Handle null case
    const [ivString, encryptedText] = hash.split(':');
    const iv = Buffer.from(ivString, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};