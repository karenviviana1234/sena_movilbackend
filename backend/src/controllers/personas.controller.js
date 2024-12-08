import { pool } from "../database/conexion.js";
import bcrypt from 'bcrypt'

export const listarPersonas = async (req, res) => {
  try {
    // Realizamos la consulta para obtener todas las personas
    let sql = `SELECT * FROM personas`;
    const [results] = await pool.query(sql);

    // Contamos el total de personas
    const total = results.length;

    if (total > 0) {
      res.status(200).json({
        total: total, // Devolvemos el total de personas
        personas: results // Devolvemos la lista de personas
      });
    } else {
      res.status(404).json({
        message: 'No hay personas registradas'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error del servidor: ' + error.message // Agregamos un mensaje más claro
    });
  }
};




export const listarInstructores = async (req, res) => {
  try {
    const sql = 'SELECT * FROM personas WHERE cargo = ? AND estado = ?';
    const values = ['Instructor', 'Activo'];
    const [results] = await pool.query(sql, values);

    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({
        message: 'No hay instructores activos registrados',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: `Error del servidor: ${error.message}`,
    });
  }
};

export const listarInstructoresLider = async (req, res) => {
  try {
    const sql = 'SELECT * FROM personas WHERE cargo = ? AND rol = ? AND estado = ?';
    const values = ['Instructor', 'Lider', 'Activo'];
    const [results] = await pool.query(sql, values);

    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({
        message: 'No hay instructores líderes activos registrados',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: `Error del servidor: ${error.message}`,
    });
  }
};

export const listarAprendices = async (req, res) => {
  try {
    // Consulta SQL con JOIN para obtener el nombre del municipio
    const sql = `
      SELECT p.*, m.nombre_mpio
      FROM personas p
      LEFT JOIN municipios m ON p.municipio = m.id_municipio
      WHERE p.rol = 'Aprendiz'
    `;
    const [results] = await pool.query(sql);

    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({
        message: 'No hay personas con el rol de aprendiz'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error del servidor: ' + error.message
    });
  }
};

export const listarMunicipios = async (req, res) => {
  try {
    let sql = `SELECT * FROM municipios`
    const [results] = await pool.query(sql)

    if (results.length > 0) {
      res.status(200).json(results)
    } else {
      res.status(404).json({
        message: 'No hay municipios registrados'
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error del servidor' + error
    })
  }
}

/* Registrar Aprendices */
export const registrarAprendiz = async (req, res) => {
  try {
    const { identificacion, nombres, correo, telefono, municipio } = req.body;

    if (!municipio) {
      return res.status(400).json({
        status: 400,
        message: 'El campo municipio es obligatorio para el rol de aprendiz.'
      });
    }

    // Usar la identificación como contraseña por defecto
    const bcryptPassword = bcrypt.hashSync(identificacion.toString(), 12);

    /* rol, cargo como 'Aprendiz' y estado como 'Activo' */
    const query = `INSERT INTO personas (identificacion, nombres, correo, telefono, password, rol, cargo, municipio, estado) VALUES (?, ?, ?, ?, ?, 'Aprendiz', 'Aprendiz', ?, 'Activo')`;
    const params = [identificacion, nombres, correo, telefono, bcryptPassword, municipio];

    const [result] = await pool.query(query, params);

    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: 'Se registró con éxito el aprendiz ' + nombres
      });
    } else {
      res.status(403).json({
        status: 403,
        message: 'No se registró el aprendiz'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error del servidor: ' + error.message
    });
  }
};

