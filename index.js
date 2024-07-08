import express from "express"; // Importa el framework Express
import dotenv from "dotenv"; // Importa la biblioteca dotenv para manejar variables de entorno
import { pool } from "./database/usersdb.js"; // Importa la conexión a la base de datos
import verifier from "./controller/register.js"; // Importa el controlador para registrar usuarios
import bcrypt from "bcrypt"; // Importa la biblioteca bcrypt para el hashing de contraseñas
import session from "express-session"; // Importa la biblioteca express-session para manejar sesiones
import { marked } from "marked"; // Importa la biblioteca marked para convertir Markdown a HTML
import path from "path";

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const PORT = process.env.PORT || 3000; // Configura el puerto del servidor desde una variable de entorno o usa el puerto 3000 por defecto
const SCRT = process.env.SECRET; // Configura el secreto para las sesiones desde una variable de entorno

const expressApp = express(); // Crea una instancia de la aplicación Express

expressApp.use(express.text()); // Middleware para parsear texto plano en el cuerpo de las solicitudes
expressApp.use(express.json()); // Middleware para parsear JSON en el cuerpo de las solicitudes
expressApp.use(
  session({ secret: SCRT, resave: true, saveUninitialized: true }) // Configura el middleware de sesiones con el secreto, resave y saveUninitialized
);

expressApp.get('/documentation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', './documentation.html'));
});

// Ruta para iniciar sesión
expressApp.post("/login", async (req, res) => {
  const { password, id } = req.body; // Extrae el password y id del cuerpo de la solicitud

  // Consulta para obtener el usuario con el id proporcionado
  const user = await pool.query(`SELECT * FROM users_data WHERE id = '${id}'`);

  if (user.rows.length == 0) {
    res.status(401).send("id de usuario o contraseña incorrectos."); // Si el usuario no existe, envía un error 401
  } else {
    if (await bcrypt.compare(password, user.rows[0].password)) {
      req.session.user = user.rows[0]; // Si la contraseña es correcta, guarda el usuario en la sesión
      res.send("sesion iniciada"); // Envía una respuesta de sesión iniciada
    } else {
      res.status(401).send("id de usuario o contraseña incorrectos."); // Si la contraseña es incorrecta, envía un error 401
    }
  }
  if (user.rows[0]) {
    console.log(user.rows[0].id); // Imprime el id del usuario si existe
  } else {
    console.log("no existe"); // Imprime un mensaje si el usuario no existe
  }
  console.log(req.session.user.name); // Imprime el nombre del usuario en la sesión
});

// Ruta para registrar un nuevo usuario
expressApp.post("/register", async (req, res) => {
  const data = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    await verifier(data); // Llama al verificador para registrar al usuario
    res.send(
      `Usuario creado: Nombre ${data.name}, Email: ${data.email}, Id: ${data.id}` // Envía una respuesta con los datos del usuario creado
    );
  } catch {
    res.status(400).send("Bad request"); // Envía un error 400 si ocurre algún problema
  }
});

// Ruta para manejar tareas
expressApp.post("/tasks", async (req, res) => {
  const { type, name, id, procedure, status, description, id_container } =
    req.body; // Extrae los datos del cuerpo de la solicitud
  const user_id = req.session.user.id; // Obtiene el id del usuario de la sesión

  // Manejo de contenedores (container)
  if (type == "container" && procedure == "create") {
    await pool.query(`INSERT INTO container (name, user_id) 
      VALUES ('${name}', '${user_id}')`); // Inserta un nuevo contenedor
  } else {
    if (type == "container" && procedure == "delete") {
      await pool.query(
        `DELETE FROM container WHERE id_container = '${id_container}' AND user_id = '${user_id}'`
      ); // Elimina un contenedor
    } else {
      if (type == "container" && procedure == "update") {
        await pool.query(
          `UPDATE container SET name = '${name}' WHERE id_container = '${id_container}' AND user_id = '${user_id}'`
        ); // Actualiza un contenedor
      }
    }
  }

  // Convierte la descripción de Markdown a HTML
  const markdescription = marked(description);

  // Manejo de tareas (task)
  if (type == "task" && procedure == "create") {
    await pool.query(`INSERT INTO tasks (task_name, user_id, container, status, description) 
      VALUES ('${name}', '${user_id}', '${id_container}', '1', '${markdescription}')`); // Inserta una nueva tarea
  } else {
    if (type == "task" && procedure == "delete") {
      await pool.query(
        `DELETE FROM tasks WHERE id_task = '${id}' AND user_id = '${user_id}'`
      ); // Elimina una tarea
    } else {
      if (type == "task" && procedure == "update") {
        await pool.query(`UPDATE tasks SET task_name = '${name}', 
        status = '${status}', 
        description = '${description}',
         container = '${id_container}' 
         WHERE id_task = '${id}' AND user_id = '${user_id}'`); // Actualiza una tarea
      }
    }
  }

  res.send(); // Envía una respuesta vacía
});

// Ruta para obtener las tareas del usuario
expressApp.get("/tasks", async (req, res) => {
  const user_id = req.session.user.id; // Obtiene el id del usuario de la sesión

  // Consulta para obtener las tareas del usuario
  const tasks =
    await pool.query(`SELECT *, container.name FROM tasks, container 
    WHERE container.id_container = tasks.container AND tasks.user_id = '${user_id}'`);

  res.send(tasks.rows); // Envía las tareas como respuesta
});

// Inicia el servidor en el puerto especificado
expressApp.listen(PORT, () =>
  console.log(`Servidor funcionando en puerto: ${PORT}`)
);
