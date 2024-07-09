import { pool } from "../database/usersdb.js";

async function loginController(body){
    const { id } = body; // Extrae el password y id del cuerpo de la solicitud

  // Consulta para obtener el usuario con el id proporcionado
  const user = await pool.query(`SELECT * FROM users_data WHERE id = $1`,
    [ id ]
  );
  return user
}

export default loginController;