/* Registrar Instructores */
export const registrarInstructor = async (req, res) => {
  try {
    const { identificacion, nombres, correo, telefono, rol, tipo, sede, area } = req.body;

    const sedeValida = ['Yamboro', 'Centro'];
    if (sede && !sedeValida.includes(sede)) {
        return res.status(400).json({
            message: 'Sede no válido'
        });
    }

    const tipoValida = ['Contratista', 'Planta'];
    if (tipo && !tipoValida.includes(tipo)) {
        return res.status(400).json({
            message: 'Tipo no válido'
        });
    }


    // Validar campos requeridos
    if (!identificacion || !nombres || !correo || !telefono || !rol || !tipo ||!sede ||!area) {
      return res.status(400).json({
        status: 400,
        message: 'Todos los campos son obligatorios.',
      });
    }

    // Verificar si la identificación ya existe
    const checkQuery = 'SELECT COUNT(*) AS count FROM personas WHERE identificacion = ?';
    const [checkResult] = await pool.query(checkQuery, [identificacion]);

    if (checkResult[0].count > 0) {
      return res.status(409).json({
        status: 409,
        message: 'La identificación ya está registrada.',
      });
    }

    // Usar identificacion como contraseña por defecto y hacer el hash
    const defaultPassword = identificacion.toString(); // Convertir a string si no es ya una cadena
    const bcryptPassword = bcrypt.hashSync(defaultPassword, 12);

    // Consulta SQL para insertar datos
    const query = `INSERT INTO personas (identificacion, nombres, correo, telefono, password, rol,  tipo, sede, area, cargo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)`;
    const params = [identificacion, nombres, correo, telefono, bcryptPassword, rol,  tipo, sede, area, 'Instructor', 'Activo'];

    const [result] = await pool.query(query, params);

    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: 'Se registró con éxito el usuario ' + nombres,
      });
    } else {
      res.status(403).json({
        status: 403,
        message: 'No se registró el usuario',
      });
    }
  } catch (error) {
    console.error('Error del servidor:', error);  // Registrar el error en la consola
    res.status(500).json({
      status: 500,
      message: 'Error del servidor: ' + error.message,
    });
  }
};

/* Actualizar Personas */
export const actualizarPersona = async (req, res) => {
  try {
    const { id_persona } = req.params;
    const { identificacion, nombres, correo, telefono, rol, cargo, municipio } = req.body;

    if (!identificacion || !nombres || !correo || !telefono || !rol) {
      return res.status(400).json({
        status: 400,
        message: 'Todos los campos son obligatorios.',
      });
    }

    const [oldPersona] = await pool.query("SELECT * FROM personas WHERE id_persona = ?", [id_persona]);

    if (oldPersona.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
      });
    }

    // Generar la nueva contraseña hasheada
    const newPassword = await bcrypt.hash(identificacion.toString(), 10);

    const updatedUsuario = {
      identificacion: identificacion || oldPersona[0].identificacion,
      nombres: nombres || oldPersona[0].nombres,
      correo: correo || oldPersona[0].correo,
      telefono: telefono || oldPersona[0].telefono,
      rol: rol || oldPersona[0].rol,
      cargo: cargo || oldPersona[0].cargo,
      municipio: municipio || oldPersona[0].municipio,
      password: newPassword 
    };

    const [result] = await pool.query(
      `UPDATE personas SET 
          identificacion = ?, 
          nombres = ?, 
          correo = ?, 
          telefono = ?, 
          rol = ?, 
          cargo = ?, 
          municipio = ?, 
          password = ?  
         WHERE id_persona = ?`,
      [
        updatedUsuario.identificacion,
        updatedUsuario.nombres,
        updatedUsuario.correo,
        updatedUsuario.telefono,
        updatedUsuario.rol,
        updatedUsuario.cargo,
        updatedUsuario.municipio,
        updatedUsuario.password, 
        id_persona
      ]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "El usuario ha sido actualizado.",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "No se pudo actualizar el usuario, inténtalo de nuevo.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el sistema: " + error.message,
    });
  }
};

/* Buscar Personas */
export const buscarPersonas = async (req, res) => {
  try {
    const { id_persona } = req.params;

    const [result] = await pool.query("SELECT * FROM personas WHERE id_persona=?", [id_persona]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        status: 404,
        message: "No se encontró el Usuario"
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error en el sistema: ' + error
    });
  }
};

