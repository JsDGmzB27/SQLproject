import express from "express";
import dontenv from "dotenv";
import { pool } from "./database/usersdb.js";
import verifier from "./controller/register.js";
import bcrypt from "bcrypt";
import session from "express-session";
import { marked, Marked } from "marked";

dontenv.config();

const PORT = process.env.PORT || 3000;
const SCRT = process.env.SECRET

const expressApp = express();

expressApp.use(express.text());
expressApp.use(express.json());
expressApp.use(
  session({ secret: SCRT, resave: true, saveUninitialized: true })
);

expressApp.post("/login", async (req, res) => {
  const { password, id } = req.body;

  const user = await pool.query(`SELECT * FROM users_data WHERE id = '${id}'`);

  if (user.rows.length == 0) {
    res.status(401).send("id de usuario o contraseña incorrectos.");
  } else {
    if (await bcrypt.compare(password, user.rows[0].password)) {
      req.session.user = user.rows[0];
      /* res.redirect("/tasks"); */
      res.send("sesion iniciada");
    } else {
      res.status(401).send("id de usuario o contraseña incorrectos.");
    }
  }
  if (user.rows[0]) {
    console.log(user.rows[0].id);
  } else {
    console.log("no existe");
  }
  console.log(req.session.user.name);
});

expressApp.post("/register", async (req, res) => {
  const data = req.body;

  try {
    await verifier(data);
    res.send(
      `Usuario creado: Nombre ${data.name}, Email: ${data.email}, Id: ${data.id}`
    );
  } catch {
    res.status(400).send("Bad request");
  }
});

expressApp.post("/tasks", async (req, res) => {
  const { type, name, id, procedure, status, description, id_container } =
    req.body;
  const user_id = req.session.user.id;

  if (type == "container" && procedure == "create") {
    await pool.query(`INSERT INTO container (name, user_id) 
      VALUES ('${name}', '${user_id}')`);
  } else {
    if (type == "container" && procedure == "delete") {
      await pool.query(
        `DELETE FROM container WHERE id_container = '${id_container}' AND user_id = '${user_id}'`
      );
    } else {
      if (type == "container" && procedure == "update") {
        await pool.query(
          `UPDATE container SET name = '${name}' WHERE id_container = '${id_container}' AND user_id = '${user_id}'`
        );
      }
    }
  }
  const markdescription = marked(description)
  if (type == "task" && procedure == "create") {
    await pool.query(`INSERT INTO tasks (task_name, user_id, container, status, description) 
      VALUES ('${name}', '${user_id}', '${id_container}', '1', '${markdescription}')`);
  } else {
    if (type == "task" && procedure == "delete") {
      await pool.query(
        `DELETE FROM tasks WHERE id_task = '${id}' AND user_id = '${user_id}'`
      );
    } else {
      if (type == "task" && procedure == "update") {
        await pool.query(`UPDATE tasks SET task_name = '${name}', 
        status = '${status}', 
        description = '${description}',
         container = '${id_container}' 
         WHERE id_task = '${id}' AND user_id = '${user_id}'`);
      }
    }
  }

  res.send();
});

expressApp.get("/tasks", async (req, res) => {
  const user_id = req.session.user.id;

  const tasks =
    await pool.query(`SELECT *, container.name FROM tasks, container 
    WHERE container.id_container = tasks.container AND tasks. user_id = '${user_id}'`);

  res.send(tasks.rows);
});

expressApp.listen(PORT, () =>
  console.log(`Servidor funcionando en puerto: ${PORT}`) 
);
