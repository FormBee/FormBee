// Import the necessary modules

const dotenv = require('dotenv');
// Set up the environment variables
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
dotenv.config();

// set up cors to allow all origins
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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