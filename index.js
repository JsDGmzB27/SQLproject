import express from "express"; // Importa el framework Express
import dotenv from "dotenv"; // Importa la biblioteca dotenv para manejar variables de entorno
import verifier from "./controllers/register.js"; // Importa el controlador para registrar usuarios
import bcrypt from "bcrypt"; // Importa la biblioteca bcrypt para el hashing de contraseñas
import session from "express-session"; // Importa la biblioteca express-session para manejar sesiones
import taskManager from "./controllers/tasks.js";
import loginController from "./controllers/login.js";
import getTasks from "./controllers/getTasks.js";

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const PORT = process.env.PORT || 3000; // Configura el puerto del servidor desde una variable de entorno o usa el puerto 3000 por defecto
const SCRT = process.env.SECRET; // Configura el secreto para las sesiones desde una variable de entorno

const expressApp = express(); // Crea una instancia de la aplicación Express

expressApp.use(express.text()); // Middleware para parsear texto plano en el cuerpo de las solicitudes
expressApp.use(express.json()); // Middleware para parsear JSON en el cuerpo de las solicitudes
expressApp.use(
  session({
    secret: SCRT,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 15 * 60 * 1000 },
  }) // Configura el middleware de sesiones con el secreto, resave y saveUninitialized
);

// Ruta para iniciar sesión
expressApp.post("/login", async (req, res) => {
  const { password } = req.body;

  const user = await loginController(req.body);

  if (user.rows.length == 0) {
    res.status(401).send("id de usuario o contraseña incorrectos."); // Si el usuario no existe, envía un error 401
  } else {
    if (await bcrypt.compare(password, user.rows[0].password)) {
      req.session.user = user.rows[0]; // Si la contraseña es correcta, guarda el usuario en la sesión
      res.send("sesion iniciada como: " + req.session.user.name); // Envía una respuesta de sesión iniciada
    } else {
      res.status(401).send("id de usuario o contraseña incorrectos."); // Si la contraseña es incorrecta, envía un error 401
    }
  }

  if (user.rows[0]) {
    console.log(user.rows[0].id); // Imprime el id del usuario si existe
  } else {
    console.log("no existe"); // Imprime un mensaje si el usuario no existe
  }
});


// Ruta para registrar un nuevo usuario
expressApp.post("/register", async (req, res) => {
  const data = req.body; // Extrae los datos del cuerpo de la solicitud

  try {
    await verifier(data); // Llama al verificador para registrar al usuario
    res.send(
      `Usuario creado: Nombre ${data.name}, Email: ${data.email}, Id: ${data.id}` // Envía una respuesta con los datos del usuario creado
    );
  } catch(error){
    res.status(400).send("Bad request"); // Envía un error 400 si ocurre algún problema
  }
});


// Ruta para manejar tareas
expressApp.post("/tasks", async (req, res) => {
  try {
    const userId = req.session.user.id;

    await taskManager(req.body, userId);
  } catch(error){
    res.status(401).send(`${error}`);
  }

  res.send(); // Envía una respuesta vacía
});

// Ruta para obtener las tareas del usuario
expressApp.get("/tasks", async (req, res) => {
  try {
    const tasks = await getTasks(req.session.user.id);
    console.log(tasks.rows)
    res.send(tasks.rows); // Envía las tareas como respuesta
  } catch{
    res.status(401).send("Error al obtener tareas, asegurese de haber creado alguna o de iniciar sesion.");
  } 
});

expressApp.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error al cerrar sesión");
    }
    res.clearCookie("connect.sid"); // Limpia la cookie de sesión
    res.send("Sesion finalizada");
  });
});

// Inicia el servidor en el puerto especificado
expressApp.listen(PORT, () =>
  console.log(`Servidor funcionando en puerto: ${PORT}`)
);
