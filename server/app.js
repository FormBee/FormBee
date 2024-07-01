// Import the necessary modules
import  createChallenge  from './Alcha/Challenge.js';
import verifySolution from './Alcha/Solution.js';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors'; // Import cors middleware
const app = express();
dotenv.config();

// set up cors to allow requests from your frontend origin
const corsOptions = {
  origin: 'http://localhost:4200', // Allow from this origin
  methods: ['GET', 'POST'], // Allow only GET and POST requests
  allowedHeaders: ['Content-Type', 'x-altcha-spam-filter'], // Allow these headers
};
app.use(cors(corsOptions));


// Set up the environment variables
const env = process.env;
// Set up the email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.user,
    pass: env.pass
  }
});

// Set up the body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the route for the form submission
app.post('/', (req, res) => {
  const { name, email, message1 } = req.body;
  // Create a new message object
  const message = {
    from: env.user,
    to: env.myemail,
    subject: 'New form submission',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message1}`
  };

  app.get('/challenge', createChallenge);

  app.post('/solution', verifySolution);


  // Send the message using the transporter
  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent successfully');
      res.send('Email sent successfully');
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});