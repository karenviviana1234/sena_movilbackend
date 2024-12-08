import multer from 'multer';
import { pool } from '../database/conexion.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/novedad');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
export const cargarImage = upload.single('foto');

export const registrarNovedad = async (req, res) => {
    try {
        let foto = req.file ? req.file.originalname : null;
        let { descripcion, fecha, seguimiento, instructor } = req.body;

        // Validar que la fecha esté en el formato correcto 'YYYY-MM-DD'
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(400).json({ message: 'Formato de fecha incorrecto' });
        }

        if (!descripcion || !fecha || !seguimiento || !instructor) {
            return res.status(400).json({ message: 'Faltan datos en la solicitud' });
        }

        let sql = `INSERT INTO novedades (descripcion, fecha, foto, seguimiento, instructor) VALUES (?, ?, ?, ?, ?)`;
        const [rows] = await pool.query(sql, [descripcion, fecha, foto, seguimiento, instructor]);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Novedad registrada exitosamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al registrar la novedad'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error del servidor: ' + error.message
        });
    }
};
export const listar = async (req, res) => {
    try {
        const { id_seguimiento } = req.params; // Obtener el ID del seguimiento desde los parámetros de la solicitud

        // Consulta para obtener las novedades asociadas al seguimiento
        const [novedades] = await pool.query(`
            SELECT 
                n.id_novedad,
                n.descripcion,
                n.fecha,
                n.foto,
                n.seguimiento,
                n.instructor
            FROM 
                novedades n
            JOIN 
                seguimientos s ON s.id_seguimiento = n.seguimiento
            WHERE 
                n.seguimiento = ?;
        `, [id_seguimiento]);

        if (novedades.length > 0) {
            res.status(200).json(novedades); // Devolver las novedades
        } else {
            res.status(404).json({
                message: 'No hay novedades registradas para este seguimiento',
            });
        }
    } catch (error) {
        console.error('Error al listar novedades:', error);
        res.status(500).json({
            message: 'Error del servidor: ' + error.message,
        });
    }
};

export const listarnovedades = async (req, res) => {
    try {
        const { identificacion } = req.params; // Obtén la identificación del aprendiz desde los parámetros de la solicitud

        // Verifica si la identificacion es válida (debe ser un número)
        if (!identificacion || isNaN(identificacion)) {
            return res.status(400).json({
                message: 'Identificación del aprendiz no válida.'
            });
        }

        // Consulta SQL para obtener las novedades filtradas por la identificación del aprendiz
        let sql = `
            SELECT 
                n.id_novedad, 
                n.seguimiento, 
                n.fecha, 
                n.instructor, 
                n.descripcion, 
                n.foto 
            FROM novedades n
            JOIN seguimientos s ON n.seguimiento = s.id_seguimiento
            JOIN productivas p ON s.productiva = p.id_productiva
            WHERE p.aprendiz = (SELECT id_persona FROM personas WHERE identificacion = ?)`; // Filtra por la identificación del aprendiz

        // Ejecuta la consulta y obtiene los resultados
        const [results] = await pool.query(sql, [identificacion]);

        // Si hay resultados, responde con ellos
        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({
                message: 'No hay novedades registradas para este aprendiz.'
            });
        }
    } catch (error) {
        console.error('Error en listarnovedades:', error); // Loguea el error para depuración
        return res.status(500).json({
            message: 'Error del servidor: ' + (error.message || error)
        });
    }
};


export const actualizarNovedades = async (req, res) => {
    try {
        const { id } = req.params;
        let foto = req.file ? req.file.originalname : null;
        const { descripcion, fecha, seguimiento, instructor } = req.body;

        // Validar y formatear la fecha
        if (fecha && !isValidDate(fecha)) {
            return res.status(400).json({ message: 'Fecha no válida' });
        }
        const formattedDate = fecha ? new Date(fecha).toISOString().split('T')[0] : null;

        const [anterior] = await pool.query(`SELECT * FROM novedades WHERE id_novedad = ?`, [id]);

        let sql = `UPDATE novedades SET
                    descripcion = ?,
                    fecha = ?,
                    seguimiento = ?,
                    instructor = ?`;

        const params = [descripcion || anterior[0].descripcion, formattedDate || anterior[0].fecha, seguimiento || anterior[0].seguimiento, instructor || anterior[0].instructor];

        if (foto) {
            sql += `, foto = ?`;
            params.push(foto);
        }

        sql += ` WHERE id_novedad = ?`;
        params.push(id);

        const [rows] = await pool.query(sql, params);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Novedad actualizada exitosamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al actualizar la novedad'
            });
        }
    } catch (error) {
        console.error("Error del servidor:", error);
        res.status(500).json({
            message: 'Error del servidor'
        });
    }
};

// Función para validar el formato de fecha
const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    return dateString.match(regex) !== null;
};

export const eliminarNovedad = async (req, res) => {
    try {
        const { id_novedad } = req.params

        let sql = `DELETE FROM novedades WHERE id_novedad = ?`

        const [rows] = await pool.query(sql, [id_novedad])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'novedad eliminada exitosamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al eliminar la novedad'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}