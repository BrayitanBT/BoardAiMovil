require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(express.json());

// -------------------- CORS MEJORADO --------------------
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// -------------------- DB --------------------
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión a DB al iniciar
db.getConnection()
  .then(connection => {
    console.log("✅ Conexión exitosa a MySQL");
    connection.release();
  })
  .catch(err => {
    console.error("❌ Error conectando a MySQL:", err.message);
    process.exit(1);
  });

// -------------------- JWT --------------------
const JWT_SECRET = process.env.JWT_SECRET || "cambia_esto_en_produccion";

// Helper: crear token
function crearToken(user) {
  return jwt.sign(
    { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Middleware auth (verifica token)
function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      console.log("AUTH FAIL: No Header");
      return res.status(401).json({ success: false, message: "Token requerido" });
    }
    const token = header.split(" ")[1];
    if (!token) {
      console.log("AUTH FAIL: No Token");
      return res.status(401).json({ success: false, message: "Token requerido" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log(`AUTH SUCCESS: Usuario decodificado: ${decoded.email}, Rol: ${decoded.rol}`);

    req.user = decoded;
    return next();
  } catch (err) {
    console.error("AUTH FAIL: Error de verificación de Token:", err.message);
    return res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
}

// Middleware roles: acepta array de roles permitidos
function rolesPermitidos(allowed = []) {
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.rol)) {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }
    next();
  };
}

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    status: "healthy",
    database: "connected"
  });
});

