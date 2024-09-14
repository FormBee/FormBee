# FormBee

## Form submissions to email made easy.

The open-source form solution for data privacy conscious developers.




## Get FormBee running locally
Clone the repo: ```git clone https://github.com/FormBee/FormBee.git```

FormBee is a monorepo, here are instructions for both the frontend and the backend.

## Client Side

Enter client directory: ```cd FormBee\client\FormBee```

Install dependencies: ```npm install```

Run client side: ```ng serve```


## Server Side

Enter server directory: ```cd FormBee/server/MyProject```

Intall Dependencies ```npm install```

Copy .env.example ```cp .env.example .env```

Configure your .env with your test database credentials (modify the ```DEV_DB``` env variables.)
The EMAIL env variables you see are for configuring the email which sends submission emails.

Make your way to ```src/data-source.ts``` and comment out the second AppDataSource (Prod env vars), and uncomment the first AppDataSource (Dev env vars).
Lastly, make your way to ```src/index.ts``` and change the redirectUrl variable to http://localhost:4200, this is for CORS.

**With that the server should be running.**

- [] Make sure to change prod oauth Redirect URL's in
    - [] Slack
    - [] google

