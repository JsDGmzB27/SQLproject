import { marked } from "marked";
import { pool } from "../database/usersdb.js";

async function taskManager(body, userId) {
  const { type, name, id, procedure, status, description, id_container } = body; // Extrae los datos del cuerpo de la solicitud
  // Convierte la descripción de Markdown a HTML
  const markdescription = marked(description);

  const user_id = userId; // Obtiene el id del usuario de la sesión

  // Manejo de contenedores (container)
  if (type == "container" && procedure == "create") {
    await pool.query(
      `INSERT INTO container (name, user_id) 
      VALUES ( $1, '${user_id}')`,
      [name]
    ); // Inserta un nuevo contenedor
  } else {
    if (type == "container" && procedure == "delete") {
      await pool.query(
        `DELETE FROM container WHERE id_container = $1 AND user_id = '${user_id}'`,
        [id_container]
      ); // Elimina un contenedor
    } else {
      if (type == "container" && procedure == "update") {
        await pool.query(
          `UPDATE container SET name = $1 WHERE id_container = $2 AND user_id = '${user_id}'`,
          [name, id_container]
        ); // Actualiza un contenedor
      }
    }
  }

  // Manejo de tareas (task)
  if (type == "task" && procedure == "create") {
    const crear = await pool.query(`SELECT * FROM container 
      WHERE id_container = $1 AND user_id = '${user_id}'`,
    [ id_container] );
    
    console.log(crear.rows.length);

    if(crear.rows.length > 0){
      await pool.query(
        `INSERT INTO tasks (task_name, user_id, container, status, description) 
        VALUES ($1, '${user_id}', $2, '1', $3 )`,
        [name, id_container, markdescription]
      ); // Inserta una nueva tarea
    }else{
      throw Error("Este contenedor no es suyo.");
    }

  } else {
    if (type == "task" && procedure == "delete") {
      await pool.query(
        `DELETE FROM tasks WHERE id_task = $1 AND user_id = '${user_id}'`,
        [id]
      ); // Elimina una tarea
    } else {
      if (type == "task" && procedure == "update") {
        await pool.query(
          `UPDATE tasks SET task_name = $1, 
        status = $2, 
        description = $3,
         container = $4
         WHERE id_task = $5 AND user_id = '${user_id}'`,
          [name, status, markdescription, id_container, id]
        ); // Actualiza una tarea
      }
    }
  }
}

export default taskManager;