// -------------------- AUTH: register / login --------------------
app.post("/register", async (req, res) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;
    
    if (!nombre || !email || !contrasena || !rol) {
      return res.status(400).json({ success: false, message: "Faltan datos requeridos" });
    }
    
    if (!["estudiante", "profesor"].includes(rol)) {
      return res.status(400).json({ success: false, message: "Rol inválido. Debe ser 'estudiante' o 'profesor'" });
    }

    const [exists] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (exists.length) {
      return res.status(400).json({ success: false, message: "Email ya registrado" });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)", 
      [nombre, email, hash, rol]
    );

    const newUser = { id: result.insertId, nombre, email, rol };
    const token = crearToken(newUser);

    return res.status(201).json({ 
      success: true, 
      message: "Usuario registrado exitosamente",
      token: token,
      user: newUser
    });
  } catch (err) {
    console.error("Error en /register:", err);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    
    if (!email || !contrasena) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!ok) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const token = crearToken(user);
    return res.json({ 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        rol: user.rol 
      } 
    });
  } catch (err) {
    console.error("Error en /login:", err);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// -------------------- ACTUALIZAR USUARIO --------------------
// Actualizar información del usuario (nombre, email)
app.put("/users/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const { nombre, email } = req.body;
    
    // Solo permitir al propio usuario actualizar su información
    if (parseInt(userId) !== currentUserId) {
      return res.status(403).json({ success: false, message: "Solo puedes actualizar tu propio perfil" });
    }
    
    if (!nombre && !email) {
      return res.status(400).json({ success: false, message: "Debes proporcionar nombre o email para actualizar" });
    }
    
    // Verificar si el email ya existe (si se está actualizando el email)
    if (email) {
      const [existingEmail] = await db.query(
        "SELECT id FROM usuarios WHERE email = ? AND id != ?", 
        [email, userId]
      );
      if (existingEmail.length) {
        return res.status(400).json({ success: false, message: "El email ya está en uso por otro usuario" });
      }
    }
    
    // Construir la consulta de actualización dinámicamente
    let updateFields = [];
    let updateValues = [];
    
    if (nombre) {
      updateFields.push("nombre = ?");
      updateValues.push(nombre);
    }
    
    if (email) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }
    
    updateValues.push(userId);
    
    await db.query(
      `UPDATE usuarios SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );
    
    // Obtener el usuario actualizado
    const [rows] = await db.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?", 
      [userId]
    );
    
    const updatedUser = rows[0];
    
    // Generar nuevo token con la información actualizada
    const newToken = crearToken(updatedUser);
    
    return res.json({ 
      success: true, 
      message: "Perfil actualizado exitosamente",
      user: updatedUser,
      token: newToken // Enviar nuevo token actualizado
    });
  } catch (err) {
    console.error("Error en PUT /users/:id:", err);
    return res.status(500).json({ success: false, message: "Error al actualizar el perfil" });
  }
});

// -------------------- CAMBIAR CONTRASEÑA --------------------
app.put("/users/:id/password", auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const { current_password, new_password } = req.body;
    
    // Solo permitir al propio usuario cambiar su contraseña
    if (parseInt(userId) !== currentUserId) {
      return res.status(403).json({ success: false, message: "Solo puedes cambiar tu propia contraseña" });
    }
    
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: "Debes proporcionar la contraseña actual y la nueva" });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: "La nueva contraseña debe tener al menos 6 caracteres" });
    }
    
    // Obtener la contraseña actual del usuario
    const [rows] = await db.query(
      "SELECT contrasena FROM usuarios WHERE id = ?", 
      [userId]
    );
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    
    // Verificar la contraseña actual
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(current_password, user.contrasena);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "La contraseña actual es incorrecta" });
    }
    
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Actualizar la contraseña
    await db.query(
      "UPDATE usuarios SET contrasena = ? WHERE id = ?",
      [hashedPassword, userId]
    );
    
    return res.json({ 
      success: true, 
      message: "Contraseña cambiada exitosamente"
    });
  } catch (err) {
    console.error("Error en PUT /users/:id/password:", err);
    return res.status(500).json({ success: false, message: "Error al cambiar la contraseña" });
  }
});

// -------------------- OBTENER USUARIO POR ID --------------------
app.get("/users/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const currentUserRol = req.user.rol;

    // Solo permitir al propio usuario o a profesores
    if (parseInt(userId) !== currentUserId && currentUserRol !== 'profesor') {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }

    const [rows] = await db.query(`
      SELECT id, nombre, email, rol 
      FROM usuarios 
      WHERE id = ?
    `, [userId]);
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    return res.json({ 
      success: true, 
      user: rows[0]
    });
  } catch (err) {
    console.error("Error en GET /users/:id:", err);
    return res.status(500).json({ success: false, message: "Error al cargar el usuario" });
  }
});

// -------------------- MATERIAS --------------------
// Crear materia (solo profesor)
app.post("/materias", auth, rolesPermitidos(["profesor"]), async (req, res) => {
  try {
    const { nombre, descripcion, codigo } = req.body;
    const profesor_id = req.user.id;

    if (!nombre) {
      return res.status(400).json({ success: false, message: "Nombre es requerido" });
    }

    const [result] = await db.query(
      "INSERT INTO materias (nombre, descripcion, codigo, profesor_id) VALUES (?, ?, ?, ?)", 
      [nombre, descripcion || null, codigo || null, profesor_id]
    );
    
    return res.status(201).json({ 
      success: true, 
      message: "Materia creada exitosamente",
      materiaId: result.insertId
    });
  } catch (err) {
    console.error("Error en POST /materias:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "El código de materia ya existe" });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Listar todas las materias (cualquiera autenticado)
app.get("/materias", auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, u.nombre AS profesor_nombre 
      FROM materias m 
      JOIN usuarios u ON m.profesor_id = u.id
      ORDER BY m.id DESC
    `);
    return res.json({ success: true, materias: rows });
  } catch (err) {
    console.error("Error en GET /materias:", err);
    return res.status(500).json({ success: false, message: "Error al cargar materias" });
  }
});

