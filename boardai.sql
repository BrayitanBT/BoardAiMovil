-- ============================================
-- BASE DE DATOS --
-- ============================================

DROP DATABASE IF EXISTS boardai;

CREATE DATABASE boardai;

USE boardai;

-- ============================================
-- TABLA: usuarios
-- estudiantes y profesores
-- ============================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    rol ENUM('estudiante', 'profesor') NOT NULL
);

-- ============================================
-- TABLA: materias
-- cada materia pertenece a un profesor
-- ============================================
CREATE TABLE materias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(20) UNIQUE,
    profesor_id INT NOT NULL,
    FOREIGN KEY (profesor_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

-- ============================================
-- TABLA: inscripciones
-- estudiantes matriculados a materias
-- ============================================
CREATE TABLE inscripciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estudiante_id INT NOT NULL,
    materia_id INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias (id) ON DELETE CASCADE,
    UNIQUE KEY unique_inscripcion (estudiante_id, materia_id)
);

-- ============================================
-- TABLA: tareas
-- tareas creadas por el profesor para una materia
-- ============================================
CREATE TABLE tareas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    materia_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATETIME,
    archivo_url VARCHAR(500),
    FOREIGN KEY (materia_id) REFERENCES materias (id) ON DELETE CASCADE
);

-- ============================================
-- TABLA: entregas
-- entregas realizadas por estudiantes a tareas
-- ============================================
CREATE TABLE entregas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tarea_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    contenido TEXT,
    archivo_url VARCHAR(500),
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion DECIMAL(5, 2),
    comentario TEXT,
    FOREIGN KEY (tarea_id) REFERENCES tareas (id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    UNIQUE KEY unique_entrega (tarea_id, estudiante_id)
);

-- ============================================
-- TABLA: comentarios
-- comentarios en las tareas por cualquier usuario
-- ============================================
CREATE TABLE comentarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas (id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

INSERT INTO
    usuarios (
        nombre,
        email,
        contrasena,
        rol
    )
VALUES (
        'Profesor Juan',
        'profesor@mail.com',
        '$2b$10$78vF/fD/Jd2C2pQ5D3V.i.sWnK1C5m0C1pL3fX1FjX0zU2H2D0F0s',
        'profesor'
    ),
    (
        'Estudiante Ana',
        'ana@mail.com',
        '$2b$10$78vF/fD/Jd2C2pQ5D3V.i.sWnK1C5m0C1pL3fX1FjX0zU2H2D0F0s',
        'estudiante'
    ),
    (
        'Estudiante Luis',
        'luis@mail.com',
        '$2b$10$78vF/fD/Jd2C2pQ5D3V.i.sWnK1C5m0C1pL3fX1FjX0zU2H2D0F0s',
        'estudiante'
    );
INSERT INTO
    materias (
        nombre,
        descripcion,
        codigo,
        profesor_id
    )
VALUES (
        'Matemáticas',
        'Clase de matemáticas',
        'MAT101',
        1
    ),
    (
        'Programación',
        'Clase de programación',
        'PROG101',
        1
    );

INSERT INTO
    inscripciones (estudiante_id, materia_id)
VALUES (2, 1),
    (2, 2),
    (3, 1);

INSERT INTO
    tareas (
        materia_id,
        titulo,
        descripcion,
        fecha_entrega
    )
VALUES (
        1,
        'Tarea 1 de Matemáticas',
        'Resolver ejercicios',
        '2025-12-20 23:59:00'
    ),
    (
        2,
        'Proyecto de Programación',
        'Crear una calculadora',
        '2025-12-22 23:59:00'
    );

INSERT INTO
    entregas (
        tarea_id,
        estudiante_id,
        contenido,
        calificacion
    )
VALUES (
        1,
        2,
        'Ejercicios resueltos',
        8.5
    ),
    (1, 3, 'Mis respuestas', 7.0);

INSERT INTO
    comentarios (
        tarea_id,
        usuario_id,
        comentario
    )
VALUES (
        1,
        2,
        'Profe, tengo una duda en el ejercicio 3'
    ),
    (
        1,
        1,
        'Ana, revisa el ejemplo del cuaderno'
    ),
    (
        2,
        2,
        '¿La calculadora debe tener interfaz gráfica?'
    );

SELECT 'Base de datos lista con comentarios.' AS mensaje;