/* Eliminar Persona */
export const eliminarPersona = async (req, res) => {
  try {

    const { id_persona } = req.params

    let sql = `DELETE from personas WHERE id_persona = ?`

    const [rows] = await pool.query(sql, [id_persona])

    if (rows.affectedRows > 0) {
      res.status(200).json({
        message: 'Usuario eliminado con éxito'
      })
    } else {
      res.status(403).json({
        message: 'Error al eliminar el usuario'
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error del servidor' + error
    })
  }
}

export const desactivarPersona = async (req, res) => {
  try {
    const { id_persona } = req.params;
    const sql = 'UPDATE personas SET estado = ? WHERE id_persona = ?';
    const values = ['Inactivo', id_persona];
    const [result] = await pool.query(sql, values);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Estado actualizado a Inactivo' });
    } else {
      res.status(404).json({ message: 'Persona no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor: ' + error.message });
  }
};
/* Perfi de la persona */

export const perfil = async (req, res) => {
  const { id_persona } = req.params;
  try {
    const query = `
     SELECT 
    p.identificacion,
    p.nombres, 
    p.correo, 
    p.telefono, 
    p.rol,
    p.sede,
    p.area,
    p.municipio,
    m.nombre_mpio AS id_municipio
FROM personas p
LEFT JOIN municipios m ON p.municipio = m.id_municipio
WHERE p.id_persona = ?;
    `;

    const [rows] = await pool.query(query, [id_persona]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    const persona = rows[0];

    if (persona.rol !== 'aprendiz') {
      delete persona.municipio;
    }

    if (persona.rol !== 'instructor') {
      delete persona.tipo_sede;
      delete persona.area;
    }

    res.json(persona);

  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error en el sistema: ' + error.message
    });
  }
};
export const actualizarPerfil = async (req, res) => {
  const { id_persona } = req.params;
  const { identificacion, nombres, correo, telefono, rol, sede, area, municipio } = req.body;

  try {
    // Validar si la persona existe
    const queryPersona = 'SELECT * FROM personas WHERE id_persona = ?';
    const [personaExistente] = await pool.query(queryPersona, [id_persona]);

    if (personaExistente.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    // Obtener los valores actuales si no se proporcionan en el cuerpo de la solicitud
    const personaActual = personaExistente[0];

    const updatedIdentificacion = identificacion || personaActual.identificacion;
    const updatedNombres = nombres || personaActual.nombres;
    const updatedCorreo = correo || personaActual.correo;
    const updatedTelefono = telefono || personaActual.telefono;
    const updatedRol = rol || personaActual.rol;
    const updatedSede = sede || personaActual.sede;
    const updatedArea = area || personaActual.area;
    const updatedMunicipio = municipio || personaActual.municipio;

    // Actualizar la persona
    const queryUpdate = `
      UPDATE personas 
      SET identificacion = ?, nombres = ?, correo = ?, telefono = ?, rol = ?, sede = ?, area = ?, municipio = ?
      WHERE id_persona = ?;
    `;

    const [result] = await pool.query(queryUpdate, [
      updatedIdentificacion,
      updatedNombres,
      updatedCorreo,
      updatedTelefono,
      updatedRol,
      updatedSede,
      updatedArea,
      updatedMunicipio,
      id_persona
    ]);

    // Verificar si se actualizó algo
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No se pudo actualizar el perfil' });
    }

    // Obtener los datos actualizados
    const querySelectUpdated = `
      SELECT 
        p.identificacion,
        p.nombres, 
        p.correo, 
        p.telefono, 
        p.rol,
        p.sede,
        p.area,
        p.municipio,
        m.nombre_mpio AS id_municipio
      FROM personas p
      LEFT JOIN municipios m ON p.municipio = m.id_municipio
      WHERE p.id_persona = ?;
    `;
    
    const [updatedPersona] = await pool.query(querySelectUpdated, [id_persona]);

    res.json({
      message: 'Perfil actualizado correctamente',
      persona: updatedPersona[0]
    });

  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error en el sistema: ' + error.message
    });
  }
};



