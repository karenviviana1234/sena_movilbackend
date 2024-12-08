import { pool } from './../database/conexion.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';

// Obtener el directorio actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Multer para cargar el PDF */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/seguimientos");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
export const cargarSeguimiento = upload.single('seguimientoPdf');

// Función para listar seguimientos
export const listarSeguimiento = async (req, res) => {
    try {
        const sql = `SELECT * FROM seguimientos`;
        const [result] = await pool.query(sql);
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ error: 'No hay seguimientos registrados' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' + error });
    }
};


export const listarSeguimientoAprendices = async (req, res) => {
    const { identificacion, rol, cargo } = req.user; // Obtiene la información del usuario
    try {
        let sql;
        let params = [];

        if (rol === 'Coordinador' || rol === 'Seguimiento') {
            // Si es Coordinador o Seguimiento, obtiene todos los seguimientos
            sql = `
                SELECT
                    p.identificacion AS identificacion,
                    p.nombres AS nombres,
                    p.correo AS correo, 
                    f.codigo AS codigo,
                    prg.sigla AS sigla,
                    e.razon_social AS razon_social,
                    s.id_seguimiento AS id_seguimiento,
                    s.seguimiento AS seguimiento,
                    s.fecha AS fecha,
                    s.estado AS estado,
                    COUNT(b.id_bitacora) AS total_bitacoras,
                    SUM(CASE WHEN b.pdf IS NOT NULL THEN 1 ELSE 0 END) AS bitacoras_con_pdf,
                    (SUM(CASE WHEN b.pdf IS NOT NULL THEN 1 ELSE 0 END) / 12) * 100 AS porcentaje,
                    instr.identificacion AS instructor_identificacion,
                    instr.nombres AS nombre_instructor
                FROM
                    seguimientos s
                    LEFT JOIN productivas pr ON s.productiva = pr.id_productiva
                    LEFT JOIN matriculas m ON pr.matricula = m.id_matricula
                    LEFT JOIN personas p ON m.aprendiz = p.id_persona
                    LEFT JOIN empresas e ON pr.empresa = e.id_empresa
                    LEFT JOIN fichas f ON m.ficha = f.codigo
                    LEFT JOIN programas prg ON f.programa = prg.id_programa
                    LEFT JOIN bitacoras b ON b.seguimiento = s.id_seguimiento
                    LEFT JOIN asignaciones asg ON asg.productiva = pr.id_productiva
                    LEFT JOIN actividades a ON asg.actividad = a.id_actividad
                    LEFT JOIN personas instr ON a.instructor = instr.id_persona
                GROUP BY
                    s.id_seguimiento, p.identificacion, p.correo, s.seguimiento, s.fecha, f.codigo, prg.sigla, e.razon_social, s.estado, instr.identificacion, instr.nombres
                ORDER BY
                    p.identificacion, s.seguimiento;
            `;
        } else if (cargo === 'Instructor') {
            // Si es instructor, filtrar los seguimientos donde es el instructor asignado
            sql = `
                SELECT
                    p.identificacion AS identificacion,
                    p.nombres AS nombres,
                    p.correo AS correo,
                    f.codigo AS codigo,
                    prg.sigla AS sigla,
                    e.razon_social AS razon_social,
                    s.id_seguimiento AS id_seguimiento,
                    s.seguimiento AS seguimiento,
                    s.fecha AS fecha,
                    s.estado AS estado,
                    pr.id_productiva AS productiva, -- Campo productiva
                    b.id_bitacora AS id_bitacora,
                    b.estado AS estado_bitacora,
                    instr.identificacion AS instructor_identificacion,
                    instr.nombres AS nombre_instructor
                FROM
                    seguimientos s
                    LEFT JOIN productivas pr ON s.productiva = pr.id_productiva
                    LEFT JOIN matriculas m ON pr.matricula = m.id_matricula
                    LEFT JOIN personas p ON m.aprendiz = p.id_persona
                    LEFT JOIN empresas e ON pr.empresa = e.id_empresa
                    LEFT JOIN fichas f ON m.ficha = f.codigo
                    LEFT JOIN programas prg ON f.programa = prg.id_programa
                    LEFT JOIN bitacoras b ON b.seguimiento = s.id_seguimiento
                    LEFT JOIN asignaciones asg ON asg.productiva = pr.id_productiva
                    LEFT JOIN actividades a ON asg.actividad = a.id_actividad
                    LEFT JOIN personas instr ON a.instructor = instr.id_persona
                WHERE
                    instr.identificacion = ?
                ORDER BY
                    p.identificacion, s.seguimiento, b.id_bitacora;
            `;
            params.push(identificacion);  // Asignar la identificación del instructor
        } else if (rol === 'Aprendiz') {
            // Si es aprendiz, filtrar los seguimientos por la identificación del aprendiz
            sql = `
               SELECT
                    p.identificacion AS identificacion,
                    p.nombres AS nombres,
                    p.correo AS correo,
                    f.codigo AS codigo,
                    prg.sigla AS sigla,
                    e.razon_social AS razon_social,
                    s.id_seguimiento AS id_seguimiento,
                    s.seguimiento AS seguimiento,
                    s.fecha AS fecha,
                    s.estado AS estado,
                    pr.id_productiva AS productiva,
                    b.id_bitacora AS id_bitacora,
                    b.estado AS estado_bitacora,
                    instr.identificacion AS instructor_identificacion,
                    instr.nombres AS nombre_instructor
                FROM
                    seguimientos s
                    LEFT JOIN productivas pr ON s.productiva = pr.id_productiva
                    LEFT JOIN matriculas m ON pr.matricula = m.id_matricula
                    LEFT JOIN personas p ON m.aprendiz = p.id_persona
                    LEFT JOIN empresas e ON pr.empresa = e.id_empresa
                    LEFT JOIN fichas f ON m.ficha = f.codigo
                    LEFT JOIN programas prg ON f.programa = prg.id_programa
                    LEFT JOIN bitacoras b ON b.seguimiento = s.id_seguimiento
                    LEFT JOIN asignaciones asg ON asg.productiva = pr.id_productiva
                    LEFT JOIN actividades a ON asg.actividad = a.id_actividad
                    LEFT JOIN personas instr ON a.instructor = instr.id_persona
                WHERE
                    p.identificacion = ?
                ORDER BY
                    p.identificacion, s.seguimiento, b.id_bitacora;
            `;
            params.push(identificacion);  // Asignar la identificación del aprendiz
        }

        const [result] = await pool.query(sql, params); // Ejecutar la consulta con los parámetros correspondientes

        if (result.length > 0) {
            const personasMap = {};

            result.forEach(row => {
                if (!personasMap[row.identificacion]) {
                    personasMap[row.identificacion] = {
                        identificacion: row.identificacion,
                        nombres: row.nombres,
                        correo: row.correo,
                        codigo: row.codigo,
                        sigla: row.sigla,
                        razon_social: row.razon_social,
                        id_seguimiento1: null,
                        id_seguimiento2: null,
                        id_seguimiento3: null,
                        seguimiento1: null,
                        seguimiento2: null,
                        seguimiento3: null,
                        productiva: row.productiva,
                        estado1: null,
                        estado2: null,
                        estado3: null,
                        porcentaje: 0,
                        bitacoras: [[], [], []],
                        instructor_identificacion: row.instructor_identificacion,
                        nombre_instructor: row.nombre_instructor
                    };
                }

                const seguimientoIndex = parseInt(row.seguimiento) - 1;

                if (!personasMap[row.identificacion].bitacoras[seguimientoIndex]) {
                    personasMap[row.identificacion].bitacoras[seguimientoIndex] = [];
                }

                personasMap[row.identificacion].bitacoras[seguimientoIndex].push({
                    id_bitacora: row.id_bitacora,
                    estado_bitacora: row.estado_bitacora
                });
                // Asignar seguimiento basado en el número de seguimiento
                if (row.seguimiento === '1') {
                    personasMap[row.identificacion].id_seguimiento1 = row.id_seguimiento;
                    personasMap[row.identificacion].seguimiento1 = row.fecha;
                    personasMap[row.identificacion].estado1 = row.estado;
                } else if (row.seguimiento === '2') {
                    personasMap[row.identificacion].id_seguimiento2 = row.id_seguimiento;
                    personasMap[row.identificacion].seguimiento2 = row.fecha;
                    personasMap[row.identificacion].estado2 = row.estado;
                } else if (row.seguimiento === '3') {
                    personasMap[row.identificacion].id_seguimiento3 = row.id_seguimiento;
                    personasMap[row.identificacion].seguimiento3 = row.fecha;
                    personasMap[row.identificacion].estado3 = row.estado;
                }

                personasMap[row.identificacion].porcentaje += (row.bitacoras_con_pdf / 12) * 100;
            });

            Object.values(personasMap).forEach(aprendiz => {
                aprendiz.porcentaje = Math.round(aprendiz.porcentaje) || 0;
            });
            return res.status(200).json(Object.values(personasMap));
        } else {
            return res.status(404).json({ message: 'No se encontraron datos.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor.' });
    }
};

export const registrarSeguimiento = async (req, res) => {
    try {
        const seguimientoPdf = req.file ? req.file.originalname : null;
        const { fecha, productiva, instructor } = req.body;

        // Insertar tres seguimientos (1, 2, 3)
        const seguimientos = [
            { fecha, seguimiento: '1', estado: 1, pdf: seguimientoPdf, productiva, instructor },
            { fecha, seguimiento: '2', estado: 1, pdf: seguimientoPdf, productiva, instructor },
            { fecha, seguimiento: '3', estado: 1, pdf: seguimientoPdf, productiva, instructor }
        ];

        // Insertar todos los seguimientos en la base de datos
        await Promise.all(seguimientos.map(seg =>
            pool.query(
                'INSERT INTO seguimientos (fecha, seguimiento, estado, pdf, productiva, instructor) VALUES (?, ?, ?, ?, ?, ?)',
                [seg.fecha, seg.seguimiento, seg.estado, seg.pdf, seg.productiva, seg.instructor]
            )
        ));

        res.status(200).json({ message: 'Seguimientos registrados correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor: ' + error });
    }
}; export const uploadPdfToSeguimiento = async (req, res) => {
    try {
        const { id_seguimiento } = req.params;  // Obtener el ID del seguimiento desde los parámetros de la URL
        const pdf = req.file?.originalname || null;  // Obtener el nombre del archivo PDF cargado

        if (!pdf) {
            return res.status(400).json({
                message: 'No se ha cargado ningún archivo'
            });
        }

        // Directorio donde se guardan los archivos
        const uploadDirectory = 'public/seguimientos';

        // Nombre base para el archivo
        const baseFileName = 'ActaSeguimiento';

        // Función para generar un nombre de archivo único
        const getUniqueFileName = (directory, baseFileName) => {
            const extension = path.extname(pdf); // Obtener extensión del PDF cargado
            let fileName = `${baseFileName}${extension}`; // Nombre base con extensión
            let counter = 1;

            // Comprobar si el archivo existe y renombrar con un número secuencial
            while (fs.existsSync(path.join(directory, fileName))) {
                fileName = `${baseFileName}-${counter}${extension}`; // Agregar número al archivo
                counter++;
            }

            return fileName; // Devolver nombre único
        };

        // Generar el nombre de archivo único
        const uniquePdfName = getUniqueFileName(uploadDirectory, baseFileName);

        // Ruta completa donde se guardará el archivo
        const pdfPath = path.join(uploadDirectory, uniquePdfName);

        // Mover el archivo a la carpeta de destino con el nombre único
        fs.rename(req.file.path, pdfPath, async (err) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error al guardar el archivo: ' + err.message
                });
            }

            // Obtener la fecha actual en formato local YYYY-MM-DD
            const fechaActual = format(new Date(), 'yyyy-MM-dd');

            // Actualizar el campo 'pdf' en la tabla 'seguimientos' con la ruta o el nombre del archivo
            const sqlUpdateSeguimiento = `
                UPDATE seguimientos 
                SET pdf = ?, fecha = ?
                WHERE id_seguimiento = ?
            `;
            const [result] = await pool.query(sqlUpdateSeguimiento, [uniquePdfName, fechaActual, id_seguimiento]);

            if (result.affectedRows > 0) {
                res.status(200).json({
                    message: 'PDF cargado exitosamente en el seguimiento'
                });
            } else {
                res.status(404).json({
                    message: 'Seguimiento no encontrado'
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error.message
        });
    }
};
// Función para actualizar seguimientos
export const actualizarSeguimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, seguimiento, productiva, instructor } = req.body;
        const seguimientoPdf = req.file ? req.file.originalname : null;

        const [anterior] = await pool.query(`SELECT * FROM seguimientos WHERE id_seguimiento = ?`, [id]);

        let sql = `UPDATE seguimientos SET
                    fecha = ?,
                    seguimiento = ?,
                    productiva = ?,
                    instructor = ?`;

        const params = [fecha || anterior[0].fecha, seguimiento || anterior[0].seguimiento, productiva || anterior[0].productiva, instructor || anterior[0].instructor];

        if (seguimientoPdf) {
            sql += `, pdf = ?`;
            params.push(seguimientoPdf);
        }

        sql += ` WHERE id_seguimiento = ?`;
        params.push(id);

        const [rows] = await pool.query(sql, params);

        if (rows.affectedRows > 0) {
            res.status(200).json({ message: 'Seguimiento actualizado correctamente' });
        } else {
            res.status(403).json({ error: 'Error al actualizar el seguimiento' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor: ' + error });
    }
};

// Función para aprobar seguimientos
export const aprobarSeguimiento = async (req, res) => {
    try {
        const { id_seguimiento } = req.params;
        const sql = 'UPDATE seguimientos SET estado = ? WHERE id_seguimiento = ?';
        const values = ['aprobado', id_seguimiento];
        const [result] = await pool.query(sql, values);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Estado actualizado a Aprobado' });
        } else {
            res.status(404).json({ message: 'Acta no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor: ' + error.message });
    }
};

// Función para rechazar seguimientos
export const rechazarSeguimiento = async (req, res) => {
    try {
        const { id_seguimiento } = req.params;
        const sql = 'UPDATE seguimientos SET estado = ? WHERE id_seguimiento = ?';
        const values = ['no aprobado', id_seguimiento];
        const [result] = await pool.query(sql, values);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Estado actualizado a No Aprobado' });
        } else {
            res.status(404).json({ message: 'Acta no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor: ' + error.message });
    }
};
export const descargarPdf = async (req, res) => {
    try {
      const id_seguimiento = decodeURIComponent(req.params.id_seguimiento);
      const [result] = await pool.query('SELECT pdf FROM seguimientos WHERE id_seguimiento = ?', [id_seguimiento]);
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'Bitácora no encontrada' });
      }
  
      const pdfFileName = result[0].pdf;
      const filePath = path.resolve(__dirname, '../../public/seguimientos', pdfFileName);
  
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: `Archivo no encontrado en la ruta: ${filePath}` });
      }
  
      res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ message: `Error en el servidor: ${error.message}` });
    }
  };
  

