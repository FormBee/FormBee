import * as express from "express";
import * as bodyParser from "body-parser";
import * as nodemailer from "nodemailer";
import * as cors from "cors";
import * as dotenv from "dotenv";
import * as cron from 'node-cron';
import * as crypto from "crypto";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import createChallenge = require("./Alcha/Challenge.js");
import axios from 'axios';
const { Stripe } = require('stripe');
const stripe = Stripe(process.env.STRIPE_TEST_KEY);
// const redirectUrl = "https://ibex-causal-painfully.ngrok-free.app";
// const redirectUrl = "http://localhost:4200";
const redirectUrl = "https://formbee.dev";
const emailPort = 465; // Change this to match your email provider's port
import { verifyToken, AuthRequest } from "./middleware/auth";
import * as jwt from "jsonwebtoken";

dotenv.config();
const app = express();


async function initializeServer() {
    await AppDataSource.initialize();
    // await AppDataSource.manager.clear(User);

    const corsOptions = {
        origin: "*",
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'x-altcha-spam-filter', 'x-api-key', 'Authorization'],
    };
    app.use(cors(corsOptions));

    const strictCorsOptions = {
        origin: redirectUrl,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'x-altcha-spam-filter', 'x-api-key', 'Authorization'],
        credentials: true
    };

    app.get('/', (req, res) => {
        res.send('Hello, from FormBee!');
      });
  
      
    app.post('/stripe/webhook', express.raw({type: 'application/json'}), async (request, res) => {
        const sig = request.headers['stripe-signature'];
        let event;
        try {
            event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WHSEC);
        } catch (err) {
        }
    
        if (event.type === 'customer.subscription.deleted') {
            console.log('🚀 Subscription deleted.', event.data.object.customer);
            const user = await AppDataSource.manager.findOne(User, { where: { stripeCustomerId: event.data.object.customer } });
            if (!user) {
                console.log("User not found");
            } else {
                user.nextMonthTier = "Starter";
                await AppDataSource.manager.save(user);
                console.log("Resetting user to starter...");
            }
        }
    
        // Return a response to acknowledge receipt of the event
        res.status(200).send();
    });
    app.use(bodyParser.json());
    

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            clientId: process.env.GMAIL_CLIENT,
            clientSecret: process.env.GMAIL_SECRET,
        },
    });


    // const transporter = nodemailer.createTransport({
    //     host: process.env.SES_SERVER,
    //     port: 465,
    //     secure: true,
    //     auth: {
    //         user: process.env.SES_USER, // Your SMTP username
    //         pass: process.env.SES_PASS, // Your SMTP password
    //     },
    // });


    // Basic post route, sends form data to the users email.
    app.post('/formbee/:apikey', async (req, res) => {
        console.log("req.body: ", req.body);
        const { apikey } = req.params;
        const { name, email, message } = req.body;
        let messageList = [];
            for (const [key, value] of Object.entries(req.body)) {
                if (typeof value === 'string' && value !== "") {
                    messageList.push(`${key}: ${value}`);
                }
            }
        let niceMessage = messageList.join('\n\n');
        if (niceMessage.length > 4000) {
            // If the message is too long, return.
            return;
        }
        if (niceMessage === "") {
            // If the message is empty, return.
            return;
        }
        //wrap nice message in ``` to make it look better
        let niceMessageDiscord = `\`\`\`${niceMessage}\`\`\``;
        // Find the user in the database with API key, then increment the current submissions
        AppDataSource.manager.findOne(User, { where: { apiKey: apikey } })
            .then(async user => {
                if (!user) {
                    console.log("User not found!");
                    res.status(401).json('Unauthorized');
                    return;
                } else if (user.maxSubmissions && user.currentSubmissions >= user.maxSubmissions) {
                    console.log("Reached submission limit");
                    res.status(403).json('You have reached your submission limit');
                    return;
                } else {
                    console.log("origin: ", req.headers.origin);
                    if (user.allowedDomains.length === 0 || req.headers.origin === undefined || user.allowedDomains.some(domain => req.headers.origin.includes(domain)) || req.headers.origin.includes("localhost")) {
                        console.log("allowed domain");
                    } else {
                        console.log("not allowed domain");
                        res.status(403).json('You are not allowed to submit from this domain');
                        return;
                    }
                    const recEmail = user.email;
                    // check if the users origin was from the local host
                    if (req.headers.origin && req.headers.origin.includes("localhost")) {
                        // Add 1 to localhost submissions.
                        user.localHostCurrentSubmissions++;

                        await sendMail(recEmail, name, email, message, null, res);
                        if (user.returnBoolean === true) {
                            const returnEmail = email;
                            axios.post('https://api.formbee.dev/formbee/return/' + apikey, {
                                emailToSendTo: returnEmail,
                            });

                        }
                        if (user.telegramChatId != null && user.telegramBoolean) {
                            console.log("Sendding to telegram");
                            axios.post('https://api.formbee.dev/telegram/send/' + user.githubId, {
                                message: req.body,
                            });
                        }

                        if (user.discordWebhook != null && user.discordBoolean) {
                            console.log("Discord webhook");
                            const sendMessage = async (message) => {
                                console.log("Sendding to discord");
                                await axios.post(user.discordWebhook, {
                                    content: message,
                                });
                              };
                            await sendMessage(niceMessageDiscord);
                            }
    
                            // if (user.slackChannelId != null && user.slackAccessToken != null && user.slackBoolean) {
                            //     console.log("Sendding to slack");
                            //     const sendMessage = async (message) => {
                            //         console.log("Sendding to slack");
                            //         await axios.post(`https://api.formbee.dev/slack/send-message`, {
                            //             message,
                            //             slackChannelId: user.slackChannelId,
                            //             slackAccessToken: user.slackAccessToken,
                            //         });
                            //     };
                            //     await sendMessage(niceMessageDiscord);
                            // }
                            if (user.makeBoolean === true && user.makeWebhook != null) {
                                console.log("Sendding to make");
                                axios.post('https://api.formbee.dev/make/' + apikey, {
                                    message: req.body,
                                });
                            }
                            if (user.n8nBoolean === true && user.n8nWebhook != null)
                            axios.post('https://api.formbee.dev/n8n/send/' + apikey, {
                                message: req.body,
                            });

                            if (user.webhookBoolean === true && user.webhookWebhook != null)
                            axios.post('https://api.formbee.dev/webhook/send/' + apikey, {
                                message: req.body,
                            });


                    return AppDataSource.manager.save(user);


                    // else the user is not from the local host, we need to update the current submissions
                    } else {
                        console.log("Not local host");
                        await sendMail(recEmail, name, email, message, null, res);
                        if (user.returnBoolean === true) {
                            const returnEmail = email;
                            axios.post('https://api.formbee.dev/formbee/return/' + apikey, {
                                emailToSendTo: returnEmail,
                            });

                        }
                        if (user.telegramChatId != null && user.telegramBoolean) {
                            axios.post('https://api.formbee.dev/telegram/send/' + user.githubId, {
                                message: req.body,
                            });
                        }

                        if (user.discordWebhook != null && user.discordBoolean) {
                        const sendMessage = async (message) => {
                            await axios.post(user.discordWebhook, {
                                content: message,
                            });
                          };
                        await sendMessage(niceMessageDiscord);
                        }

                        // if (user.slackChannelId != null && user.slackAccessToken != null && user.slackBoolean) {
                        //     const sendMessage = async (message) => {
                        //         console.log("Sendding to slack");
                        //         await axios.post(`https://api.formbee.dev/slack/send-message`, {
                        //             message,
                        //             slackChannelId: user.slackChannelId,
                        //             slackAccessToken: user.slackAccessToken,
                        //         });
                        //     };
                        //     await sendMessage(niceMessageDiscord);
                        //     user.currentSubmissions++;
                        //     return AppDataSource.manager.save(user);

                        // }
                        user.currentSubmissions++;
                        return AppDataSource.manager.save(user);
                    }
                }
            })
            .catch(error => {
                res.status(500).json(`Internal Server Error: ${error}`);
            });

        async function sendMail(recEmail, name, email, message, file, res) {      
            if (niceMessage === "") {
                return;
            }
            const mailMessage = {
                from: '"New FormBee Submission" <new-submission@formbee.dev>',
                to: [recEmail,],
                subject: 'New Form Submission',
                text: `${niceMessage}`,
                attachments: file ? [{ filename: file.originalname, content: file.buffer }] : [],
                auth: {
                    user: process.env.GMAIL_EMAIL,
                    refreshToken: process.env.GMAIL_REFRESH,
                    accessToken: process.env.GMAIL_ACCESS,
                    expires: 1484314697598,
                },
            };
            transporter.sendMail(mailMessage, (error) => {
                if (error) {
                    res.status(500).json(`Error sending email: ${error}`);
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
                if (user.subscriptionTier == "Starter") {
                    return;
                } else if (user.subscriptionTier == "Growth" && user.returnBoolean === true && user.emailSubject && user.emailBody) {
                    const emailSubject = user.emailSubject;
                    const emailBody = user.emailBody;
                    const mailMessage = {
                        from: process.env.EMAIL_USER,
                        to: emailToSendTo,
                        subject: emailSubject,
                        text: emailBody,
                    }
                    transporter.sendMail(mailMessage, (error) => {
                        if (error) {
                            res.status(500).send('Error sending email');
                        } else {
                            res.json({ message: 'Email sent successfully' });
                        }
                    });
                } else if (user.subscriptionTier == "Premium" && user.returnBoolean === true && user.emailSubject && user.emailBody) {
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
                        // console.log("sending from smtp server.")
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
                                // console.log("Error sending email: ", error);
                                return;
                            } else {
                                res.json({ message: 'Email sent successfully' });
                            }
                        }); 
                    } else if (email &&accessToken && refreshToken && await isValidEmail(emailToSendTo) === true) {
                        console.log("sending from gmail.")
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
                        console.log("Sending from formbee email.")
                        const emailSubject = user.emailSubject;
                        const emailBody = user.emailBody;
                        const mailMessage = {
                            from: process.env.EMAIL_USER,
                            to: emailToSendTo,
                            subject: emailSubject,
                            text: emailBody,
                        };
                        transporter.sendMail(mailMessage, (error) => {
                            if (error) {
                                res.status(500).json('Error sending email');
                            } else {
                                res.json({ message: 'Email sent successfully' });
                            }
                        });
                        return
                    }
                }
            }

        } catch (error) {
            res.status(500).json({ error: 'Failed to send email' });
        }
    });

    app.get('/challenge/:apikey', async (req, res) => {
        const apiKey  = req.params.apikey; 
        const user = await AppDataSource.manager.findOne(User, { where: { apiKey: apiKey } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            if (user.subscriptionTier == "Starter") {
                res.status(400).send('You can only use the challenge with a subscription tier of Growth or Premium.');
                return;
            } else {
                createChallenge(req, res);
            }
        }
    });


    app.get('/auth/github', cors(strictCorsOptions), (req, res) => {
        const githubAuthUrl = 'https://github.com/login/oauth/authorize';
        const clientId = process.env.GITHUB_CLIENT_ID;
        res.redirect(`${githubAuthUrl}?client_id=${clientId}`);
    });

    app.post('/telegram/toogle/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        const { githubId } = req.params;
        const { telegramBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            if (telegramBoolean == true && user.currentPlugins + 1 > user.maxPlugins && user.maxPlugins !== null) {
                res.status(400).send('You have reached your plugin limit');
                return;
            } else {
                user.telegramBoolean = telegramBoolean;
                if (telegramBoolean == true) {
                    user.currentPlugins += 1;
                } else {
                    user.currentPlugins -= 1;
                }
                if (user.currentPlugins < 0) {
                    user.currentPlugins = 0;
                } else if (user.currentPlugins > user.maxPlugins) {
                    user.currentPlugins = user.maxPlugins;
                }
                await AppDataSource.manager.save(user);
                res.status(200).send('Telegram settings updated successfully');
            }
        }
    });

    app.post('/discord/toogle/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        const { githubId } = req.params;
        const { discordBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            if (discordBoolean == true && user.currentPlugins + 1 > user.maxPlugins && user.maxPlugins !== null) {
                res.status(400).send('You have reached your plugin limit');
                return;
            } else {
                user.discordBoolean = discordBoolean;
                if (discordBoolean == true) {
                    user.currentPlugins += 1;
                } else {
                    user.currentPlugins -= 1;
                }
                await AppDataSource.manager.save(user);
                res.status(200).send('Discord settings updated successfully');

            }
        }
    });

    app.post('/discord/webhook/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
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
    
    app.get('/auth/github/callback', cors(strictCorsOptions), async (req: Request, res: Response) => {
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
                nextMonth.setHours(0, 0, 0, 0);
                const year = nextMonth.getFullYear();
                const month = String(nextMonth.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const day = String(nextMonth.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            let currentDate = new Date();
            let sameDayNextMonth = await getSameDayNextMonth(currentDate);


            if (!user) {
                if (process.env.STRIPE_TEST_KEY) {
                    const customer = await stripe.customers.create({
                        name: githubdata.data.login,
                        email: githubdata.data.email,
                    });
                    console.log("customer: ", await customer);
                    await AppDataSource.manager.save(
                        AppDataSource.manager.create(User, {
                            name: githubdata.data.login,
                            githubId: githubdata.data.id,
                            returnEmail: githubdata.data.email,
                            billingEmail: githubdata.data.email,
                            apiResetDate: sameDayNextMonth,
                            stripeCustomerId: customer.id,
                        })
                    );
            } else {
                await AppDataSource.manager.save(
                    AppDataSource.manager.create(User, {
                        name: githubdata.data.login,
                        githubId: githubdata.data.id,
                        returnEmail: githubdata.data.email,
                        billingEmail: githubdata.data.email,
                        apiResetDate: sameDayNextMonth,
                    })
                );
            }
            // After successful GitHub authentication, generate JWT token
            const token = jwt.sign(
                { githubId: githubdata.data.id },
                process.env.JWT_SECRET!,
                { expiresIn: '24h' }
            );

            // Redirect with both GitHub token and JWT token
            res.redirect(`${redirectUrl}/login?token=${tokenData.access_token}&jwt=${token}`);
            } else {
                const token = jwt.sign(
                    { githubId: githubdata.data.id },
                    process.env.JWT_SECRET!,
                    { expiresIn: '24h' }
                );
                res.redirect(`${redirectUrl}/login?token=${tokenData.access_token}&jwt=${token}`);
            }
        } catch (error) {
            res.status(500).send('Internal Server Error');
        }
    });


    //Route for creating a new API key for the user
    app.post('/create-api-key/:githubId', cors(strictCorsOptions), (req, res) => {
        const githubId = parseInt(req.params.githubId);
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
    app.post('/regenerate-api-key/:githubId', cors(strictCorsOptions), (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const userPromise = AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        userPromise.then(user => {
            if (!User) {
                res.status(401).json('Unauthorized');
                return;
            }
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
    app.get('/api/user/:githubId', cors(strictCorsOptions), verifyToken, (req: AuthRequest, res: Response) => {
        const githubId = parseInt(req.params.githubId, 10);
        // Verify that the requesting user is accessing their own data
        if (req.user?.githubId !== githubId) {
            console.log("no github id")
            return res.status(403).json('Unauthorized access to user data');
        }

        if (isNaN(githubId)) {
            console.log("invalid github id")
            return res.status(400).json('Invalid GitHub ID');
        }

        AppDataSource.manager.findOne(User, { where: { githubId } })
            .then(user => {
                if (!user) {
                    console.log("user not found")
                    return res.status(404).json('User not found');
                }
                res.json(user);
            })
            .catch(error => {
                console.log("error: ", error)
                res.status(500).json('Internal Server Error');
            });
    });


    // // Update email
    app.post('/update-email/:githubId', cors(strictCorsOptions), (req, res) => {
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

    app.get('/oauth/telegram/:githubId', cors(strictCorsOptions), async (req, res) => {
        const githubId = parseInt(req.params.githubId);
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
        const botToken = process.env.TELEGRAM_API_TOKEN;
    
        try {
            const isValid = await verifyTelegramHash(req.query, botToken);

            if (isValid) {
                const sendTelegramMessage = async (chatId, message) => {
                    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
                
                    try {
                        await axios.post(url, {
                            chat_id: chatId,
                            text: message,
                        });
                    } catch (error) {
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

    app.post('/telegram/unlink/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
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

    app.post('/update-return-settings/:githubId', cors(strictCorsOptions), async (req: Request, res: Response) => {
        const githubId = parseInt(req.params.githubId);
        const { smtpHost, smtpPort, smtpUsername, smtpPassword, emailSubject, emailBody, returnMessage } = req.body;
        try {
            const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
            if (!user) {
                res.status(400).send('User not found');
                return;
            } else {
                if (user.subscriptionTier !== "Starter") {
                    user.returnBoolean = returnMessage;
                    await AppDataSource.manager.save(user);
                }
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

    // Make integration
    app.post('/make/:apikey', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/make/toogle/:apikey', cors(strictCorsOptions), async (req, res) => {
        const githubId = req.params.apikey;
        const { makeBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            if (makeBoolean == true && user.currentPlugins + 1 > user.maxPlugins && user.maxPlugins !== null) {
                console.log("Can't toggle make, max plugins reached");
                res.status(400).send('You have reached your plugin limit');
                return;
            } else {
                console.log("update allowed")
                user.makeBoolean = makeBoolean;
                if (makeBoolean == true) {
                    user.currentPlugins += 1;
                } else {
                    user.currentPlugins -= 1;
                }
                await AppDataSource.manager.save(user);
                console.log("current plugins: ", user.currentPlugins);
                console.log("max plugins: ", user.maxPlugins);
                res.json({ message: 'Make settings updated successfully' });
            }
        }
    });

    app.post('/make/unlink/:apikey', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/make/webhook/:apikey', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/n8n/send/:apikey', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/n8n/toogle/:apikey', cors(strictCorsOptions), async (req, res) => {
        const githubId = req.params.apikey;
        const { n8nBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: parseInt(githubId) } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            if (n8nBoolean == true && user.currentPlugins + 1 > user.maxPlugins && user.maxPlugins !== null) {
                console.log("Can't toggle n8n, max plugins reached");
                res.status(400).send('You have reached your plugin limit');
                return;
            } else {
                console.log("update allowed")
                user.n8nBoolean = n8nBoolean;
                if (n8nBoolean == true) {
                    user.currentPlugins += 1;
                } else {
                    user.currentPlugins -= 1;
                }
                await AppDataSource.manager.save(user);
                res.json({ message: 'N8n settings updated successfully' });
            }
        }
    });

    app.post('/n8n/unlink/:apikey', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/n8n/webhook/:apikey', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/webhook/toogle/:githubId', cors(strictCorsOptions), async (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const { webhookBoolean } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            if (webhookBoolean == true && user.currentPlugins + 1 > user.maxPlugins && user.maxPlugins !== null) {
                console.log("Can't toggle webhook, max plugins reached");
                res.status(400).send('You have reached your plugin limit');
                return;
            } else {
                console.log("update allowed")
                user.webhookBoolean = webhookBoolean;
                if (webhookBoolean == true) {
                    user.currentPlugins += 1;
                } else {
                    user.currentPlugins -= 1;
                }
                await AppDataSource.manager.save(user);
                res.json({ message: 'Webhook settings updated successfully' });
            }
        }
    });

    app.post('/webhook/unlink/:githubId', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/webhook/webhook/:githubId', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/webhook/send/:githubId', cors(strictCorsOptions), async (req, res) => {
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

    app.post('/add-domain/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
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

    app.post('/remove-domain/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
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

    // Stipe integration
    app.post('/create-setup-intent/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        const githubId = parseInt(req.params.githubId, 10);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            try {
                const setupIntent = await stripe.setupIntents.create({
                    customer: user.stripeCustomerId,
                    payment_method_types: ['card'],
                });
                res.json({ clientSecret: setupIntent.client_secret });
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        }
    });

    app.post('/save-card/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        const githubId = parseInt(req.params.githubId, 10);
        const { paymentMethodId } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            try {
                //attach the payment method to the customer
                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: user.stripeCustomerId,
                });

                await stripe.customers.update(user.stripeCustomerId, {
                    invoice_settings: {
                        default_payment_method: paymentMethodId,
                    },
                });
                res.json({ message: 'Payment method saved successfully' });
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        }  
    });


    app.get('/get-default-payment-method/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        const githubId = parseInt(req.params.githubId, 10);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            try {
                const customer = await stripe.customers.retrieve(user.stripeCustomerId);
                const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;
                if (defaultPaymentMethodId) {
                    const paymentMethod = await stripe.paymentMethods.retrieve(defaultPaymentMethodId);
                    res.json({ paymentMethod });
                } else {
                    res.status(404).send({ error: 'No default payment method found' });
                }
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        }
    });

    app.post('/update-billing-email/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        const githubId = parseInt(req.params.githubId);
        const { email } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        }
        await stripe.customers.update(user.stripeCustomerId, {
            email,
        });
        user.billingEmail = email;
        await AppDataSource.manager.save(user);
        res.json({ message: 'Email updated' });
    });

    app.post('/manage-plan/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        console.log("in manage plan");
        const githubId = parseInt(req.params.githubId);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
        if (!user) {
            res.status(400).send('User not found');
            return;
        } else {
            const configuration = await stripe.billingPortal.configurations.create({
                business_profile: {
                  headline: 'FormBee partners with Stripe for simplified billing.',
                },
                features: {
                  invoice_history: {
                    enabled: true,
                  },
                  subscription_cancel: {
                    enabled: true,
                  }
                },
              });
            const session = await stripe.billingPortal.sessions.create({
                customer: user.stripeCustomerId,
                configuration: configuration.id,
                return_url: 'https://formbee.dev/billing',
              });
              res.json({url: session.url})
        }
    });

    app.post('/stripe/growth-plan/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        const githubId = parseInt(req.params.githubId);
        console.log("in growth plan: ", githubId);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId }, });
        if (!user) {
            console.log("user not found");
            res.status(400).send('User not found');
            return;
        } else {
            if (user.subscriptionTier === "Growth") {
                console.log("user already on growth plan");
                res.status(400).send('User already on growth plan');
                return;
            } else {
                console.log("in else, user found.");
                let paymentMethod: string | undefined;
                if (user.subscriptionId) {
                    try {
                        const cancellation = await stripe.subscriptions.cancel(user.subscriptionId);
                        console.log("Subscription cancelled successfully:", cancellation);
                    } catch (error) {
                        console.log("Error cancelling subscription: ", error);
                    }
                }
                try {
                    console.log("in try");
                    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
                    console.log("customer: ", customer);
                    const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;
                    console.log("defaultPaymentMethodId: ", defaultPaymentMethodId);
                    if (defaultPaymentMethodId) {
                        paymentMethod = await stripe.paymentMethods.retrieve(defaultPaymentMethodId);
                        console.log("Default payment method found: ", paymentMethod);
                        console.log("creating subscription");
                        try {
                            console.log("in try for subscription");
                            console.log(user.stripeCustomerId);
                            const subscription = await stripe.subscriptions.create({
                                customer: user.stripeCustomerId,
                                items: [{
                                    //growth price
                                    price: "price_1Pr6lhP65EGyHpMvWCpkydvk"
                                }],
                                default_payment_method: defaultPaymentMethodId.id,
                            });
                            if (subscription.status === 'active') {
                                console.log("Subscription created successfully");
                                if (user.subscriptionTier == "Premium") {
                                    user.nextMonthTier = "Growth";
                                } else {
                                    user.subscriptionTier = "Growth";
                                    user.maxSubmissions = 1000;
                                    user.maxPlugins = null;
                                    user.subscriptionId = subscription.id;
                                    const today = new Date();
                                    user.apiResetDate = addMonths(today, 1);
                                }

                                await AppDataSource.manager.save(user);
                                res.json({ subscription });
                            } else {
                                res.status(500).send({ error: "Subscription not active" });
                            }
                            
                        } catch (error) {
                            res.status(500).send({ error: error.message });
                        }
                        

                    } else {
                        console.log("No default payment method found, need to create one");
                    }
                } catch (error) {
                    res.status(500).send({ error: error.message });
                }
            }
        }
    });

    app.get('/fetch-ical', async (req, res) => {
        try {
            const response = await axios.get(process.env.VRBO_ICAL_URL);
            res.setHeader('Content-Type', 'text/calendar');
            res.send(response.data);
        } catch (error) {
            res.status(500).send('Error fetching iCal');
        }
    });

    app.post('/stripe/premium-plan/:githubId', cors(strictCorsOptions), verifyToken, async (req: AuthRequest, res: Response) => {
        const githubId = parseInt(req.params.githubId);
        console.log("in growth plan: ", githubId);
        const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubId }, });
        if (!user) {
            console.log("user not found");
            res.status(400).send('User not found');
            return;
        } else {
            if (user.subscriptionTier === "Premium") {
                console.log("user already on premium plan");
                res.status(400).send('User already on premium plan');
                return;
            } else {
                let paymentMethod: string | undefined;
                if (user.subscriptionId) {
                    try {
                        const cancellation = await stripe.subscriptions.cancel(user.subscriptionId);
                        console.log("Subscription cancelled successfully:", cancellation);
                    } catch (error) {
                    }
                }
                try {
                    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
                    const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;
                    if (defaultPaymentMethodId) {
                        paymentMethod = await stripe.paymentMethods.retrieve(defaultPaymentMethodId);
                        try {
                            const subscription = await stripe.subscriptions.create({
                                customer: user.stripeCustomerId,
                                items: [{
                                    price: "price_1PrBWpP65EGyHpMvnFTGkl4e"
                                }],
                                default_payment_method: defaultPaymentMethodId.id,
                            });
                            if (subscription.status === 'active') {
                                user.subscriptionTier = "Premium";
                                user.maxSubmissions = 10000;
                                user.maxPlugins = null;
                                user.subscriptionId = subscription.id;
                                const today = new Date();
                                user.apiResetDate = addMonths(today, 1);
                                await AppDataSource.manager.save(user);
                                res.json({ subscription });
                            } else {
                                res.status(500).send({ error: "Subscription not active" });
                            }
                            
                        } catch (error) {
                            res.status(500).send({ error: error.message });
                        }
                        

                    } else {
                    }
                } catch (error) {
                    res.status(500).send({ error: error.message });
                }
            }
        }
    });

    cron.schedule('0 0 * * *', async () => { // Run the cron job every day at midnight
    // cron.schedule('* * * * *', async () => { // Run the cron job once a minute.
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
                    if (user.subscriptionTier != user.nextMonthTier && user.nextMonthTier != null) {
                        user.subscriptionTier = user.nextMonthTier;
                        user.nextMonthTier = null;
                        if (user.subscriptionTier == "Premium") {
                            user.maxPlugins = null;
                            user.maxSubmissions = 10000;
                            user.nextMonthTier = null;
                        } else if (user.subscriptionTier == "Growth") {
                            user.maxPlugins = null;
                            user.maxSubmissions = 1000;
                            user.nextMonthTier = null;
                        } else if (user.subscriptionTier == "Starter") {
                            user.maxPlugins = 1;
                            user.maxSubmissions = 250;
                            user.telegramBoolean = false;
                            user.discordBoolean = false;
                            user.slackBoolean = false;
                            user.makeBoolean = false;
                            user.n8nBoolean = false;
                            user.webhookBoolean = false;
                            user.nextMonthTier = null;
                        }
                    }
                    await AppDataSource.manager.save(user); // Save the updated user
                } else {
                }
            }
        } catch (error) {
        }
    });
    // Helper function to add months to a date
    function addMonths(date: Date, months: number): Date {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    }
    // Comment this out for testing, uncomment for prod.
    app.listen(3000);



    console.log("Express server has started on port 3000.");
}
initializeServer();

export { app, initializeServer };