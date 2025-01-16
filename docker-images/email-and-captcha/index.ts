// Image is functional and ready for production use. Consult the docs for how to use it.

import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
const createChallenge = require("./challenge.js");
import type { Request, Response } from "express";

dotenv.config();

const app = express();
app.use(express.json());
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
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const gmail_transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        clientId: process.env.GMAIL_CLIENT,
        clientSecret: process.env.GMAIL_SECRET,
    },
});

app.post('/formbee/email-only', upload.none(), async (req: Request, res: Response) => {
    console.log("in email-only: ", req.body);
    let messageList: string[] = [];
    for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string' && value !== "") {
            messageList.push(`${key}: ${value}`);
        }
    }
    let niceMessage = messageList.join('\n\n');
    console.log("nice message: ", niceMessage);

    async function sendMail() {      

        if (process.env.GMAIL_TRUE == "True"){
            console.log("sending via oauth2.")
            const mailMessage = {
                from: process.env.EMAIL_USER,
                to: [process.env.EMAIL_TO!],
                subject: 'New Form Submission',
                text: `${niceMessage}`,
                auth: {
                    user: process.env.EMAIL_USER,
                    refreshToken: process.env.GMAIL_REFRESH,
                    accessToken: process.env.GMAIL_ACCESS,
                    expires: 1484314697598,
                },
            };

            gmail_transporter.sendMail(mailMessage, (error: any) => {
                if (error) {
                    res.status(500).json(`Error sending email ${error}`);
                } else {
                    res.json('Email sent successfully');
                }
            });
        } else {
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
    }

    await sendMail();
});

app.get('/challenge', async (req, res) => {
    createChallenge(req, res);
});


app.get("/", (req: Request, res: Response) => {
    res.send("Formbee Email-Only is running");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log("ctrl+c x2 to exit");
});
