import { pool } from "../database/conexion.js";

export const listarVinculaciones = async (req, res) => {
    try {
        let sql = `SELECT * FROM vinculacion`

        const [results] = await pool.query(sql)

        if(results.length>0){
            res.status(200).json(results)
        }else{
            res.status(404).json({
                message: 'No hay vinculaciones registradas'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const registrarVinculacion = async (req, res) => {
    try {
        const { instructor, tipo, sede, area } = req.body

        let sql = `INSERT INTO vinculacion (instructor, tipo, sede, area, estado) VALUES (?, ?, ?, ?, 1)`
        
        const [rows] = await pool.query(sql, [instructor, tipo, sede, area])

        if(rows.affectedRows>0){
            res.status(200).json({
                message: 'Vinculación registrada correctamente'
            })
        }else{
            res.status(403).json({
                message: 'Error al registrar la vinculación'
            })
        }

    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const actualizarVinculacion = async (req, res) => {
    try {
        const {id} = req.params
        const { instructor, tipo, sede, area } = req.body

        let sql = `UPDATE vinculacion SET
                    instructor = ?,
                    tipo =?,
                    sede =?,
                    area =?
                    
                    WHERE id_vinculacion = ?`
        
        const [rows] = await pool.query(sql, [instructor, tipo, sede, area, id])

        if(rows.affectedRows>0){
            res.status(200).json({
                message: 'Vinculación sctualizada correctamente'
            })
        }else{
            res.status(403).json({
                message: 'Error al actualizar la vinculación'
            })
        }

    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const inactivarVinculacion = async(req, res) => {
    try {
        const {id} = req.params
        let sql = `UPDATE vinculacion SET estado = 2 WHERE id_vinculacion =?`

        const [rows] = await pool.query(sql, [id])

        if(rows.affectedRows>0){
            res.status(200).json({
                message: 'Vinculación inactivada correctamente'
            })
        }else{
            res.status(403).json({
                message: 'Error al inactivar la vinculación'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const activarVinculacion = async (req, res) => {
    try {
        const {id} = req.params
        let sql = `UPDATE vinculacion SET estado = 1 WHERE id_vinculacion = ?`

        const [rows] = await pool.query(sql, [id])

        if(rows.affectedRows>0){
            res.status(200).json({
                message: 'Vinculación activada correctamente'
            })
        }else{
            res.status(403).json({
                message: 'Error al activar la vinculación'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}