export const registrarUsuarios = async (req, res) => {
  try {
    const { identificacion, nombres, correo, telefono, password, cargo, sede } = req.body;

    // Verifica la cantidad de usuarios registrados por tipo de cargo
    const [result] = await pool.query('SELECT COUNT(*) as count FROM personas WHERE cargo = ?', [cargo.toLowerCase()]);

    if (cargo.toLowerCase() === "administrativo" && result[0].count >= 2) {
      return res.status(400).json({ message: "Ya existen 2 usuarios registrados como Administrativos." });
    }

    if (cargo.toLowerCase() === "coordinador" && result[0].count >= 1) {
      return res.status(400).json({ message: "Ya existe 1 usuario registrado como Coordinador." });
    }

    // Determina el rol según el cargo
    let rol;
    if (cargo.toLowerCase() === "administrativo") {
      rol = "seguimiento";
    } else if (cargo.toLowerCase() === "coordinador") {
      rol = "coordinador"; 
    }

    const estado = 'activo';

    // Encripta la contraseña usando bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserta el nuevo usuario en la base de datos
    const [rows] = await pool.query(
      `INSERT INTO personas (identificacion, nombres, correo, password, telefono, rol, cargo, estado, sede) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [identificacion, nombres, correo, hashedPassword, telefono, rol, cargo, estado, sede]
    );

    if (rows.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: 'Se registró con éxito el usuario ' + nombres
      });
    } else {
      res.status(403).json({
        status: 403,
        message: 'No se registró el usuario'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error del servidor: ' + error.message
    });
  }
};

//cambiar instructor en etapa practica
export const cambiarInstructor = async (req, res) => {
  try {
    const { id_persona } = req.params;
    const { id_nuevo_instructor } = req.body;

    const [oldPersona] = await pool.query("SELECT * FROM personas WHERE id_persona =?", [id_persona]);

    if (oldPersona.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'Usuario no encontrado',
      });
    }

    const [newInstructor] = await pool.query("SELECT * FROM personas WHERE id_persona =?", [id_nuevo_instructor]);

    if (newInstructor.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'Nuevo instructor no encontrado',
      });
    }

    const updatedUsuario = {
      cargo: 'Instructor',
      id_persona: id_nuevo_instructor,
    };

    const [result] = await pool.query(
      `UPDATE personas SET 
          cargo =?,
          id_persona =?
         WHERE id_persona =?`,
      [
        updatedUsuario.cargo,
        updatedUsuario.id_persona,
        id_persona
      ]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "El instructor ha sido cambiado.",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "No se pudo cambiar el instructor, inténtalo de nuevo.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el sistema: " + error.message,
    });
  }
};export const listarAprendicesPorInstructor = async (req, res) => {
  const { id_persona } = req.params;

  const sql = `
      SELECT
          p.identificacion AS identificacion,
          p.nombres AS nombres,
          p.correo AS correo,
          f.codigo AS codigo,
          prg.sigla AS sigla,
          e.razon_social AS razon_social,
          s.id_seguimiento AS id_seguimiento,
          s.seguimiento AS seguimiento,
          s.fecha AS fecha_seguimiento,
          s.estado AS estado_seguimiento,
          s.pdf AS pdf_seguimiento,  -- Incluir PDF del seguimiento
          b.id_bitacora AS id_bitacora,
          b.estado AS estado_bitacora,
          b.pdf AS pdf_bitacora,  -- PDF de la bitácora
          instr.identificacion AS instructor_identificacion,
          instr.nombres AS nombre_instructor
      FROM
          productivas pr
          LEFT JOIN matriculas m ON pr.matricula = m.id_matricula
          LEFT JOIN personas p ON m.aprendiz = p.id_persona
          LEFT JOIN empresas e ON pr.empresa = e.id_empresa
          LEFT JOIN fichas f ON m.ficha = f.codigo
          LEFT JOIN programas prg ON f.programa = prg.id_programa
          LEFT JOIN asignaciones asg ON asg.productiva = pr.id_productiva
          LEFT JOIN actividades a ON asg.actividad = a.id_actividad
          LEFT JOIN personas instr ON a.instructor = instr.id_persona
          LEFT JOIN seguimientos s ON s.productiva = pr.id_productiva
          LEFT JOIN bitacoras b ON b.seguimiento = s.id_seguimiento
      WHERE
          instr.id_persona = ?
      ORDER BY
          p.identificacion, s.seguimiento, b.id_bitacora;
  `;

  try {
      const [results] = await pool.query(sql, [id_persona]);

      const aprendicesMap = {};

      results.forEach(row => {
          if (!aprendicesMap[row.identificacion]) {
              aprendicesMap[row.identificacion] = {
                  identificacion: row.identificacion,
                  nombres: row.nombres,
                  correo: row.correo,
                  codigo: row.codigo,
                  sigla: row.sigla,
                  razon_social: row.razon_social,
                  seguimientos: [],
                  instructor_identificacion: row.instructor_identificacion,
                  nombre_instructor: row.nombre_instructor,
              };
          }

          let seguimiento = aprendicesMap[row.identificacion].seguimientos.find(s => s.id_seguimiento === row.id_seguimiento);

          if (!seguimiento && row.id_seguimiento) {
              seguimiento = {
                  id_seguimiento: row.id_seguimiento,
                  seguimiento: row.seguimiento,
                  fecha_seguimiento: row.fecha_seguimiento,
                  estado_seguimiento: row.estado_seguimiento,
                  pdf_seguimiento: row.pdf_seguimiento, // PDF del seguimiento
                  bitacoras: []
              };
              aprendicesMap[row.identificacion].seguimientos.push(seguimiento);
          }

          if (row.id_bitacora) {
              seguimiento.bitacoras.push({
                  id_bitacora: row.id_bitacora,
                  estado_bitacora: row.estado_bitacora,
                  pdf: row.pdf_bitacora // PDF de la bitácora
              });
          }
      });

      res.status(200).json(Object.values(aprendicesMap));
  } catch (error) {
      console.error("Error al listar aprendices asignados al instructor:", error);
      res.status(500).json({ message: "Error al obtener los aprendices asignados al instructor" });
  }
};
