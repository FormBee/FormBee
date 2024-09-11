import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
const dotenv = require('dotenv');
dotenv.config();

// export const AppDataSource = new DataSource({
//     type: "postgres",
//     host: "localhost",
//     port: 5433,
//     username: "Oia",
//     password: "Panther98",
//     database: "formbee",
//     synchronize: true,
//     logging: false,
//     entities: [User],
//     migrations: [],
//     subscribers: [],
// })

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
