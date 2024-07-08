import { pool } from "../database/usersdb.js";
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config()

async function verifier(data){

  const { name, email, password, id } = data;
  const saltRounds = parseInt(process.env.SALT_ROUNDS);

 try { 
  
  const cryptoPass = await bcrypt.hash(password, saltRounds);

  await pool.query(`INSERT INTO users_data ( name, email, password, id) 
  VALUES ('${name}', '${email}','${cryptoPass}','${id}')`);

 } catch(error){

  throw Error

 }
}

export default verifier;
