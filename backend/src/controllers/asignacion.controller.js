import { pool } from './../database/conexion.js'
export const listarasignaciones = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT 
                p.id_asignacion, 
                per_aprendiz.nombres AS nombre_aprendiz,
                per_instructor.nombres AS nombre_instructor,
                CONCAT(
                    h.hora_inicio, ' - ', 
                    h.hora_fin, ' (', 
                    h.dia, ')'
                ) AS horario, -- Concatenar las columnas de horario
                CONCAT(
                    DATE_FORMAT(act.fecha_inicio, '%Y-%m-%d'), ' a ', 
                    DATE_FORMAT(act.fecha_fin, '%Y-%m-%d')
                ) AS rango_fechas -- Concatenar fecha de inicio y fin
            FROM 
                asignaciones AS p
            LEFT JOIN 
                productivas AS a ON p.productiva = a.id_productiva 
            LEFT JOIN 
                actividades AS act ON p.actividad = act.id_actividad
            LEFT JOIN 
                personas AS per_instructor ON act.instructor = per_instructor.id_persona
            LEFT JOIN 
                personas AS per_aprendiz ON a.aprendiz = per_aprendiz.id_persona
            LEFT JOIN 
                horarios AS h ON act.horario = h.id_horario -- Join con la tabla horarios
        `);

        // Verifica que hay resultados
        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            // En lugar de devolver un error, simplemente devolvemos un mensaje de éxito con data vacía
            return res.status(200).json({
                status: 200,
                message: "No se encontraron asignaciones.",
                data: [] // Aquí se devuelve un array vacío
            });
        }
    } catch (error) {
        console.error("Error en el servidor:", error); // Log para depuración
        return res.status(500).json({
            status: 500,
            message: error.message || "Error interno del servidor."
        });
    }
};


export const registrarasignacion = async (req, res) => {
    const connection = await pool.getConnection(); // Obtener conexión manualmente para usar transacciones
    try {
        const { id_productiva, actividad } = req.body; // Cambié 'productiva' por 'id_productiva'

        if (!actividad || !id_productiva) { // Cambié 'productiva' por 'id_productiva'
            return res.status(400).json({
                status: 400,
                message: "Datos incompletos. Por favor, envíe actividad y id_productiva."
            });
        }

        // Iniciar la transacción
        await connection.beginTransaction();

        // Verificar si la actividad existe y está activa
        const [actividadExist] = await connection.query(
            "SELECT * FROM actividades WHERE id_actividad = ? AND estado = 'Activo'",
            [actividad]
        );

        if (actividadExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "La actividad no existe o no está activa."
            });
        }

        // Obtener el id_instructor de la actividad
        const idInstructor = actividadExist[0].instructor;

        // Obtener el nombre del instructor
        const [instructorData] = await connection.query(
            "SELECT nombres FROM personas WHERE id_persona = ?",
            [idInstructor]
        );

        if (instructorData.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Instructor no encontrado."
            });
        }

        const nombreInstructor = instructorData[0].nombres;

        // Verificar si la etapa productiva existe
        const [productivaExist] = await connection.query(
            "SELECT * FROM productivas WHERE id_productiva = ?",
            [id_productiva] // Cambié 'productiva' por 'id_productiva'
        );

        if (productivaExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No existe Productiva. Registre primero una Productiva."
            });
        }

        // Registrar la asignación en la tabla asignaciones
        const [result] = await connection.query(
            "INSERT INTO asignaciones (productiva, actividad) VALUES (?, ?)",
            [id_productiva, actividad] // Cambié 'productiva' por 'id_productiva'
        );

        if (result.affectedRows > 0) {
            // Actualizar los seguimientos para agregar el nombre del instructor
            const seguimientoUpdateQuery = `
                UPDATE seguimientos 
                SET instructor = ? 
                WHERE productiva = ?
            `;
            await connection.query(seguimientoUpdateQuery, [nombreInstructor, id_productiva]); // Cambié 'productiva' por 'id_productiva'

            // Actualizar las bitácoras para agregar el nombre del instructor
            const bitacoraUpdateQuery = `
                UPDATE bitacoras 
                SET instructor = ? 
                WHERE seguimiento IN (
                    SELECT id_seguimiento FROM seguimientos WHERE productiva = ?
                )
            `;
            await connection.query(bitacoraUpdateQuery, [nombreInstructor, id_productiva]); // Cambié 'productiva' por 'id_productiva'

            // Confirmar la transacción
            await connection.commit();

            return res.status(200).json({
                status: 200,
                message: "Asignación registrada con éxito, incluyendo la actualización de seguimientos y bitácoras."
            });
        } else {
            return res.status(403).json({
                status: 403,
                message: "No se pudo registrar la asignación."
            });
        }
    } catch (error) {
        await connection.rollback(); // Revertir transacción en caso de error
        return res.status(500).json({
            status: 500,
            message: error.message || "Error en el sistema"
        });
    } finally {
        connection.release(); // Liberar la conexión al final
    }
};




export const actualizarasignacion = async (req, res) => {
    try {
        const { id_asignacion } = req.params;
        const { productiva, actividad } = req.body;

        // Verificar si el instructor existe
        const [actividadExist] = await pool.query(
            "SELECT * FROM actividades WHERE id_actividad = ?",
            [actividad]
        );
        if (actividadExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "La actividad no existe. Registre primero una actividad."
            });
        }

        // Verificar si la productiva existe
        const [productivaExist] = await pool.query(
            "SELECT * FROM productivas WHERE id_productiva = ?", 
            [productiva]
        );
        if (productivaExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No existe Productiva. Registre primero una Productiva."
            });
        }

        // Verificar si la asignación existe
        const [asignacionExist] = await pool.query(
            "SELECT * FROM asignaciones WHERE id_asignacion = ?",
            [id_asignacion]
        );
        if (asignacionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No se encontró la programación para actualizar."
            });
        }

        // Realizar la actualización
        const [result] = await pool.query(
            `UPDATE asignaciones 
             SET productiva = ?, actividad = ?
             WHERE id_asignacion = ?`,
            [productiva, actividad, id_asignacion]
        );

        if (result.affectedRows > 0) {
            return res.status(200).json({
                status: 200,
                message: "Se actualizó con éxito."
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "No se encontró la productiva para actualizar o no está autorizado para realizar la actualización."
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message || "Error interno del servidor"
        });
    }
};


export const buscarasignacion = async (req, res) => { 
    try {
        const { id_asignacion } = req.params;
        const [result] = await pool.query(
            `SELECT 
                p.id_asignacion, 
                a.id_productiva AS productiva, 
                act.id_actividad AS actividad
            FROM 
                asignaciones AS p
            LEFT JOIN 
                productiva AS a ON p.productiva = a.id_productiva
            LEFT JOIN 
                actividades AS act ON p.actividad = act.id_actividad
            WHERE 
                p.id_asignacion = ?`,
            [id_asignacion]
        );

        if (result.length > 0) {
            res.status(200).json(result[0]); // Devuelve solo el primer resultado
        } else {
            res.status(404).json({
                status: 404,
                message: "No se encontraron resultados para la búsqueda",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message || "Error interno del servidor",
        });
    }
};

export const eliminarAsignacion = async (req, res) => {
    const connection = await pool.getConnection(); // Obtener conexión manualmente para usar transacciones
    try {
        // Obtener el id_asignacion desde los parámetros de la ruta
        const { id_asignacion } = req.params;

        if (!id_asignacion) {
            return res.status(400).json({
                status: 400,
                message: "Datos incompletos. Por favor, envíe el ID de la asignación."
            });
        }

        // Iniciar la transacción
        await connection.beginTransaction();

        // Verificar si la asignación existe
        const [asignacionExist] = await connection.query(
            "SELECT * FROM asignaciones WHERE id_asignacion = ?",
            [id_asignacion]
        );

        if (asignacionExist.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "La asignación no existe."
            });
        }

        // Eliminar la asignación
        await connection.query(
            "DELETE FROM asignaciones WHERE id_asignacion = ?",
            [id_asignacion]
        );

        // Confirmar la transacción
        await connection.commit();

        return res.status(200).json({
            status: 200,
            message: "Asignación eliminada con éxito."
        });
    } catch (error) {
        await connection.rollback(); // Revertir transacción en caso de error
        return res.status(500).json({
            status: 500,
            message: error.message || "Error en el sistema"
        });
    } finally {
        connection.release(); // Liberar la conexión al final
    }
};
//qw
