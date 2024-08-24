import * as express from "express";
import * as bodyParser from "body-parser";
import * as nodemailer from "nodemailer";
import * as cors from "cors";
import * as dotenv from "dotenv";
import * as cron from 'node-cron';
import * as session from "express-session";
const { google } = require('googleapis');
import * as crypto from "crypto";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./routes";
import { User } from "./entity/User";
import createChallenge = require("./Alcha/Challenge.js");
import axios from 'axios';

// const redirectUrl = "https://ibex-causal-painfully.ngrok-free.app";
const redirectUrl = "http://localhost:4200";
// const redirectUrl = "https://formbee.dev";

dotenv.config();
AppDataSource.initialize().then(async () => {

    // create express app
    const app = express();
    app.use(bodyParser.json());
    const corsOptions = {
        origin: ['http://localhost:4200', 'https://ibex-causal-painfully.ngrok-free.app', 'https://formbee.dev'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'x-altcha-spam-filter', 'x-api-key'],
    };
    app.use(cors(corsOptions));
    

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465, // or 587 for TLS
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.ZOHO_USER, // your Zoho email address
            pass: process.env.ZOHO_PASSWORD // your Zoho email password
        },
    });
    


    app.use(session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
    }));


    // Basic post route, sends form data to the users email.
    app.post('/formbee/:apikey', (req, res) => {
        const { apikey } = req.params;
        const { name, email, message } = req.body;
        let messageList = [];
            // Loop through the message object and format it to be sent to Telegram
            for (const [key, value] of Object.entries(req.body)) {
                if (typeof value === 'string') {
                    messageList.push(`${key}: ${value}`);
                } else if (Array.isArray(value)) {
                    messageList.push(`${key}: ${value.join(', ')}`);
                } else {
                    messageList.push(`${key}: ${JSON.stringify(value)}`);
                }
            }
        let niceMessage = messageList.join('\n\n');
        //wrap nice message in ``` to make it look better
        let niceMessageDiscord = `\`\`\`${niceMessage}\`\`\``;
        // Find the user in the database with API key, then increment the current submissions
        AppDataSource.manager.findOne(User, { where: { apiKey: apikey } })
            .then(async user => {
                if (!user) {
                    console.log("User not found!");
                    res.status(401).json('Unauthorized');
                    return;
                } else if (user.maxSubmissions && user.currentSubmissions >= user.maxSubmissions || user.localHostMaxSubmissions && user.localHostCurrentSubmissions >= user.localHostMaxSubmissions) {
                    console.log("Reached submission limit");
                    res.status(403).json('You have reached your submission limit');
                    return;
                } else {
                    console.log("origin: ", req.headers.origin);
                    if (user.allowedDomains.length === 0 || user.allowedDomains.some(domain => req.headers.origin.includes(domain)) || req.headers.origin.includes("localhost")) {
                        console.log("allowed domain");
                    } else {
                        console.log("not allowed domain");
                        res.status(403).json('You are not allowed to submit from this domain');
                        return;
                    }
                    const recEmail = user.email;
                    // check if the users origin was from the local host
                    if (req.headers.origin.includes("localhost")) {
                        // add back in for prod
                        // user.localHostCurrentSubmissions++;
                        await sendMail(recEmail, name, email, message, null, res);
                        if (user.returnBoolean === true) {
                            const returnEmail = email;
                            axios.post('http://localhost:3000/formbee/return/' + apikey, {
                                emailToSendTo: returnEmail,
                            });

                        }
                        if (user.telegramChatId != null && user.telegramBoolean) {
                            console.log("Sendding to telegram");
                            axios.post('http://localhost:3000/telegram/send/' + user.githubId, {
                                message: req.body,
                            });
                        }

                        if (user.discordWebhook != null && user.discordBoolean) {
                            console.log("Discord webhook");
                            const sendMessage = async (message) => {
                                console.log("Sendding to discord");
                                console.log(user.discordWebhook, message);
                                await axios.post(user.discordWebhook, {
                                    content: message,
                                });
                              };
                            await sendMessage(niceMessageDiscord);
                            }
    
                            if (user.slackChannelId != null && user.slackAccessToken != null && user.slackBoolean) {
                                console.log("Sendding to slack");
                                const sendMessage = async (message) => {
                                    console.log("Sendding to slack");
                                    await axios.post(`http://localhost:3000/slack/send-message`, {
                                        message,
                                        slackChannelId: user.slackChannelId,
                                        slackAccessToken: user.slackAccessToken,
                                    });
                                };
                                await sendMessage(niceMessageDiscord);
                            }
                            if (user.makeBoolean === true && user.makeWebhook != null) {
                                console.log("Sendding to make");
                                axios.post('http://localhost:3000/make/' + apikey, {
                                    message: req.body,
                                });
                            }
                            if (user.n8nBoolean === true && user.n8nWebhook != null)
                            axios.post('http://localhost:3000/n8n/send/' + apikey, {
                                message: req.body,
                            });

                            if (user.webhookBoolean === true && user.webhookWebhook != null)
                            axios.post('http://localhost:3000/webhook/send/' + apikey, {
                                message: req.body,
                            });


                    return AppDataSource.manager.save(user);


                    // else the user is not from the local host, we need to update the current submissions
                    } else {
                        console.log("Not local host");
                        if (user.returnBoolean === true) {
                            const returnEmail = email;
                            axios.post('http://localhost:3000/formbee/return/' + apikey, {
                                emailToSendTo: returnEmail,
                            });

                        }
                        if (user.telegramChatId != null && user.telegramBoolean) {
                            console.log("Sendding to telegram");
                            axios.post('http://localhost:3000/telegram/send/' + user.githubId, {
                                message: req.body,
                            });
                        }

                        if (user.discordWebhook != null && user.discordBoolean) {
                        console.log("Discord webhook");
                        const sendMessage = async (message) => {
                            console.log("Sendding to discord");
                            console.log(user.discordWebhook, message);
                            await axios.post(user.discordWebhook, {
                                content: message,
                            });
                          };
                        await sendMessage(niceMessageDiscord);
                        }

                        if (user.slackChannelId != null && user.slackAccessToken != null && user.slackBoolean) {
                            console.log("Sendding to slack");
                            const sendMessage = async (message) => {
                                console.log("Sendding to slack");
                                await axios.post(`http://localhost:3000/slack/send-message`, {
                                    message,
                                    slackChannelId: user.slackChannelId,
                                    slackAccessToken: user.slackAccessToken,
                                });
                            };
                            await sendMessage(niceMessageDiscord);
                        }
                        user.currentSubmissions++;
                        return AppDataSource.manager.save(user);
                    }
                }
            })
            .catch(error => {
                res.status(500).json('Internal Server Error');
            });

        async function sendMail(recEmail, name, email, message, file, res) {        
            const mailMessage = {
                from: process.env.ZOHO_USER,
                to: [recEmail,],
                subject: 'New form submission',
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
                attachments: file ? [{ filename: file.originalname, content: file.buffer }] : [],
            };

            transporter.sendMail(mailMessage, (error) => {
                if (error) {
                    console.error(error);
                    res.status(500).json('Error sending email');
                } else {
                    res.json('Email sent successfully');
                }
            });
        }
    });


    // Sends the return email to the user's client's.