// Obtener materia por id
app.get("/materias/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, u.nombre AS profesor_nombre 
      FROM materias m 
      JOIN usuarios u ON m.profesor_id = u.id
      WHERE m.id = ?
    `, [req.params.id]);
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Materia no encontrada" });
    }
    
    return res.json({ success: true, materia: rows[0] });
  } catch (err) {
    console.error("Error en GET /materias/:id:", err);
    return res.status(500).json({ success: false, message: "Error al cargar materia" });
  }
});

// Actualizar materia (solo profesor que la creó)
app.put("/materias/:id", auth, rolesPermitidos(["profesor"]), async (req, res) => {
  try {
    const materiaId = req.params.id;
    const profesor_id = req.user.id;
    
    const [rows] = await db.query("SELECT * FROM materias WHERE id = ?", [materiaId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Materia no encontrada" });
    }
    if (rows[0].profesor_id !== profesor_id) {
      return res.status(403).json({ success: false, message: "No eres el profesor de esta materia" });
    }

    const { nombre, descripcion, codigo } = req.body;
    await db.query(
      "UPDATE materias SET nombre = ?, descripcion = ?, codigo = ? WHERE id = ?", 
      [nombre || rows[0].nombre, descripcion || rows[0].descripcion, codigo || rows[0].codigo, materiaId]
    );
    
    return res.json({ success: true, message: "Materia actualizada exitosamente" });
  } catch (err) {
    console.error("Error en PUT /materias/:id:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Eliminar materia (solo profesor dueño)
app.delete("/materias/:id", auth, rolesPermitidos(["profesor"]), async (req, res) => {
  try {
    const materiaId = req.params.id;
    const profesor_id = req.user.id;
    
    const [rows] = await db.query("SELECT * FROM materias WHERE id = ?", [materiaId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Materia no encontrada" });
    }
    if (rows[0].profesor_id !== profesor_id) {
      return res.status(403).json({ success: false, message: "No eres el profesor de esta materia" });
    }

    await db.query("DELETE FROM materias WHERE id = ?", [materiaId]);
    return res.json({ success: true, message: "Materia eliminada exitosamente" });
  } catch (err) {
    console.error("Error en DELETE /materias/:id:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- INSCRIPCIONES --------------------
// Inscribirse (estudiante)
app.post("/inscripciones", auth, rolesPermitidos(["estudiante"]), async (req, res) => {
  try {
    const estudiante_id = req.user.id;
    const { materia_id } = req.body;
    
    if (!materia_id) {
      return res.status(400).json({ success: false, message: "materia_id es requerido" });
    }

    const [materia] = await db.query("SELECT id FROM materias WHERE id = ?", [materia_id]);
    if (!materia.length) {
      return res.status(404).json({ success: false, message: "Materia no encontrada" });
    }

    const [result] = await db.query(
      "INSERT INTO inscripciones (estudiante_id, materia_id) VALUES (?, ?)", 
      [estudiante_id, materia_id]
    );
    
    return res.status(201).json({ success: true, message: "Inscripción exitosa" });
  } catch (err) {
    console.error("Error en POST /inscripciones:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Ya estás inscrito en esta materia" });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Salir de materia (estudiante)
app.delete("/inscripciones/:materia_id", auth, rolesPermitidos(["estudiante"]), async (req, res) => {
  try {
    const estudiante_id = req.user.id;
    const materia_id = req.params.materia_id;
    
    await db.query(
      "DELETE FROM inscripciones WHERE estudiante_id = ? AND materia_id = ?", 
      [estudiante_id, materia_id]
    );
    
    return res.json({ success: true, message: "Te saliste de la materia exitosamente" });
  } catch (err) {
    console.error("Error en DELETE /inscripciones/:materia_id:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Listar materias del usuario autenticado
app.get("/mi/materias", auth, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const rol = req.user.rol;
    let query = '';
    let params = [usuario_id];

    if (rol === 'estudiante') {
      // Estudiante: Materias en las que está inscrito
      query = `
        SELECT m.*, u.nombre AS profesor_nombre 
        FROM materias m
        JOIN inscripciones i ON m.id = i.materia_id
        JOIN usuarios u ON m.profesor_id = u.id
        WHERE i.estudiante_id = ?
        ORDER BY m.id DESC
      `;
    } else if (rol === 'profesor') {
      // Profesor: Materias que ha creado (que enseña)
      query = `
        SELECT m.*, u.nombre AS profesor_nombre 
        FROM materias m
        JOIN usuarios u ON m.profesor_id = u.id
        WHERE m.profesor_id = ?
        ORDER BY m.id DESC
      `;
    } else {
      return res.status(403).json({ success: false, message: "Acceso no permitido para este rol" });
    }

    const [rows] = await db.query(query, params);
    
    return res.json({ success: true, materias: rows });
  } catch (err) {
    console.error("Error en GET /mi/materias:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- TAREAS --------------------
// Crear tarea (profesor dueño de la materia)
app.post("/tareas", auth, rolesPermitidos(["profesor"]), async (req, res) => {
  try {
    const profesor_id = req.user.id;
    const { materia_id, titulo, descripcion, fecha_entrega, archivo_url } = req.body;

    if (!materia_id || !titulo) {
      return res.status(400).json({ success: false, message: "materia_id y titulo son requeridos" });
    }

    // verificar profesor dueño
    const [mRows] = await db.query("SELECT * FROM materias WHERE id = ?", [materia_id]);
    if (!mRows.length) {
      return res.status(404).json({ success: false, message: "Materia no encontrada" });
    }
    if (mRows[0].profesor_id !== profesor_id) {
      return res.status(403).json({ success: false, message: "No eres el profesor de esta materia" });
    }

    const [result] = await db.query(
      "INSERT INTO tareas (materia_id, titulo, descripcion, fecha_entrega, archivo_url) VALUES (?, ?, ?, ?, ?)", 
      [materia_id, titulo, descripcion || null, fecha_entrega || null, archivo_url || null]
    );
    
    return res.status(201).json({ 
      success: true, 
      message: "Tarea creada exitosamente",
      tareaId: result.insertId
    });
  } catch (err) {
    console.error("Error en POST /tareas:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Listar tareas por materia
app.get("/materias/:id/tareas", auth, async (req, res) => {
  try {
    const materia_id = req.params.id;
    const [rows] = await db.query(`
      SELECT * FROM tareas 
      WHERE materia_id = ? 
      ORDER BY fecha_creacion DESC
    `, [materia_id]);
    
    return res.json({ success: true, tareas: rows });
  } catch (err) {
    console.error("Error en GET /materias/:id/tareas:", err);
    return res.status(500).json({ success: false, message: "Error al cargar tareas" });
  }
});

// Obtener tarea por ID (NUEVO ENDPOINT)
app.get("/tareas/:id", auth, async (req, res) => {
  try {
    const tareaId = req.params.id;
    const usuarioId = req.user.id;
    const rol = req.user.rol;

    let query = '';
    let params = [tareaId];

    if (rol === 'profesor') {
      // Profesor solo puede ver tareas de sus materias
      query = `
        SELECT t.*, m.nombre AS materia_nombre, m.profesor_id 
        FROM tareas t 
        JOIN materias m ON t.materia_id = m.id 
        WHERE t.id = ? AND m.profesor_id = ?
      `;
      params.push(usuarioId);
    } else if (rol === 'estudiante') {
      // Estudiante puede ver tareas de materias en las que está inscrito
      query = `
        SELECT t.*, m.nombre AS materia_nombre 
        FROM tareas t 
        JOIN materias m ON t.materia_id = m.id 
        JOIN inscripciones i ON m.id = i.materia_id
        WHERE t.id = ? AND i.estudiante_id = ?
      `;
      params.push(usuarioId);
    }

    const [rows] = await db.query(query, params);
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada o acceso denegado" });
    }

    const tarea = rows[0];
    
    // Eliminar profesor_id del objeto de respuesta si existe
    if (tarea.profesor_id) {
      delete tarea.profesor_id;
    }

    return res.json({ 
      success: true, 
      tarea: tarea
    });
  } catch (err) {
    console.error("Error en GET /tareas/:id:", err);
    return res.status(500).json({ success: false, message: "Error al cargar la tarea" });
  }
});

// Actualizar tarea (profesor dueño)
app.put("/tareas/:id", auth, rolesPermitidos(["profesor"]), async (req, res) => {
  try {
    const tareaId = req.params.id;
    const profesor_id = req.user.id;
    const { titulo, descripcion, fecha_entrega, archivo_url } = req.body;

    const [trows] = await db.query(`
      SELECT t.*, m.profesor_id 
      FROM tareas t 
      JOIN materias m ON t.materia_id = m.id 
      WHERE t.id = ?
    `, [tareaId]);
    
    if (!trows.length) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada" });
    }
    if (trows[0].profesor_id !== profesor_id) {
      return res.status(403).json({ success: false, message: "No eres el profesor de esta materia" });
    }

    await db.query(`
      UPDATE tareas 
      SET titulo = ?, descripcion = ?, fecha_entrega = ?, archivo_url = ? 
      WHERE id = ?
    `, [
      titulo || trows[0].titulo, 
      descripcion || trows[0].descripcion, 
      fecha_entrega || trows[0].fecha_entrega, 
      archivo_url || trows[0].archivo_url, 
      tareaId
    ]);
    
    return res.json({ success: true, message: "Tarea actualizada exitosamente" });
  } catch (err) {
    console.error("Error en PUT /tareas/:id:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Eliminar tarea (profesor dueño)
app.delete("/tareas/:id", auth, rolesPermitidos(["profesor"]), async (req, res) => {
  try {
    const tareaId = req.params.id;
    const profesor_id = req.user.id;

    const [trows] = await db.query(`
      SELECT t.*, m.profesor_id 
      FROM tareas t 
      JOIN materias m ON t.materia_id = m.id 
      WHERE t.id = ?
    `, [tareaId]);
    
    if (!trows.length) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada" });
    }
    if (trows[0].profesor_id !== profesor_id) {
      return res.status(403).json({ success: false, message: "No eres el profesor de esta materia" });
    }

    await db.query("DELETE FROM tareas WHERE id = ?", [tareaId]);
    return res.json({ success: true, message: "Tarea eliminada exitosamente" });
  } catch (err) {
    console.error("Error en DELETE /tareas/:id:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- ENTREGAS --------------------
// Estudiante crea entrega
app.post("/entregas", auth, rolesPermitidos(["estudiante"]), async (req, res) => {
  try {
    const estudiante_id = req.user.id;
    const { tarea_id, contenido, archivo_url } = req.body;

    if (!tarea_id) {
      return res.status(400).json({ success: false, message: "tarea_id es requerido" });
    }

    const [tarea] = await db.query("SELECT id FROM tareas WHERE id = ?", [tarea_id]);
    if (!tarea.length) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada" });
    }

    const [result] = await db.query(
      "INSERT INTO entregas (tarea_id, estudiante_id, contenido, archivo_url) VALUES (?, ?, ?, ?)", 
      [tarea_id, estudiante_id, contenido || null, archivo_url || null]
    );
    
    return res.status(201).json({ 
      success: true, 
      message: "Entrega enviada exitosamente",
      entregaId: result.insertId
    });
  } catch (err) {
    console.error("Error en POST /entregas:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Ya entregaste esta tarea" });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Obtener entrega específica por ID (NUEVO ENDPOINT)
app.get("/entregas/:id", auth, async (req, res) => {
  try {
    const entregaId = req.params.id;
    const usuarioId = req.user.id;
    const rol = req.user.rol;

    let query = '';
    let params = [entregaId];

    if (rol === 'estudiante') {
      query = `
        SELECT 
          e.id, e.tarea_id, e.estudiante_id, e.contenido, e.archivo_url, e.fecha_entrega, e.calificacion, e.comentario,
          t.titulo, t.materia_id, m.nombre AS materia_nombre, 
          u.nombre AS estudiante_nombre, u.email AS estudiante_email
        FROM entregas e 
        JOIN tareas t ON e.tarea_id = t.id 
        JOIN materias m ON t.materia_id = m.id
        JOIN usuarios u ON e.estudiante_id = u.id
        WHERE e.id = ? AND e.estudiante_id = ?
      `;
      params.push(usuarioId);
    } else if (rol === 'profesor') {
      query = `
        SELECT 
          e.id, e.tarea_id, e.estudiante_id, e.contenido, e.archivo_url, e.fecha_entrega, e.calificacion, e.comentario,
          t.titulo, 
          t.materia_id,
          m.nombre AS materia_nombre, 
          u.nombre AS estudiante_nombre, u.email AS estudiante_email,
          m.profesor_id
        FROM entregas e 
        JOIN tareas t ON e.tarea_id = t.id 
        JOIN materias m ON t.materia_id = m.id
        JOIN usuarios u ON e.estudiante_id = u.id
        WHERE e.id = ? AND m.profesor_id = ?
      `;
      params.push(usuarioId);
    } else {
      return res.status(403).json({ success: false, message: "Acceso no permitido para este rol" });
    }

    const [rows] = await db.query(query, params);
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Entrega no encontrada o acceso denegado" });
    }

    const entrega = rows[0];
    
    // Eliminar profesor_id del objeto de respuesta
    if (entrega.profesor_id) {
      delete entrega.profesor_id;
    }

    return res.json({ 
      success: true, 
      entrega: entrega
    });
  } catch (err) {
    console.error("Error en GET /entregas/:id:", err);
    return res.status(500).json({ success: false, message: "Error al cargar la entrega" });
  }
});

// Profesor ve entregas de una tarea
app.get("/tareas/:id/entregas", auth, rolesPermitidos(["profesor"]), async (req, res) => {
  try {
    const tareaId = req.params.id;
    const profesorId = req.user.id;
    
    const [trows] = await db.query(`
      SELECT t.id 
      FROM tareas t 
      JOIN materias m ON t.materia_id = m.id 
      WHERE t.id = ? AND m.profesor_id = ?
    `, [tareaId, profesorId]);
    
    if (!trows.length) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada o acceso denegado" });
    }

    const [rows] = await db.query(`
      SELECT 
        e.id, e.tarea_id, e.estudiante_id, e.contenido, e.archivo_url, e.fecha_entrega, e.calificacion, e.comentario,
        t.materia_id, 
        u.nombre AS estudiante_nombre, u.email AS estudiante_email 
      FROM entregas e 
      JOIN tareas t ON e.tarea_id = t.id 
      JOIN usuarios u ON e.estudiante_id = u.id 
      WHERE e.tarea_id = ?
      ORDER BY e.fecha_entrega DESC
    `, [tareaId]);
    
    return res.json({ success: true, entregas: rows });
  } catch (err) {
    console.error("Error en GET /tareas/:id/entregas:", err);
    return res.status(500).json({ success: false, message: "Error al cargar entregas" });
  }
});

// Profesor califica entrega
app.put("/entregas/:id/calificar", auth, rolesPermitidos(["profesor"]), async (req, res) => {
  try {
    const entregaId = req.params.id;
    const { calificacion, comentario_profesor } = req.body;

    const [erows] = await db.query(`
      SELECT e.*, t.materia_id, m.profesor_id 
      FROM entregas e 
      JOIN tareas t ON e.tarea_id = t.id 
      JOIN materias m ON t.materia_id = m.id 
      WHERE e.id = ?
    `, [entregaId]);

    if (!erows.length) {
      return res.status(404).json({ success: false, message: "Entrega no encontrada" });
    }
    if (erows[0].profesor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "No eres el profesor de esta materia" });
    }

    await db.query(`
      UPDATE entregas 
      SET calificacion = ?, comentario = ? 
      WHERE id = ?
    `, [calificacion || null, comentario_profesor || null, entregaId]);

    return res.json({ success: true, message: "Entrega calificada exitosamente" });
  } catch (err) {
    console.error("Error en PUT /entregas/:id/calificar:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Estudiante lista sus entregas, Profesor lista las pendientes
app.get("/mi/entregas", auth, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const rol = req.user.rol;
    let query = '';
    let params = [usuario_id];

    if (rol === 'estudiante') {
      query = `
        SELECT 
          e.id, e.tarea_id, e.estudiante_id, e.contenido, e.archivo_url, e.fecha_entrega, e.calificacion, e.comentario,
          t.titulo, t.materia_id, m.nombre AS materia_nombre, 
          NULL AS estudiante_nombre
        FROM entregas e 
        JOIN tareas t ON e.tarea_id = t.id 
        JOIN materias m ON t.materia_id = m.id
        WHERE e.estudiante_id = ?
        ORDER BY e.fecha_entrega DESC
      `;
    } else if (rol === 'profesor') {
      query = `
        SELECT 
          e.id, e.tarea_id, e.estudiante_id, e.contenido, e.archivo_url, e.fecha_entrega, e.calificacion, e.comentario,
          t.titulo, 
          t.materia_id,
          m.nombre AS materia_nombre, 
          u.nombre AS estudiante_nombre 
        FROM entregas e 
        JOIN tareas t ON e.tarea_id = t.id 
        JOIN materias m ON t.materia_id = m.id
        JOIN usuarios u ON e.estudiante_id = u.id
        WHERE m.profesor_id = ? 
        AND e.calificacion IS NULL  
        ORDER BY e.fecha_entrega ASC
      `;
    } else {
      return res.status(403).json({ success: false, message: "Acceso no permitido para este rol" });
    }

    const [rows] = await db.query(query, params);
    
    return res.json({ success: true, entregas: rows });
  } catch (err) {
    console.error("Error en GET /mi/entregas:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- COMENTARIOS --------------------
// Listar comentarios por tarea
app.get("/tareas/:id/comentarios", auth, async (req, res) => {
  try {
    const tarea_id = req.params.id;
    const [rows] = await db.query(`
      SELECT c.id, c.comentario, c.creado_en, 
             u.id as usuario_id, u.nombre as usuario_nombre, u.rol
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.tarea_id = ?
      ORDER BY c.creado_en ASC
    `, [tarea_id]);
    
    return res.json({ success: true, comentarios: rows });
  } catch (err) {
    console.error("Error en GET /tareas/:id/comentarios:", err);
    return res.status(500).json({ success: false, message: "Error al cargar comentarios" });
  }
});

// Crear comentario
app.post("/tareas/:id/comentarios", auth, async (req, res) => {
  try {
    const tarea_id = req.params.id;
    const usuario_id = req.user.id;
    const { comentario } = req.body;
    
    if (!comentario || comentario.trim() === '') {
      return res.status(400).json({ success: false, message: "El comentario no puede estar vacío" });
    }

    const [tarea] = await db.query("SELECT id FROM tareas WHERE id = ?", [tarea_id]);
    if (!tarea.length) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada" });
    }

    const [result] = await db.query(
      "INSERT INTO comentarios (tarea_id, usuario_id, comentario) VALUES (?, ?, ?)", 
      [tarea_id, usuario_id, comentario]
    );
    
    return res.status(201).json({ 
      success: true, 
      message: "Comentario creado exitosamente",
      comentarioId: result.insertId
    });
  } catch (err) {
    console.error("Error en POST /tareas/:id/comentarios:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Eliminar comentario
app.delete("/comentarios/:id", auth, async (req, res) => {
  try {
    const comentarioId = req.params.id;
    const usuarioId = req.user.id;

    const [rows] = await db.query(`
      SELECT c.*, t.materia_id, m.profesor_id
      FROM comentarios c
      JOIN tareas t ON c.tarea_id = t.id
      JOIN materias m ON t.materia_id = m.id
      WHERE c.id = ?
    `, [comentarioId]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Comentario no encontrado" });
    }

    const comentario = rows[0];
    if (comentario.usuario_id !== usuarioId && comentario.profesor_id !== usuarioId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para eliminar este comentario" });
    }

    await db.query("DELETE FROM comentarios WHERE id = ?", [comentarioId]);
    return res.json({ success: true, message: "Comentario eliminado exitosamente" });
  } catch (err) {
    console.error("Error en DELETE /comentarios/:id:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- ERROR HANDLING --------------------
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Ruta no encontrada" 
  });
});

app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ 
    success: false, 
    message: "Error interno del servidor" 
  });
});

// -------------------- SERVER --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Servidor API corriendo            ║
║   📍 Puerto: ${PORT}                        ║
║   🌐 http://localhost:${PORT}              ║
║   📱 Red local: http://[TU_IP]:${PORT}     ║
╚════════════════════════════════════════╝
  `);
  console.log("✅ Base de datos conectada");
});