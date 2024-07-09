import { pool } from "../database/usersdb.js";

async function getTasks(userId){
    const user_id = userId; // Obtiene el id del usuario de la sesión
  
  // Consulta para obtener las tareas del usuario
  const tasks =
    await pool.query(`SELECT t.user_id as IdUsuario, t.id_task as IdTarea, 
      t.description as descripcion, t.task_name as Tarea,
      t.status as estado, c.id_container as IdContenedor, c.name as contenedor
      FROM tasks t inner join  container c on  c.id_container = t.container
    WHERE t.user_id = ${user_id}`);

    console.log(user_id)
    return tasks
};

export default getTasks;