app.post('/formbee/return/:apikey', async (req, res) => {

    const isValidEmail = async (email: string): Promise<boolean> => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        console.log(emailRegex.test(email))
        return emailRegex.test(email);
    }

    try {
        const { emailToSendTo } = req.body;
            const apiKey = req.params.apikey;
            const user = await AppDataSource.manager.findOne(User, { where: { apiKey } });
            if (!user) {
                res.status(400).send('User not found');
                return;
            } else {
                const email = user.fromEmail;
                const accessToken = user.fromEmailAccessToken;
                const refreshToken = user.fromEmailRefreshToken;
                const smtpHost = user.smtpHost;
                const smtpPort = user.smtpPort;
                const smtpUsername = user.smtpUsername;
                const smtpPassword = user.smtpPassword;
                const emailSubject = user.emailSubject;
                const emailBody = user.emailBody;
                const returnMessage = user.returnBoolean;
                if (smtpHost && smtpPort && smtpUsername && smtpPassword && emailSubject && emailBody && returnMessage && await isValidEmail(emailToSendTo) === true) {
                    const transporter = nodemailer.createTransport({
                        host: smtpHost,
                        port: smtpPort,
                        secure: true,
                        auth: {
                            user: smtpUsername,
                            pass: smtpPassword,
                        },
                    });
                    const mailMessage = {
                        from: smtpUsername,
                        to: emailToSendTo,
                        subject: emailSubject,
                        text: emailBody,
                    }
                    transporter.sendMail(mailMessage, (error) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json('Error sending email');
                        } else {
                            res.json({ message: 'Email sent successfully' });
                        }
                    });
                } else if (email && accessToken && refreshToken && await isValidEmail(emailToSendTo) === true) {

                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            type: 'OAuth2',
                            user: email,
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            clientId: process.env.GOOGLE_CLIENT_ID,
                            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                        },
                    });
                    const mailMessage = {
                        from: email,
                        to: emailToSendTo,
                        subject: emailSubject,
                        text: emailBody,
                    }
                    transporter.sendMail(mailMessage, (error) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json('Error sending email');
                        } else {
                            res.json({ message: 'Email sent successfully' });
                        }
                    });
                } else {
                    return
                }
            }

        } catch (error) {
            res.status(500).json({ error: 'Failed to send email' });
        }
    });

    app.get('/challenge', (req, res) => {
        createChallenge(req, res);
    });


    app.get('/auth/github', (req, res) => {
        console.log("in auth github");
        const githubAuthUrl = 'https://github.com/login/oauth/authorize';
        const clientId = process.env.GITHUB_CLIENT_ID;
        console.log("client id: ", clientId);
        res.redirect(`${githubAuthUrl}?client_id=${clientId}`);
    });

    app.post('/telegram/toogle/:githubId', async (req, res) => {
        const { githubId } = req.params;
        const { telegramBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.telegramBoolean = telegramBoolean;
            await AppDataSource.manager.save(user);
            console.log("Telegram settings updated successfully", user.telegramBoolean);
            res.json({ message: 'Telegram settings updated successfully' });
        }
    });

    app.post('/discord/toogle/:githubId', async (req, res) => {
        const { githubId } = req.params;
        const { discordBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.discordBoolean = discordBoolean;
            await AppDataSource.manager.save(user);
            console.log("Discord settings updated successfully", user.discordBoolean);
            res.json({ message: 'Discord settings updated successfully' });
        }
    });

    app.post('/discord/webhook/:githubId', async (req, res) => {
        const { githubId } = req.params;
        const { discordWebhook } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.discordWebhook = discordWebhook;
            await AppDataSource.manager.save(user);
            res.json({ message: 'Discord webhook settings updated successfully' });
        }
    });
    
    app.get('/auth/github/callback', async (req, res) => {
        const code = req.query.code;
    
        try {
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });
    
            const tokenData = tokenResponse.data;
            if (!tokenData.access_token) {
                throw new Error('Access token not found in the response');
            }
            let githubdata = await axios.get(`https://api.github.com/user`, {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            });
            //Check if the github id is already in our database. 
            const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubdata.data.id } });
            const getSameDayNextMonth = async (date: Date) => {
                let nextMonth = new Date(date);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
            
                // Handle edge cases where the next month might have fewer days
                if (nextMonth.getDate() < date.getDate()) {
                    nextMonth.setDate(0); // Sets to the last day of the previous month
                } 
                return nextMonth;
            }
            let currentDate = new Date();
            let sameDayNextMonth = await getSameDayNextMonth(currentDate);
            if (!user) {
                await AppDataSource.manager.save(
                    AppDataSource.manager.create(User, {
                        name: githubdata.data.login,
                        githubId: githubdata.data.id,
                        apiResetDate: sameDayNextMonth,
                    })
                );
            console.log(redirectUrl + "/login?token=" + tokenData.access_token);
            res.redirect( redirectUrl + "/login?token=" + tokenData.access_token);
            } else {
                res.redirect( redirectUrl + "/login?token=" + tokenData.access_token);
            }
        } catch (error) {
            console.error('Error fetching access token:', error);
            res.status(500).send('Internal Server Error');
        }
    });


    //Route for creating a new API key for the user
    app.post('/create-api-key/:githubId', (req, res) => {
        const githubId = parseInt(req.params.githubId);
        console.log("in create-api-key: ", githubId)
        const userPromise = AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        userPromise.then(user => {
            if (!user) {
                res.status(401).json('Unauthorized');
                return;
            }
            //add if back in for production

            // if (user.apiKey) {
            //     res.status(401).json('Cannot create a new API key, if you wish to change your API key, press the regenerate button');
            //     return;
            // }
            console.log("Creating new API key");
            const { v4: uuidv4 } = require('uuid');
            // real
            user.apiKey = uuidv4();
            // fake
            // user.apiKey = null;
            AppDataSource.manager.save(user)
            .then(() => {
                res.json({ apiKey: user.apiKey });
            })
            .catch(error => {
                res.status(500).json('Internal Server Error');
            });
        });
    });


    // Delete old API key, create new one
    app.post('/regenerate-api-key/:githubId', (req, res) => {
        const githubId = parseInt(req.params.githubId);
        console.log("in regenerate-api-key: ", githubId)
        const userPromise = AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        userPromise.then(user => {
            console.log("Regenerating API key: ", user);
            if (!User) {
                res.status(401).json('Unauthorized');
                return;
            }
            console.log("Creating new API key");
            const { v4: uuidv4 } = require('uuid');
            // real
            user.apiKey = uuidv4();
            AppDataSource.manager.save(user)
            .then(() => {
                res.json({ apiKey: user.apiKey });
            })
            .catch(error => {
                res.status(500).json('Internal Server Error');
            });
        });
    });


    // Fetch the user by their github id
    app.get('/api/user/:githubId', (req: Request, res: Response) => {
        const githubId = parseInt(req.params.githubId, 10);
        if (isNaN(githubId)) {
            res.status(400).json('Invalid GitHub ID');
            return;
        }
        // console.log("Github ID: ", githubId);
        AppDataSource.manager.findOne(User, { where: { githubId } })
            .then(user => {
                // console.log("User: ", user);
                if (User) {
                    res.json(user);
                    console.log("User: ", user);
                } else {
                    console.log("user: ", user);
                    res.status(404).json('User not found');
                }
            })
            .catch(error => {
                res.status(500).json('Internal Server Error');
            });
    });


    // // Update email
    app.post('/update-email/:githubId', (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const userPromise = AppDataSource.manager.findOne(User, { where: { githubId } });
        userPromise.then(user => {
            if (User) {
                user.email = req.body.email;
                return AppDataSource.manager.save(user)
            }
            res.status(404).json('User not found');
        })
        .catch(error => {
            res.status(500).json('Internal Server Error');
        });
    });

    // Telegram oauth

    app.get('/oauth/telegram/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId);
        console.log("in telegram oauth: ", githubId);
        const verifyTelegramHash = (authData, botToken) => {
            const secretKey = crypto.createHash('sha256').update(botToken).digest();
            const dataCheckString = Object.keys(authData)
                .filter(key => key !== 'hash')
                .sort()
                .map(key => `${key}=${authData[key]}`)
                .join('\n');
        
            const hmac = crypto.createHmac('sha256', secretKey)
                .update(dataCheckString)
                .digest('hex');
        
            return hmac === authData.hash;
        };
        
        const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.query;
        console.log(req.query);
        const botToken = process.env.TELEGRAM_API_TOKEN;
    
        try {
            const isValid = await verifyTelegramHash(req.query, botToken);

            if (isValid) {
                const sendTelegramMessage = async (chatId, message) => {
                    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
                
                    try {
                        console.log
                        await axios.post(url, {
                            chat_id: chatId,
                            text: message,
                        });
                    } catch (error) {
                        console.error('Error sending message:', error);
                    }
                };
                await sendTelegramMessage(id, `Hi ${first_name}! Formbee will now be sending your form submission data to this chat!`);

                const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
                if (!user) {
                    res.status(400).send('User not found');
                    return;
                } else {
                    user.telegramChatId = Number(id);
                    await AppDataSource.manager.save(user);
                    res.redirect(redirectUrl + "/dashboard");
                    return;
                }
                // The hash is valid, process user data
            } else {
                // Invalid hash
                res.status(400).send('Invalid request');
            }
        } catch (error) {
            console.error('Error verifying Telegram hash:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post('/telegram/send/:githubId', async (req, res) => {
        console.log("in telegram send");
        const githubId = parseInt(req.params.githubId);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            console.log("in the else...");
            const message = req.body.message;
            let messageList = [];
            // Loop through the message object and format it to be sent to Telegram
            for (const [key, value] of Object.entries(message)) {
                if (typeof value === 'string') {
                    messageList.push(`${key}: ${value}`);
                } else if (Array.isArray(value)) {
                    messageList.push(`${key}: ${value.join(', ')}`);
                } else {
                    messageList.push(`${key}: ${JSON.stringify(value)}`);
                }
            }
            // Join the formatted message list into a single string
            const formattedMessage = messageList.join('\n\n');

            console.log("formatted message: ", formattedMessage);
            console.log("message: ", message);

            message
            const sendTelegramMessage = async (chatId, message) => {
                const url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`;
                console.log("telegram url: ", url);
            
                try {
                    console.log("in the try...");
                    await axios.post(url, {
                        chat_id: chatId,
                        text: message,
                    });
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            };
            await sendTelegramMessage(user.telegramChatId, formattedMessage);

        }
    });

    app.post('/telegram/unlink/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            const url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`;
            await axios.post(url, {
                chat_id: user.telegramChatId,
                text: "Formbee will no longer be sending your form submission data to this chat!",
            });
            user.telegramChatId = null;
            await AppDataSource.manager.save(user);
            res.json({ message: 'Telegram unlinked successfully' });
        }
    });


    // Google OAuth
    app.get('/oauth/google/:githubId', async(req, res) => {
        console.log("in google oauth");
        const githubId = parseInt(req.params.githubId);  // Convert githubId to integer
        const user = await AppDataSource.manager.findOne(User, { where: { githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else if (user.fromEmailAccessToken) {
            user.smtpHost = null;
            user.smtpPort = null;
            user.smtpUsername = null;
            user.smtpPassword = null;
            console.log("User: ", user);
            await AppDataSource.manager.save(user);
            res.redirect(redirectUrl + "/dashboard");
            return;
        } else {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                "http://localhost:3000/google/callback"
            );
            
            const scopes = [
                'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/gmail.compose',
                "https://mail.google.com/"
            ];
            
            const stateValue = {
                state: crypto.randomBytes(32).toString('hex'),
                githubId
            };
            const state = Buffer.from(JSON.stringify(stateValue)).toString('base64');
            
            // Store state in the session (assumes session middleware is set up)
            const session = (req as any).session; // Cast to any to bypass TypeScript error
            if (session) {
                session.state = state;
            } else {
                res.status(500).json('Session not available');
            }
            
            // Generate a url that asks permissions for the Drive activity scope
            const authorizationUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes,
                include_granted_scopes: true,
                state: state
            });
            res.redirect(authorizationUrl);
        }
    });

    // Google OAuth callback
    app.get("/google/callback", async (req, res) => {
        try {
        
            const { code, state } = req.query;
            
            if (typeof state !== 'string') {
                res.status(400).send('Invalid state parameter');
                return;
            }
            
            // Decode state to retrieve the githubId
            const stateValue = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
            const { githubId } = stateValue;

            // Get the user with the githubId
    
            const data = {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: "http://localhost:3000/google/callback",
                grant_type: "authorization_code",
            };
        
        
            // Exchange authorization code for access token & id_token
            const response = await axios({
                url: "https://oauth2.googleapis.com/token",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                data: JSON.stringify(data),
            });
    
            const access_token_data = response.data;
            const { access_token, refresh_token } = access_token_data;
            // Fetch user profile with the access token
            const userInfoResponse = await axios({
                url: "https://www.googleapis.com/oauth2/v1/userinfo",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
        
            const userInfo = userInfoResponse.data;
        
            // Extract email and other desired info
            const userEmail = userInfo.email;

            const user = await AppDataSource.manager.findOne(User, { where: { githubId } });
            if (!user) {
                res.status(400).send('User not found');
                return;
            } else {
                // Add google credentials to user
                user.fromEmailAccessToken = access_token;
                user.fromEmailRefreshToken = refresh_token;
                user.fromEmail = userEmail;
                // Remove smtp credentials
                user.smtpHost = null;
                user.smtpPort = null;
                user.smtpUsername = null;
                user.smtpPassword = null;
                console.log("User: ", user);
                await AppDataSource.manager.save(user);
                
                res.redirect(redirectUrl + "/dashboard");
            }
        
            // Redirect to your application's dashboard or handle information as needed
        } catch (error) {
            console.error('Error during OAuth callback:', error);
            res.status(500).json({ error: 'An error occurred during the authentication process' });
        }
    });

    app.post('/update-return-settings/:githubId', async (req: Request, res: Response) => {
        const githubId = parseInt(req.params.githubId);
        const { smtpHost, smtpPort, smtpUsername, smtpPassword, emailSubject, emailBody, returnMessage } = req.body;
        try {
            console.log(req.body)
            const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
            if (!user) {
                res.status(400).send('User not found');
                return;
            } else {
                user.returnBoolean = returnMessage;
                user.emailSubject = emailSubject;
                user.emailBody = emailBody;
                await AppDataSource.manager.save(user);
                user.smtpHost = smtpHost;
                user.smtpPort = smtpPort;
                user.smtpUsername = smtpUsername;
                user.smtpPassword = smtpPassword;
                user.fromEmailAccessToken = null;
                user.fromEmail = null;
                user.fromEmailRefreshToken = null;
                res.json({ message: 'Settings updated successfully' });
                if (smtpHost && smtpPort && smtpUsername && smtpPassword) {
                    await AppDataSource.manager.save(user);
                }
            }

        } catch (error) {
            console.error('Error during update return settings:', error);
            res.status(500).json({ error: 'An error occurred during the update process' });
        }
    });

    app.post('/slack/toogle/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const { slackBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.slackBoolean = slackBoolean;
            await AppDataSource.manager.save(user);
            console.log("Slack settings updated successfully", user.slackBoolean);
            res.json({ message: 'Slack settings updated successfully' });
        }
    });

    app.get('/slack/callback', async (req, res) => {
        console.log("in slack callback");
        try {
            const { code, state } = req.query;
            let githubId = state;
            if (typeof state !== 'string') {
                res.status(400).send('Invalid state parameter');
                return;
            }
            // Decode state to retrieve the githubId
            const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
                params: {
                    code,
                    client_id: process.env.SLACK_CLIENT_ID,
                    client_secret: process.env.SLACK_CLIENT_SECRET,
                    redirect_uri:  "https://ibex-causal-painfully.ngrok-free.app/slack/callback",
                },
            });
            const { access_token } = response.data;
            let { channel_id, channel }= response.data.incoming_webhook;
            console.log(response.data)

            try {
                const response = await axios.post(
                    'https://slack.com/api/chat.postMessage', 
                    {
                        channel: channel_id,
                        text: "Hello Formbee will be sending form data in this channel!",
                    },
                    { 
                        headers: { 
                            'Authorization': `Bearer ${access_token}`,
                        } 
                    }
                );
                if (response.data.ok) {
                    console.log('Message sent successfully');
                }
            } catch (error) {
                console.error('Request failed:', error);
            }

            // Get the user with the githubId
            const user = await AppDataSource.manager.findOne(User, { where: { githubId: Number(githubId) } });
                if (!user) {
                    res.status(400).send('User not found');
                    return;
                } else {
                    user.slackChannelId = channel_id;
                    user.slackAccessToken = access_token;
                    user.slackChannelName = channel
                    await AppDataSource.manager.save(user);
                    res.redirect(redirectUrl + "/dashboard");
                }
        } catch (error) {
            console.error('Error during OAuth callback:', error);
            res.status(500).json({ error: 'An error occurred during the authentication process' });
        }
    });
    
    app.post('/slack/send-message', async (req, res) => {
        const { message, slackChannelId, slackAccessToken } = req.body;
            try {
                const response = await axios.post(
                    'https://slack.com/api/chat.postMessage', 
                    {
                        channel: slackChannelId,
                        text: message,
                    },
                    { 
                        headers: { 
                            'Authorization': `Bearer ${slackAccessToken}`,
                        } 
                    });
                if (response.data.ok) {
                    console.log('Message sent successfully');
                }
            } catch (error) {
                console.error('Request failed:', error);
            }
        }
    );
        
    app.post('/slack/unlink/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.slackChannelId = null;
            user.slackAccessToken = null;
            user.slackChannelName = null;
            await AppDataSource.manager.save(user);
            res.json({ message: 'Slack unlinked successfully' });
        }
    });

    // Make integration
    app.post('/make/:apikey', async (req, res) => {
            const githubId = req.params.apikey;
            const message = req.body;
            const user = await AppDataSource.manager.findOne(User, { where: { apiKey: githubId } });
            if (!user) {
                res.status(400).send('User not found');
                return;
            } else {
                try {
                    console.log("Sendding to make in try? why?");
                    // Send form data to Make.com
                    await axios.post(user.makeWebhook, message);
                    res.status(200).send('Form submitted successfully');
                  } catch (error) {
                    console.error('Error sending data to Make.com:', error);
                    res.status(500).send('Internal Server Error');
                  }
            }

    });

    app.post('/make/toogle/:apikey', async (req, res) => {
        const githubId = req.params.apikey;
        const { makeBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.makeBoolean = makeBoolean;
            await AppDataSource.manager.save(user);
            console.log("Make settings updated successfully", user.makeBoolean);
            res.json({ message: 'Make settings updated successfully' });
        }
    });

    app.post('/make/unlink/:apikey', async (req, res) => {
        const githubId = req.params.apikey;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.makeWebhook = null;
            await AppDataSource.manager.save(user);
            res.json({ message: 'Make unlinked successfully' });
        }
    });

    app.post('/make/webhook/:apikey', async (req, res) => {
        const githubId = req.params.apikey;
        const { makeWebhook } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.makeWebhook = makeWebhook;
            await AppDataSource.manager.save(user);
            res.json({ message: 'Make webhook settings updated successfully' });
        }
    });

    app.post('/n8n/send/:apikey', async (req, res) => {
        const githubId = req.params.apikey;
        const message = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { apiKey: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            try {
                // Send form data to N8N.com
                console.log("Sendding to n8n");
                await axios.post(user.n8nWebhook, message);
                res.status(200).send('Form submitted successfully');
              } catch (error) {
                console.log("Error sending message");
                res.send('Error sending message');
              }
        }

    });

    app.post('/n8n/toogle/:apikey', async (req, res) => {
        const githubId = req.params.apikey;
        const { n8nBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.n8nBoolean = n8nBoolean;
            await AppDataSource.manager.save(user);
            console.log("N8n settings updated successfully", user.n8nBoolean);
            res.json({ message: 'N8n settings updated successfully' });
        }
    });

    app.post('/n8n/unlink/:apikey', async (req, res) => {
        const githubId = req.params.apikey;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.n8nWebhook = null;
            await AppDataSource.manager.save(user);
            res.json({ message: 'N8n unlinked successfully' });
        }
    });

    app.post('/n8n/webhook/:apikey', async (req, res) => {
        const githubId = req.params.apikey;
        const { n8nWebhook } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.n8nWebhook = n8nWebhook;
            await AppDataSource.manager.save(user);
            res.json({ message: 'N8n webhook settings updated successfully' });
        }
    });

    app.post('/webhook/toogle/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const { webhookBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.webhookBoolean = webhookBoolean;
            await AppDataSource.manager.save(user);
            console.log("Webhook settings updated successfully", user.webhookBoolean);
            res.json({ message: 'Webhook settings updated successfully' });
        }
    });

    app.post('/webhook/unlink/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.webhookWebhook = null;
            await AppDataSource.manager.save(user);
            res.json({ message: 'Webhook unlinked successfully' });
        }
    });

    app.post('/webhook/webhook/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const { webhookWebhook } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.webhookWebhook = webhookWebhook;
            await AppDataSource.manager.save(user);
            res.json({ message: 'Webhook settings updated successfully' });
        }
    });

    app.post('/webhook/send/:githubId', async (req, res) => {
        const githubId = req.params.githubId;
        const message = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { apiKey: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            try {
                console.log("Sendding webhook");
                await axios.post(user.n8nWebhook, message);
                res.status(200).send('Form submitted successfully');
              } catch (error) {
                console.log("Error sending message");
                res.send('Error sending message');
              }
        }

    });

    app.post('/add-domain/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId, 10);
        const domain = req.body.domain;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
    
        if (!user) {
            res.status(400).send('User not found');
            return;
        } 
        if (user.allowedDomains.length <= 50) {
        user.allowedDomains.push(domain);
        await AppDataSource.manager.save(user);
        res.json({ message: 'Domain added successfully' });
        } else {
            res.status(400).send('You can only add 50 domains');
        }
    });

    app.post('/remove-domain/:githubId', async (req, res) => {
        const githubId = parseInt(req.params.githubId, 10);
        const domain = req.body.domain;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            user.allowedDomains = user.allowedDomains.filter(d => d !== domain);
            await AppDataSource.manager.save(user);
            res.json({ message: 'Domain removed successfully' });
        }
    });
    

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);
            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });


    cron.schedule('0 0 * * *', async () => { // Run the cron job every day at midnight
        console.log("Running cron job to reset API usage");
    
        try {
            const users = await AppDataSource.manager.find(User); // Fetch all users
    
            const today = new Date();
    
            for (const user of users) {
                // Check if today is the user's API reset date
                if (today >= user.apiResetDate) {
                    user.currentSubmissions = 0;
                    user.localHostCurrentSubmissions = 0;
                    user.apiResetDate = addMonths(today, 1); // Set the next reset date to 1 month from now
                    await AppDataSource.manager.save(user); // Save the updated user
                    console.log(`Reset API usage for user with ID ${user.id}`);
                } else {
                    console.log("Not resetting API usage for user with ID ", user.id);
                }
            }
        } catch (error) {
            console.error('Error resetting API usage:', error);
        }
    });
    // Helper function to add months to a date
    function addMonths(date: Date, months: number): Date {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    }

    app.listen(3000);

    // delete all users
    // await AppDataSource.manager.clear(User);

    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");
}).catch(error => console.log(error));
