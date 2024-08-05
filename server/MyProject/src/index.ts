import * as express from "express";
import * as bodyParser from "body-parser";
import * as multer from "multer";
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



dotenv.config();
AppDataSource.initialize().then(async () => {
    // create express app
    const app = express();
    app.use(bodyParser.json());
    const corsOptions = {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'x-altcha-spam-filter', 'x-api-key'],
    };
    app.use(cors(corsOptions));
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.user,
            pass: process.env.pass,
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

    const upload = multer(); // Initialize multer

    app.post('/:apikey', upload.none(), (req, res) => {
        const { apikey } = req.params;
        const { name, email, message } = req.body;
        console.log(req.body);
        // Find the user in the database with API key, then increment the current submissions
        AppDataSource.manager.findOne(User, { where: { apiKey: apikey } })
            .then(async user => {
                if (!user) {
                    console.log("User not found");
                    res.status(401).json('Unauthorized');
                    return;
                } else if (user.maxSubmissions && user.currentSubmissions >= user.maxSubmissions || user.localHostMaxSubmissions && user.localHostCurrentSubmissions >= user.localHostMaxSubmissions) {
                    console.log("Reached submission limit");
                    res.status(403).json('You have reached your submission limit');
                    return;
                } else {
                    const recEmail = user.email;
                    console.log("Sending email");
                    // check if the users origin was from the local host
                    if (req.headers.origin.includes("localhost")) {
                        user.localHostCurrentSubmissions++;
                        await sendMail(recEmail, name, email, message, null, res);
                            console.log("Sending return email");
                        return AppDataSource.manager.save(user);
                    } else {
                        user.currentSubmissions++;
                        sendMail(recEmail, name, email, message, null, res);
                        return AppDataSource.manager.save(user);
                    }

                }
            })
            .catch(error => {
                res.status(500).json('Internal Server Error');
            });
    });

    async function sendMail(recEmail, name, email, message, file, res) {        
        const mailMessage = {
            from: process.env.user,
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


    app.get('/challenge', (req, res) => {
        createChallenge(req, res);
    });


    app.get('/auth/github', (req, res) => {
        const githubAuthUrl = 'https://github.com/login/oauth/authorize';
        const clientId = process.env.GITHUB_CLIENT_ID;
        res.redirect(`${githubAuthUrl}?client_id=${clientId}`);
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
            // console.log(tokenData);
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
            res.redirect(`http://localhost:4200/login?token=${tokenData.access_token}`);
            } else {
                res.redirect(`http://localhost:4200/login?token=${tokenData.access_token}`);
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
                } else {
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
        // console.log("in updade-email: ", githubId)
        const userPromise = AppDataSource.manager.findOne(User, { where: { githubId } });
        userPromise.then(user => {
            // console.log("User: ", user);
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
