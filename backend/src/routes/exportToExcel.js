import Router from 'express';
import { pool } from '../database/conexion.js'
import { GetMatriculas } from '../controllers/matriculas.controller.js';

const router = Router();

router.get('/datos-ficha/:ficha', async (req, res) => {
    try {
        const ficha = req.params.ficha;

        const sql = `
            SELECT 
                m.id_matricula, m.ficha, m.aprendiz, m.estado, 
                m.pendiente_tecnicos, m.pendiente_transversales, m.pendiente_ingles,
                p.id_persona, p.identificacion, p.nombres, p.correo, p.telefono
            FROM matriculas m
            INNER JOIN personas p ON m.aprendiz = p.id_persona
            WHERE m.ficha = ?
            ORDER BY m.ficha
        `;

        const results = await GetMatriculas(pool, sql, [ficha]);

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({
                message: 'No hay matrículas registradas para la ficha especificada',
            });
        }
    } catch (error) {
        console.error('Error al obtener datos de la ficha:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            details: error.message || JSON.stringify(error)
        });
    }
});

export default router;