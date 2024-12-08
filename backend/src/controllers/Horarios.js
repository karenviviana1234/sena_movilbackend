import { pool } from "../database/conexion.js";


export const listarHorarios = async (req, res) => {
    try {
        let sql = `
            SELECT h.*, f.codigo, a.nombre_amb
            FROM horarios h
            INNER JOIN fichas f ON h.ficha = f.codigo
            INNER JOIN ambientes a ON h.ambiente = a.id_ambiente
            WHERE h.estado = 1`; // Filtrar por estado activo (suponiendo que 1 significa activo)

        const [results] = await pool.query(sql);
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay actividades registradas'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};

//* Listar los horarios de las fichas  */
export const listarHorariosPorFicha = async (req, res) => {
    const { codigo } = req.params; // Recibimos el ID de la ficha como parámetro
  
    if (!codigo) {
      return res.status(400).json({
        message: 'El ID de la ficha es obligatorio.',
      });
    }
  
    try {
      // Consulta SQL para obtener los horarios asociados a la ficha especificada
      const sql = `
        SELECT h.*, f.*, a.nombre_amb
        FROM horarios h
        INNER JOIN fichas f ON h.ficha = f.codigo
        INNER JOIN ambientes a ON h.ambiente = a.id_ambiente  -- Aquí usamos h.ambiente
        WHERE h.ficha = ? AND h.estado = 1
      `;
      
      const [results] = await pool.query(sql, [codigo]);
  
      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(404).json({
          message: 'No se encontraron horarios asociados a esta ficha.',
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error del servidor: ' + error.message,
      });
    }
  };
  
/* fin */

export const ActualizarHorarios = async (req, res) => {
    const { id_horario } = req.params;
    const { hora_inicio, hora_fin, dia, horas, ficha, ambiente  } = req.body;

    const sql = `
        UPDATE horarios
        SET hora_inicio = ?, hora_fin = ?, dia = ?, horas = ?, ficha = ?, ambiente = ?
        WHERE id_horario = ?
    `;
    try {
        const [result] = await pool.query(sql, [hora_inicio, hora_fin, dia, horas, ficha, ambiente, id_horario]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontró el horario para actualizar' });
        }

        res.status(200).json({ message: 'Horario actualizado con exito' });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor: ' + error });
    }
}

export const CrearHorario = async (req, res) => {
    try {
    const { hora_inicio, hora_fin, dia, horas, ficha, ambiente, estado } = req.body;
    const sql = `INSERT INTO horarios (hora_inicio, hora_fin, dia, horas, ficha, ambiente, estado) VALUES (?, ?, ?, ?, ?, ?, 1)`;

    const [result] = await pool.query(sql, [hora_inicio, hora_fin, dia, horas, ficha, ambiente, estado]);
   if (result.affectedRows>0) {
       res.status(200).json({
           message: 'Horario registrado con exito'
       })
   }else{
       res.status(403).json({
           message: 'Error al registrar el horario'
       })
   }
    } catch (error) {
       res.status(500).json({
           message: 'Error del servidor' + error
       })
   }

}

export const DesactivarHorario = async (req, res) => {
    try {
        const { id_horario } = req.params;

        let sql = `UPDATE horarios SET estado = 2 WHERE id_horario = ?`;

        const [rows] = await pool.query(sql, [id_horario]);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Horario eliminado exitosamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al eliminar el Horario'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};


