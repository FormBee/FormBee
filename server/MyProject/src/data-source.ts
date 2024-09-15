import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
const dotenv = require('dotenv');
dotenv.config();


// Development data source.
// export const AppDataSource = new DataSource({
//     type: "postgres",
//     host: process.env.DEV_DB_HOST,
//     port: 5433, // Change this to match your database's port
//     username: process.env.DEV_DB_USER,
//     password: process.env.DEV_DB_PASS,
//     database: process.env.DEV_DB,
//     synchronize: true,
//     logging: false,
//     entities: [User],
//     migrations: [],
//     subscribers: [],
// })

// Production data source.
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.PROD_DB_HOST,
    port: 39159,
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASS,
    database: process.env.PROD_DB,
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
