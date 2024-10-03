import express, { Request, Response } from 'express';
import * as nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465, // Change global port var to match your email provider's port, at the top of the file.
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASSWORD // your email password
    },
});

app.post('/formbee/email-only', async (req, res) => {
    console.log("in email-only");
    let messageList = [];
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string' && value !== "") {
                messageList.push(`${key}: ${value}`);
            }
        }
    let niceMessage = messageList.join('\n\n');
    console.log("nice message: ", niceMessage);
    async function sendMail() {      
        const mailMessage = {
            from: process.env.EMAIL_USER,
            to: [process.env.EMAIL_TO!],
            subject: 'New Form Submission',
            text: `${niceMessage}`,
        };
        transporter.sendMail(mailMessage, (error) => {
            if (error) {
                res.status(500).json('Error sending email');
            } else {
                res.json('Email sent successfully');
            }
        });
    }
    await sendMail();
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});