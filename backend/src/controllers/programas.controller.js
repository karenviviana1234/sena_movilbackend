import { pool } from "../database/conexion.js";

export const listarPrograma = async (req, res) => {
    try {
        let sql = `SELECT * FROM programas WHERE estado = 'activo'`;

        const [results] = await pool.query(sql);

        if(results.length > 0){
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay programas activos registrados'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};
export const registrarPrograma = async (req, res) => {
    try {
        const { nombre_programa, sigla, nivel } = req.body;

        let sql = `INSERT INTO programas (nombre_programa, sigla, nivel, estado) VALUES (?, ?, ?, 1)`; // '1' indica que el estado es activo

        const [rows] = await pool.query(sql, [nombre_programa, sigla, nivel]);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Programa registrado correctamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al registrar el programa'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};

export const actualizarPrograma = async (req, res) => {
    try {
        const { id_programa } = req.params;
        const { nombre_programa, sigla, nivel } = req.body;

        let sql = `UPDATE programas SET
                    nombre_programa = ?,
                    sigla = ?,
                    nivel = ?
                    WHERE id_programa = ?`;

        const [rows] = await pool.query(sql, [nombre_programa, sigla, nivel, id_programa]);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Programa actualizado correctamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al actualizar el programa'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        });
    }
}


export const inactivarPrograma = async (req, res) => {
    try {
        const {id_programa} = req.params
        let sql = `UPDATE programas SET estado = 2 WHERE id_programa =?`

        const [rows] = await pool.query(sql, [id_programa])

        if(rows.affectedRows>0){
            res.status(200).json({
                message: 'programa inactivada correctamente'
            })
        }else{
            res.status(403).json({
                message: 'Error al inactivar la programa'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const activarPrograma = async (req, res) => {
    try {
        const {id} = req.params
        let sql = `UPDATE programas SET estado = 1 WHERE id_programa =?`

        const [rows] = await pool.query(sql, [id])

        if(rows.affectedRows>0){
            res.status(200).json({
                message: 'Programa activada correctamente'
            })
        }else{
            res.status(403).json({
                message: 'Error al activar la programa'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}