import { pool } from "../database/conexion.js";
export const listarAmbientes = async (req, res) => {
    try {
        let sql = `
          SELECT 
    a.id_ambiente,
    a.nombre_amb, 
    m.nombre_mpio as municipio,  
    a.sede,
    a.estado
FROM 
    ambientes a
LEFT JOIN 
    municipios m ON a.municipio = m.id_municipio

        `;

        const [results] = await pool.query(sql);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay ambientes registrados'
            });

        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
};


export const registrarAmbientes = async (req, res) => {
    try {
        const { nombre_amb, municipio, sede } = req.body

        let sql = `INSERT INTO ambientes (nombre_amb, municipio, sede, estado) VALUES (?, ?, ?, 1)`

        const [rows] = await pool.query(sql, [nombre_amb, municipio, sede])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Ambiente registrado correctamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al registrar el ambiente'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}


export const actualizarAmbientes = async (req, res) => {
    try {
        const { id_ambiente } = req.params
        const { nombre_amb, municipio, sede } = req.body

        let sql = `UPDATE ambientes SET
                    nombre_amb = ?,
                    municipio =?,
                    sede =?
                    
                    WHERE id_ambiente = ?`

        const [rows] = await pool.query(sql, [nombre_amb, municipio, sede, id_ambiente])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Ambiente actualizado correctamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al actualizar el ambiente'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const activarAmbiente = async (req, res) => {
    try {
        const { id_ambiente } = req.params

        let sql = `UPDATE ambientes SET estado = 1 WHERE id_ambiente = ?`

        const [rows] = await pool.query(sql, [id_ambiente])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Ambiente activado correctamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al activar el ambiente'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const inactivarAmbiente = async (req, res) => {
    try {
        const { id_ambiente } = req.params

        let sql = `UPDATE ambientes SET estado = 2 WHERE id_ambiente = ?`

        const [rows] = await pool.query(sql, [id_ambiente])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Ambiente inactivo correctamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al inactivar el ambiente'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}
