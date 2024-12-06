import * as request from 'supertest'
import { app, initializeServer } from './index';

beforeAll(async () => {
    await initializeServer(); // Ensure the server is initialized
    // server = app.listen(3000); // Start the server
});


describe('Test the root path', () => {
  it('should respond with "Hello, world!" on GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, world!');
  });
});

// describe('Test Formbee API', () => {
//   const apiKey = 'test-api-key'; 

//   it('should submit form data successfully', async () => {
//     const response = await request(app)
//       .post(`/formbee/${apiKey}`)
//       .send({
//         name: 'John Doe',
//         email: 'john.doe@example.com',
//         message: 'This is a test message.',
//       });
    
//     expect(response.status).toBe(200);
//     expect(response.text).toBe('Email sent successfully'); 
//   });

//   it('should return an error for invalid API key', async () => {
//     const response = await request(app)
//       .post(`/formbee/invalid-api-key`)
//       .send({
//         name: 'Jane Doe',
//         email: 'jane.doe@example.com',
//         message: 'This is another test message.',
//       });
    
//     expect(response.status).toBe(401);
//     expect(response.text).toBe('Unauthorized');
//   });

//   it('should send return email successfully', async () => {
//     const response = await request(app)
//       .post(`/formbee/return/${apiKey}`)
//       .send({
//         emailToSendTo: 'recipient@example.com',
//       });
    
//     expect(response.status).toBe(200);
//     expect(response.body.message).toBe('Email sent successfully'); 
//   });

//   it('should return an error for user not found in return email', async () => {
//     const response = await request(app)
//       .post(`/formbee/return/invalid-api-key`)
//       .send({
//         emailToSendTo: 'recipient@example.com',
//       });
    
//     expect(response.status).toBe(400);
//     expect(response.text).toBe('User not found'); 
//   });
// });
