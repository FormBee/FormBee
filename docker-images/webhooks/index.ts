import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from "axios"
dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: process.env.ORIGIN || "*",
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-altcha-spam-filter', 'x-api-key', 'Authorization'],
};

app.use(cors(corsOptions));
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Formbee Webhook only is running!');
  });


  app.post('/webhook/send', async (req, res) => {
    console.log(req.body)
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
    const payload = {
        content: `${JSON.stringify(niceMessageDiscord)}`,
    };
    try {
        console.log("Sending webhook");
        
        const webhookUrl = process.env.WEBHOOK_URL;
        if (!webhookUrl) {
            throw new Error("WEBHOOK_URL is not defined");
        }

        await axios.post(webhookUrl, payload, {
        }).then(response => {
            console.log('Message sent successfully:', response.data);
        res.status(200).send('Form submitted successfully');

        }).catch(error => {
            console.error('Error sending message:', error.response ? error.response.data : error.message);
        });
        res.status(200).send('Form submitted successfully');
    } catch (error) {
        // console.log("Error sending message", error);
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  })
