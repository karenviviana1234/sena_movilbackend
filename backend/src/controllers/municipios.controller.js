import { pool } from "../database/conexion.js"

export const listarMunicipios = async (req, res) => {
    try {
        let sql = `SELECT * FROM municipios`

        const [results] = await pool.query(sql)
        
        if(results.length>0){
            res.status(200).json(results)
        }else{
            res.status(404).json({
                message: 'No hay ambientes registrados'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}