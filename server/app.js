// Import the necessary modules
import createChallenge from './Alcha/Challenge.js';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors'; // Import cors middleware
import multer from 'multer';
const app = express();
dotenv.config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Set up CORS to allow requests from your frontend origin
const corsOptions = {
  origin: 'http://localhost:4200', // Allow from this origin
  methods: ['GET', 'POST'], // Allow only GET and POST requests
  allowedHeaders: ['Content-Type', 'x-altcha-spam-filter', 'x-api-key'], // Allow these headers
};
app.use(cors(corsOptions));

// Set up the environment variables
const env = process.env;

// Set up the email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.user,
    pass: env.pass,
  },
});

// Set up the body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the challenge route
app.get('/challenge', (req, res) => {
  console.log("Challenge requested");
  createChallenge(req, res);
});

// Route for form with file upload
app.post('/upload/:apikey', upload.single('file'), (req, res) => {
  let apikey = req.params.apikey;
  const { name, email, message1} = req.body;
  const image = req.file
  console.log(image);
  //require an api key
    if (apikey !== "apikey") {
      res.status(401).json('Unauthorized');
      return;
    }
    else {
      console.log("API key is valid");
      sendMail(name, email, message1, image);
    }

});

// Define the route for the form submission
app.post('/:apikey', (req, res) => {
  const { name, email, message1} = req.body;
  let apikey = req.params.apikey;
  //require an api key
    if (apikey !== "apikey") {
      res.status(401).json('Unauthorized');
      return;
    }
    else {
      console.log("API key is valid");
      sendMail(name, email, message1);
    }

});

// process the form submission
function processMail(name, email, message1, image) {
  // Create a new message object
  console.log(name, email, message1);
  if (image) {
    const message = {
      from: env.user,
      to: env.myemail,
      subject: 'New form submission',
      attachments: [
        {
          filename: image,
          path: image,
          cid: 'image',
        },
      ],
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message1}\nImage: ${image}`,
    };
    return message;
  } else {
    console.log("No image");
    const message = {
      from: env.user,
      to: env.myemail,
      subject: 'New form submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message1}`,
    };
    return message;
  }

  // Send the message using the transporter
}

function sendMail(name, email, message1, image) { 
  const message = processMail(name, email, message1, image);
  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json('Error sending email');
    } else {
      console.log('Email sent successfully');
      res.json('Email sent successfully');
    }
  });
}

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
