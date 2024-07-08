
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pass = process.env.DB_PASSWORD;

export const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    password: pass,
    database: "postgres" ,
    port: "3001"
})
