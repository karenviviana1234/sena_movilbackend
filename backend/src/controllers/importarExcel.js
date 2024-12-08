import { pool } from "./../database/conexion.js";
import multer from "multer";
import XLSX from "xlsx";
import bcrypt from "bcrypt";

// Configuración de multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
export const upload = multer({ storage }).single("file");

// Controlador para importar datos desde un archivo Excel
export const importExcel = async (req, res) => {
    try {
        // Verificar si se ha subido un archivo
        if (!req.file) {
            return res.status(400).json({ message: "No se ha subido ningún archivo." });
        }

        // Leer el archivo Excel desde el buffer
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convertir la hoja de Excel a JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true });

        // Verificar si los datos están vacíos
        if (jsonData.length === 0) {
            return res.status(400).json({ message: "El archivo Excel está vacío." });
        }

        // Obtener los datos sin cabecera
        const data = jsonData.slice(1).map((row) => ({
            identificacion: row[0],
            aprendiz: row[1],
            ficha: row[2],
            correo: row[3],
            telefono: row[4],
            municipio: row[5],
            estado: row[6],
            pendiente_tecnicos: row[7] || 0,
            pendiente_transversales: row[8] || 0,
            pendiente_ingles: row[9] || 0,
        }));

        if (data.length === 0) {
            return res.status(400).json({ message: "No se encontraron datos válidos en el archivo Excel." });
        }

        for (const item of data) {
            const municipioName = item.municipio ? item.municipio.trim() : "";

            if (!municipioName) {
                console.error(`El municipio está vacío para el aprendiz ${item.aprendiz}`);
                continue;
            }

            // Consulta para buscar el municipio
            const municipioQuery = await pool.query(
                "SELECT id_municipio FROM municipios WHERE LOWER(nombre_mpio) = LOWER(?)",
                [municipioName]
            );

            let municipioId = null;
            if (municipioQuery.length > 0 && municipioQuery[0].length > 0) {
                municipioId = municipioQuery[0][0].id_municipio;
            } else {
                console.error(`No se pudo obtener ID para el municipio: ${municipioName}`);
                continue;
            }

            // Buscar si el aprendiz ya existe
            const personaQuery = await pool.query(
                "SELECT id_persona FROM personas WHERE identificacion = ?",
                [item.identificacion]
            );

            let idPersona;
            if (personaQuery.length > 0 && personaQuery[0].length > 0) {
                idPersona = personaQuery[0][0].id_persona;

                // Actualizar los datos de la persona existente
                await pool.query(
                    "UPDATE personas SET nombres = ?, correo = ?, telefono = ? WHERE id_persona = ?",
                    [
                        item.aprendiz,
                        item.correo,
                        item.telefono,
                        idPersona
                    ]
                );

                console.log("Persona existente actualizada");
            } else {    
                console.log("Persona no encontrada, creando nueva");

                // Insertar nueva persona
                const passwordHash = await bcrypt.hash(item.identificacion.toString(), 10);
                const insertPersona = await pool.query(
                    "INSERT INTO personas (identificacion, nombres, correo, telefono, password, rol, cargo, municipio, estado) VALUES (?, ?, ?, ?, ?, 'Aprendiz', 'Aprendiz', ?, 'Activo')",
                    [
                        item.identificacion,
                        item.aprendiz,
                        item.correo,
                        item.telefono,
                        passwordHash,
                        municipioId,
                    ]
                );
                idPersona = insertPersona[0].insertId;
            }

            // Buscar si la matrícula ya existe
            const matriculaQuery = await pool.query(
                "SELECT id_matricula FROM matriculas WHERE ficha = ? AND aprendiz = ?",
                [item.ficha, idPersona]
            );

            let idMatricula;
            if (matriculaQuery.length > 0 && matriculaQuery[0].length > 0) {
                idMatricula = matriculaQuery[0][0].id_matricula;
                // Actualizar matrícula existente
                await pool.query(
                    "UPDATE matriculas SET aprendiz = ?, estado = ?, pendiente_tecnicos = ?, pendiente_transversales = ?, pendiente_ingles = ? WHERE id_matricula = ?",
                    [
                        idPersona,
                        item.estado,
                        item.pendiente_tecnicos,
                        item.pendiente_transversales,
                        item.pendiente_ingles,
                        idMatricula,
                    ]
                );
            } else {
                // Insertar nueva matrícula
                await pool.query(
                    "INSERT INTO matriculas (ficha, aprendiz, estado, pendiente_tecnicos, pendiente_transversales, pendiente_ingles) VALUES (?, ?, ?, ?, ?, ?)",
                    [
                        item.ficha,
                        idPersona,
                        item.estado,
                        item.pendiente_tecnicos,
                        item.pendiente_transversales,
                        item.pendiente_ingles,
                    ]
                );
            }
        }

        res.status(200).json({ message: "Datos importados y actualizados con éxito." });
    } catch (error) {
        console.error("Error al importar Excel:", error);
        res.status(500).json({ message: "Hubo un error al importar los datos." });
    }
};