export const listarEstadoSeguimiento = async (req, res) => {
    const { id_seguimiento } = req.params;
    try {
        const sql = `
        SELECT
          s.id_seguimiento AS id_seguimiento,
          s.seguimiento AS seguimiento,
          s.estado AS estado,
          s.pdf AS pdf
        FROM
          seguimientos s
        WHERE
          s.id_seguimiento = ?
      `;
        const [result] = await pool.query(sql, [id_seguimiento]);

        if (result.length > 0) {
            const estado = result[0];
            res.status(200).json(estado);
        } else {
            res.status(404).json({ error: 'Seguimiento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor: ' + error.message });
    }
};
export const listarEstadosBitacorasSeguimientos = async (req, res) => {
    const { identificacion } = req.user;
    if (!identificacion) {
        return res.status(400).json({ message: 'Identificación no proporcionada.' });
    }

    try {
        let sql;
        let params = [];

        sql = `
            SELECT
                s.seguimiento AS seguimiento,
                b.id_bitacora AS id_bitacora,
                b.estado AS estado_bitacora
            FROM
                seguimientos s
                LEFT JOIN bitacoras b ON b.seguimiento = s.id_seguimiento
                LEFT JOIN matriculas m ON s.productiva = m.id_matricula
                LEFT JOIN personas p ON m.aprendiz = p.id_persona
            WHERE
                p.identificacion = ?
            ORDER BY
                s.seguimiento, b.id_bitacora;
        `;
        params.push(identificacion);

        const [result] = await pool.query(sql, params);

        if (result.length > 0) {
            // Estructura para almacenar los seguimientos y bitácoras (4 bitácoras por cada seguimiento)
            const seguimientosMap = {
                1: { bitacoras: [] },
                2: { bitacoras: [] },
                3: { bitacoras: [] }
            };

            // Añadir los datos obtenidos a seguimientosMap
            result.forEach(row => {
                if (row.id_bitacora) {
                    const seguimiento = seguimientosMap[row.seguimiento];
                    if (seguimiento.bitacoras.length < 4) {
                        seguimiento.bitacoras.push({
                            id: row.id_bitacora,
                            estado: row.estado_bitacora || 'Pendiente'
                        });
                    }
                }
            });

            // Rellenar con 'Pendiente' hasta tener 4 bitácoras por seguimiento
            Object.keys(seguimientosMap).forEach(seguimientoKey => {
                const bitacoras = seguimientosMap[seguimientoKey].bitacoras;
                while (bitacoras.length < 4) {
                    bitacoras.push({
                        id: `pendiente-${seguimientoKey}-${bitacoras.length + 1}`, // ID único para bitácoras pendientes
                        estado: 'Pendiente'
                    });
                }
            });

            // Verificar si todos los seguimientos tienen 4 bitácoras y si todas están aprobadas
            const allApproved = Object.values(seguimientosMap).every(seg =>
                seg.bitacoras.length === 4 && seg.bitacoras.every(bit => bit.estado === 'aprobado')
            );

            // Finalmente, devuelve la respuesta al cliente
            return res.status(200).json({ seguimientosMap, allApproved });

        } else {
            return res.status(404).json({ message: 'No se encontraron datos.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor.' });
    }
};

export const listarSeguimientoPorProductiva = async (req, res) => {
    try {
        // Obtiene el id_productiva desde los parámetros de la URL
        const { id_productiva } = req.params;

        // Verifica si el parámetro fue proporcionado
        if (!id_productiva) {
            return res.status(400).json({ error: 'El id_productiva es requerido' });
        }

        // Consulta SQL para obtener los seguimientos filtrados por id_productiva
        const sql = `
            SELECT productiva, id_seguimiento
            FROM seguimientos
            WHERE productiva = ?
            ORDER BY productiva, id_seguimiento;
        `;
        const [result] = await pool.query(sql, [id_productiva]);

        // Verifica si hay resultados
        if (result.length > 0) {
            // Agrupa los seguimientos por 'productiva'
            const response = result.reduce((acc, item) => {
                // Si no existe la clave para 'productiva', la inicializa
                if (!acc[item.productiva]) {
                    acc[item.productiva] = {};
                }
                // Asigna el seguimiento al grupo correspondiente
                const seguimientoKey = `seguimiento ${Object.keys(acc[item.productiva]).length + 1}`;
                acc[item.productiva][seguimientoKey] = item.id_seguimiento;
                return acc;
            }, {});

            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'No hay seguimientos registrados para esta productiva' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor: ' + error.message });
    }
};