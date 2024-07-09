import createChallenge from './Alcha/Challenge.js';
import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors'; 
import multer from 'multer';

dotenv.config();

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Set up CORS
const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-altcha-spam-filter', 'x-api-key'],
};
app.use(cors(corsOptions));
app.use(express.json());
// Set up the email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});

// Define the challenge route
app.get('/challenge', (req, res) => {
  createChallenge(req, res);
});

// Route for form with file upload
app.post('/upload/:apikey', upload.single('file'), (req, res) => {
  const { apikey } = req.params;
  const { name, email, message } = req.body;
  const file = req.file;

  if (apikey !== 'apikey') {
    res.status(401).json('Unauthorized');
    return;
  }

  console.log("Received file: ", file);
  sendMail(name, email, message, file, res);
});

// Route for form submission without file
app.post('/:apikey', upload.none(), (req, res) => {
  const { apikey } = req.params;
  console.log("hi")
  const { name, email, message } = req.body;
  console.log("ho")

  if (apikey !== 'apikey') {
    res.status(401).json('Unauthorized');
    return;
  }

  sendMail(name, email, message, null, res);
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

app.listen(3000, () => {
  console.log('Server started on port 3000');
});