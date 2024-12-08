import { pool } from '../database/conexion.js'
export const listarFichasNormal = async (req, res) => {
    try {
        let sql = `
            SELECT fichas.*, programas.sigla 
            FROM fichas
            JOIN programas ON fichas.programa = programas.id_programa
        `;

        const [results] = await pool.query(sql);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay fichas registradas'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};


export const listarFichas = async (req, res) => {
    try {
        let sql = `
            SELECT 
                f.*, 
                p.nombre_programa,
                i.nombres AS nombre_instructor,  
                DATE_FORMAT(f.inicio_ficha, '%Y-%m-%d') AS inicio_ficha,
                DATE_FORMAT(f.fin_lectiva, '%Y-%m-%d') AS fin_lectiva,
                DATE_FORMAT(f.fin_ficha, '%Y-%m-%d') AS fin_ficha
            FROM 
                fichas f
            INNER JOIN 
                programas p ON f.programa = p.id_programa
            LEFT JOIN 
                personas i ON f.lider = i.id_persona  -- Unir con la tabla personas
            WHERE 
                f.estado IN (1, 2)  -- Filtrar solo las fichas con estado 1 o 2
        `;

        const [results] = await pool.query(sql);
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay fichas registradas con estado 1 o 2'
            });
        }
    } catch (error) {
        res.status(500).json({
        });
    }
};



export const obtenerFichaPorId = async (req, res) => {
    try {
        const { id } = req.params

        let sql = `SELECT f.*, p.nombre_programa 
                   FROM fichas f
                   INNER JOIN programas p ON f.programa = p.id_programa
                   WHERE f.codigo = ?`

        const [results] = await pool.query(sql, [id])

        if (results.length > 0) {
            res.status(200).json(results[0])
        } else {
            res.status(404).json({
                message: 'Ficha no encontrada'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor',
            error: error.message
        })
    }
}

export const actualizarFicha = async (req, res) => {
    
    console.log('Actualizando ficha:', req.params.codigo);
    console.log('Datos recibidos:', req.body);

    const { codigo } = req.params;
    const { inicio_ficha, lider, fin_lectiva, fin_ficha, programa, sede, estado } = req.body;

    const sql = `
        UPDATE fichas SET 
        inicio_ficha = ?,
        lider = ?,
        fin_lectiva = ?, 
        fin_ficha = ?, 
        programa = ?, 
        sede = ?, 
        estado = ?
        WHERE codigo = ?
    `;
    try {
        const [result] = await pool.query(sql, [inicio_ficha, lider, fin_lectiva, fin_ficha, programa, sede, estado, codigo]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontró la ficha para actualizar' });
        }
        res.status(200).json({ message: 'Ficha actualizada con éxito' });
    } catch (error) {
        console.error('Error en actualizarFicha:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
};
export const registrarFichas = async (req, res) => {
    try {
        const { codigo, inicio_ficha, fin_lectiva, fin_ficha, programa, sede, lider } = req.body; // Agregamos lider

        // Modificamos la consulta SQL para incluir lider
        let sql = `INSERT INTO fichas (codigo, inicio_ficha, fin_lectiva, fin_ficha, programa, sede, lider, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`;

        // Incluimos lider en el arreglo de parámetros de la consulta
        const [rows] = await pool.query(sql, [codigo, inicio_ficha, fin_lectiva, fin_ficha, programa, sede, lider]);

        if(rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Ficha registrada con éxito'
            });
        } else {
            res.status(403).json({
                message: 'No fue posible registrar la ficha'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};



export const electivaFicha = async (req, res) => {
    try {
        const {id} = req.params
        let sql = `UPDATE fichas SET estado = 2 WHERE codigo =?`

        const [results] = await pool.query(sql, [id])

        if(results.affectedRows>0){
            res.status(200).json({
                message: 'Ficha en estado electiva'
            })
        }else{
            res.status(403).json({
                message: 'No fue posible cambiar a electiva la ficha'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const finFicha = async (req, res) => {
    try {
        const {codigo} = req.params
        let sql = `UPDATE fichas SET estado = 3 WHERE codigo =?`

        const [results] = await pool.query(sql, [codigo])

        if(results.affectedRows>0){
            res.status(200).json({
                message: 'Ficha finalizada con éxito'
            })
        }else{
            res.status(403).json({
                message: 'No fue posible finalizar la ficha'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}
export const finalizarFicha = async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el id de la ficha a finalizar

        // Desactivar la comprobación de claves foráneas
        await pool.query(`SET FOREIGN_KEY_CHECKS = 0`);

        // Consulta SQL para obtener las matrículas asociadas a la ficha
        const sqlObtenerMatriculas = `SELECT id_matricula FROM matriculas WHERE ficha = ?`;
        const [matriculas] = await pool.query(sqlObtenerMatriculas, [id]);

        // Si hay matrículas asociadas, eliminamos los registros relacionados
        if (matriculas.length > 0) {
            const idsMatriculas = matriculas.map(m => m.id_matricula);

            // Eliminar los registros relacionados en la tabla bitacoras
            let deleteBitacorasSql = `
                DELETE b FROM bitacoras b
                JOIN seguimientos s ON b.seguimiento = s.id_seguimiento
                JOIN productivas p ON s.productiva = p.id_productiva
                WHERE p.matricula IN (?)
            `;
            await pool.query(deleteBitacorasSql, [idsMatriculas]);

            // Eliminar los registros relacionados en la tabla seguimientos
            let deleteSeguimientosSql = `
                DELETE s FROM seguimientos s
                JOIN productivas p ON s.productiva = p.id_productiva
                WHERE p.matricula IN (?)
            `;
            await pool.query(deleteSeguimientosSql, [idsMatriculas]);

            // Eliminar los registros relacionados en la tabla productivas
            let deleteProductivasSql = `DELETE FROM productivas WHERE matricula IN (?)`;
            await pool.query(deleteProductivasSql, [idsMatriculas]);

            // Eliminar las matrículas asociadas a la ficha
            let deleteMatriculasSql = `DELETE FROM matriculas WHERE ficha = ?`;
            await pool.query(deleteMatriculasSql, [id]);
        }

        // Actualizar la ficha a estado "finalizado"
        const sqlActualizarFicha = `UPDATE fichas SET estado = 'finalizado' WHERE codigo = ?`;
        const [result] = await pool.query(sqlActualizarFicha, [id]);

        // Reactivar la comprobación de claves foráneas
        await pool.query(`SET FOREIGN_KEY_CHECKS = 1`);

        if (result.affectedRows === 0) {
            return res.status(404).json(); // Si no se encuentra la ficha
        }

        res.status(200).json({ message: 'Ficha finalizada y matrículas eliminadas con éxito' }); // Respuesta exitosa
    } catch (error) {
        console.error('Error en finalizarFicha:', error); // Log para depuración
        res.status(500).json({ message: 'Error del servidor', error: error.message }); // Respuesta de error
    }
};
