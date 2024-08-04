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
                        axios.post('http://localhost:3000/return-email/' + user.githubId, {
                            emailToReturnFrom: email,
                            password: user.fromEmailPassword,
                            message: user.returnMessage,
                            usersEmail: email,
                        });
                        return AppDataSource.manager.save(user);
                    } else {
                        user.currentSubmissions++;
                        await sendMail(recEmail, name, email, message, null, res);
                        return AppDataSource.manager.save(user);
                    }
                    // user.currentSubmissions++;
                    // sendMail(recEmail, name, email, message, null, res);
                    // return AppDataSource.manager.save(user);
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


    // Update email
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
    
    // Send a return email to the form submitter.
    app.post('/return-email/:githubId', (req, res) => {
        const githubId = parseInt(req.params.githubId);
        const { usersEmail  } = req.body;
        console.log("in return-email: ", githubId)

        const transporterForReturn = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: false,
            auth: {
                type: "OAuth2",
                user: "formbee632@gmail.com",
                accessToken: "",
            },
        });
        
        async function sendMail(message) {   
            console.log("sendmail func");
            const mailMessage = {
                from: "formbee632@gmail.com",
                to: [usersEmail,],
                subject: 'New form submission',
                text: `Message: ${message}`,
            };

            transporterForReturn.sendMail(mailMessage, (error) => {
                if (error) {
                    // console.error(error);
                    res.status(500).json('Error sending email');
                } else {
                    res.json('Email sent successfully');
                }
            });
        }
        // const userPromise = AppDataSource.manager.findOne(User, { where: { githubId } });
        // userPromise.then(user => {
        //     console.log("User: ", user);
                sendMail("hi");
        //         return AppDataSource.manager.save(user)
        //     res.status(404).json('User not found');
        // })
        // .catch(error => {
        //     res.status(500).json('Internal Server Error');
        // });
    });


    // app.post('/update-return-email/:githubId', (req, res) => {
    //     const githubId = parseInt(req.params.githubId);
    //     console.log("in update-return-email: ", githubId)
    //     const userPromise = AppDataSource.manager.findOne(User, { where: { githubId: githubId } });
    //     userPromise.then(user => {
    //         console.log("User: ", user);
    //         if (user) {
    //             user.returnBoolean = req.body.returnMessage === 'yes' ? true : false;
    //             user.returnMessage = req.body.message;
    //             user.fromEmailPassword = req.body.password;
    //             user.emailToReturnFrom = req.body.emailToReturnFrom;
    //             return AppDataSource.manager.save(user)
    //         }
    //         res.status(404).json('User not found');
    //     })
    //     .catch(error => {
    //         res.status(500).json('Internal Server Error');
    //     });
    // });


//________________________________________________________________________________

    //endpoint for google oauth
    app.get('/oauth/google/:githubId', (req, res) => {
        console.log("in google oauth");
        const githubId = parseInt(req.params.githubId);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:3000/google/callback"
          );
          
          const scopes = [
            'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/gmail.compose',
          ];
          
          // Generate a secure random state value.
          const state = crypto.randomBytes(32).toString('hex');
          
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
    });

    
    app.get("/google/callback", async (req, res) => {
        try {
          console.log(req.query);
      
          const { code } = req.query;
      
          const data = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: "http://localhost:3000/google/callback",
            grant_type: "authorization_code",
          };
      
          console.log("Data: ", data);
      
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
          const { access_token, refresh_token, } = access_token_data;
          console.log("Access token: ", access_token);
          console.log("Refresh token: ", refresh_token);
    
          // Fetch user profile with the access token
          const userInfoResponse = await axios({
            url: "https://www.googleapis.com/oauth2/v1/userinfo",
            method: "GET",
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
      
          const userInfo = userInfoResponse.data;
          console.log('User Info:', userInfo);
      
          // Extract email and other desired info
          const userEmail = userInfo.email;
          console.log('User Email:', userEmail);
      
          // Redirect to your application's dashboard or handle information as needed
          res.redirect("http://localhost:4200/dashboard");
        } catch (error) {
          console.error('Error during OAuth callback:', error);
          res.status(500).json({ error: 'An error occurred during the authentication process' });
        }
      });

      // ______________________________________________________________________________________

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
