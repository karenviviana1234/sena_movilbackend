import { pool } from './../database/conexion.js'

export const registrarActividad = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, instructor, horario,  tipo, solicitud } = req.body;

        let sql = `INSERT INTO actividades (estado, fecha_inicio, fecha_fin, instructor, horario,  tipo, solicitud) VALUES (1, ?, ?, ?, ?, ?, ?)`;

        const [rows] = await pool.query(sql, [ fecha_inicio, fecha_fin, instructor, horario,  tipo, solicitud]);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Actividad registrada exitosamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al registrar la actividad'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};


export const listarActividades = async (req, res) => {
    const { id_persona } = req.params;

    try {
        // Consulta con JOINs para obtener la información de actividades, horarios, nombre del instructor y el día, hora de inicio y hora de fin
        let sql = `
            SELECT 
                a.*,  -- Todos los campos de la tabla 'actividades'
                p.nombres AS instructor,  -- Nombre del instructor
                h.ficha AS horario_ficha,  -- Ficha con el horario de la actividad
                h.dia AS horario_dia,  -- Día del horario
                h.hora_inicio AS horario_inicio,  -- Hora de inicio del horario
                h.hora_fin AS horario_fin  -- Hora de fin del horario
            FROM actividades a
            JOIN personas p ON a.instructor = p.id_persona  -- Relacionar actividades con personas por id_persona
            JOIN horarios h ON a.horario = h.id_horario  -- Relacionar actividades con horarios por id_horario
            WHERE a.instructor = ?  -- Filtrar por el ID del instructor
            AND a.estado = 'Activo'  -- Solo actividades activas
        `;

        const [results] = await pool.query(sql, [id_persona]);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay actividades registradas para este instructor'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};

export const listarActividad = async (req, res) => {
    try {
        // Consulta con JOINs para obtener la información de actividades, horarios, nombre del instructor y el día, hora de inicio y hora de fin
        let sql = `
            SELECT 
                a.*,  -- Todos los campos de la tabla 'actividades'
                p.nombres AS instructor,  -- Nombre del instructor
                h.ficha AS horario_ficha,  -- Ficha con el horario de la actividad
                h.dia AS horario_dia,  -- Día del horario
                h.hora_inicio AS horario_inicio,  -- Hora de inicio del horario
                h.hora_fin AS horario_fin  -- Hora de fin del horario
            FROM actividades a
            JOIN personas p ON a.instructor = p.id_persona  -- Relacionar actividades con personas por id_persona
            JOIN horarios h ON a.horario = h.id_horario  -- Relacionar actividades con horarios por id_horario
            WHERE a.estado = 'Activo'  -- Solo actividades activas
        `;

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


export const actualizarActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, fecha_inicio, fecha_fin, instructor, horario,  tipo, solicitud } = req.body;

        const [anterior] = await pool.query(`SELECT * FROM actividades WHERE id_actividad = ?`, [id]);

        let sql = `UPDATE actividades SET
                    estado = ?,
                    fecha_inicio = ?,
                    fecha_fin = ?,
                    instructor = ?,
                    horario = ?,
                    tipo = ?,
                    solicitud = ?
                    WHERE id_actividad = ?`;

        const params = [
            estado || anterior[0].estado,
            fecha_inicio || anterior[0].fecha_inicio,
            fecha_fin || anterior[0].fecha_fin,
            instructor || anterior[0].instructor,
            horario || anterior[0].horario,
            tipo || anterior[0].tipo,
            solicitud || anterior[0].solicitud,
            id
        ];

        const [rows] = await pool.query(sql, params);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Actividad actualizada exitosamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al actualizar la actividad'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};

export const desactivarActividad = async (req, res) => {
    try {
        const { id } = req.params;

        let sql = `UPDATE actividades SET estado = 2 WHERE id_actividad = ?`;

        const [rows] = await pool.query(sql, [id]);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Actividad desactivada exitosamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al desactivar la actividad'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};

export const activarActividad = async (req, res) => {
    try {
        const { id } = req.params;

        let sql = `UPDATE actividades SET estado = 1 WHERE id_actividad = ?`;

        const [rows] = await pool.query(sql, [id]);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Actividad activada exitosamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al activar la actividad'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};