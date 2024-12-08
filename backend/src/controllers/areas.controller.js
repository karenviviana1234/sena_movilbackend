import { pool } from "../database/conexion.js"

export const listarAreas = async (req, res) => {
    try {
        let sql = "SELECT * FROM areas"

        const [results] = await pool.query(sql)
        if(results.length>0){
            res.status(200).json(results)
        }else{
            res.status(404).json({
                message: 'No hay actividades registradas'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}