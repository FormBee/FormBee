import * as express from "express";
import * as bodyParser from "body-parser";
import * as multer from "multer";
import * as nodemailer from "nodemailer";
import * as cors from "cors";
import * as dotenv from "dotenv";
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

    const upload = multer(); // Initialize multer

    app.post('/:apikey', upload.none(), (req, res) => {
        const { apikey } = req.params;
        const { name, email, message } = req.body;

        if (apikey !== 'apikey') {
            res.status(401).json('Unauthorized');
            return;
        }
        // Find the user in the database with API key, then increment the current submissions
        AppDataSource.manager.findOne(User, { where: { apiKey: apikey } })
            .then(user => {
                if (!user) {
                    res.status(401).json('Unauthorized');
                    return;
                } else if (user.maxSubmissions && user.currentSubmissions >= user.maxSubmissions) {
                    res.status(403).json('You have reached your submission limit');
                    return;
                } else {
                    user.currentSubmissions++;
                    return AppDataSource.manager.save(user);
                }
            })
            .then(() => {
                sendMail(name, email, message, null, res);
            })
            .catch(error => {
                res.status(500).json('Internal Server Error');
            });
    });

    function sendMail(name, email, message, file, res) {
        const mailMessage = {
            from: process.env.user,
            to: process.env.myemail,
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
            console.log(tokenData);
            let githubdata = await axios.get(`https://api.github.com/user`, {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            });
            //Check if the github id is already in our database. 
            const user = await AppDataSource.manager.findOne(User, { where: { githubId: githubdata.data.id } });
            if (!user) {
                await AppDataSource.manager.save(
                    AppDataSource.manager.create(User, {
                        name: githubdata.data.login,
                        githubId: githubdata.data.id
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
        console.log("here")
        const githubId = parseInt(req.params.githubId);
        console.log(githubId)
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
        });
    });

    // Fetch the user by their github id
    app.get('/api/user/:githubId', (req: Request, res: Response) => {
        const githubId = parseInt(req.params.githubId, 10);
        if (isNaN(githubId)) {
            res.status(400).json('Invalid GitHub ID');
            return;
        }
        AppDataSource.manager.findOne(User, { where: { githubId } })
            .then(user => {
                if (user) {
                    res.json(user);
                } else {
                    res.status(404).json('User not found');
                }
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

    app.listen(3000);

    // delete all users
    // await AppDataSource.manager.clear(User);

    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");
}).catch(error => console.log(error));
