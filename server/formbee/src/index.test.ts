import * as request from 'supertest'
import { app, initializeServer } from './index';
import * as dotenv from "dotenv";


dotenv.config();
const apiKey = process.env.API_KEY;
const githubId = process.env.GITHUB_ID;

beforeAll(async () => {
    await initializeServer(); // Ensure the server is initialized
});


describe('Test the root path', () => {
  it('should return Hello, from FormBee!', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, from FormBee!');
  });
});

describe('Test Form Sending API', () => {
  console.log("apiKey: ", apiKey);
  it('should submit form data successfully', async () => {
    const response = await request(app)
      .post(`/formbee/${apiKey}`)
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'This is a test message.',
      });
    expect(response.text).toBe('\"Email sent successfully\"'); 

  }, 10000);

  it('should return an error for invalid API key', async () => {
    const response = await request(app)
      .post(`/formbee/invalid-api-key`)
      .send({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        message: 'This is another test message.',
      });
    
    expect(response.status).toBe(401);
    expect(response.text).toBe("\"Unauthorized\"");
  });

  it('should return an error for user not found in return email', async () => {
    const response = await request(app)
      .post(`/formbee/return/invalid-api-key`)
      .send({
        emailToSendTo: 'recipient@example.com',
      });
    
    expect(response.status).toBe(400);
    expect(response.text).toBe('User not found'); 
  });
});


describe('Test Captcha Challenge API', () => {
  it('should return a challenge', async () => {
    const response = await request(app).get(`/challenge/${apiKey}`);
    expect(response.status).toBe(200);
  });
});

describe('Test Integration Toggles', () => {

  it('should update telegram integration boolean', async () => {
    const response = await request(app).post(`/telegram/toogle/${githubId}`).send({telegramBoolean: false});
    expect(response.status).toBe(200);
    expect(response.text).toBe("Telegram settings updated successfully");
  });

  it("should update discord integration boolean", async () => {
    const response = await request(app).post(`/discord/toogle/${githubId}`).send({discordBoolean: false})
    expect(response.status).toBe(200);
  })
});


describe("Test User API", () => {
  it("Should return a user", async () => {
    const response = await request(app).get(`/api/user/${githubId}`);
    expect(response.status).toBe(200);
  })

  it("Should return null user", async () => {
    const response = await request(app).get(`/api/user/1234567890`);
    expect(response.text).toBe("null");
  })
})