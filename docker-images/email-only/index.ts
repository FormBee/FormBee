import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import type { Request, Response } from "express";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-altcha-spam-filter', 'x-api-key'],
};

app.use(cors(corsOptions));

// Use multer to handle form data
const upload = multer();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_PROVIDER,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

app.post('/formbee/email-only', upload.none(), async (req: Request, res: Response) => {
    console.log("in email-only: ", req.body);
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
        transporter.sendMail(mailMessage, (error: any) => {
            if (error) {
                res.status(500).json('Error sending email');
            } else {
                res.json('Email sent successfully');
            }
        });
    }

    await sendMail();
});

app.get("/", (req: Request, res: Response) => {
    res.send("Formbee Email-Only is running");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log("ctrl+c x2 to exit");
});
