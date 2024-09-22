<div align="center">
  <img src="https://github.com/FormBee/FormBee/blob/main/client/FormBee/src/assets/FormBee%20(1).png" alt="FormBee" width="200" style="margin-left:200px;"/>
<h1>Form submissions to email made easy.</h1>
<h3>The open-source form backend for data privacy conscious developers.</h3>
</div>




## Get FormBee running locally
Clone the repo: ```git clone https://github.com/FormBee/FormBee.git```

FormBee is a monorepo, here are instructions for both the frontend and the backend.

## Client Side

Enter client directory: ```cd FormBee\client\FormBee```

Install dependencies: ```npm install```

Make your way to ```src/app/global-vars.ts``` and change fetchUrl to ```http://localhost:3000```

Run client side: ```ng serve```

**With that, the client side should be running, go to [localhost:4200](http://localhost:4200).**
## Server Side

Enter server directory: ```cd FormBee/server/MyProject```

Intall Dependencies: ```npm install```

Copy .env.example: ```cp .env.example .env```

Configure your .env with your test database credentials (modify the ```DEV_DB``` env variables.)
The EMAIL env variables you see are for configuring the email which sends submission emails.

Make your way to ```src/data-source.ts``` and comment out the second AppDataSource (Prod env vars), and uncomment the first AppDataSource (Dev env vars).
Lastly, make your way to ```src/index.ts``` and change the redirectUrl variable to ```http://localhost:4200```, this is for CORS.

**With that the server should be running.**


