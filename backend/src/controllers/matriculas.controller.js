import { pool } from './../database/conexion.js'



export const listarAprendices = async (req, res) => {
    try {
        // Consulta SQL con LEFT JOIN para obtener los aprendices sin matrícula
        const sql = `
        SELECT p.*, m.nombre_mpio
        FROM personas p
        LEFT JOIN municipios m ON p.municipio = m.id_municipio
        LEFT JOIN matriculas ma ON p.id_persona = ma.aprendiz
        WHERE p.rol = 'Aprendiz' AND ma.id_matricula IS NULL
      `;
        const [results] = await pool.query(sql);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay aprendices sin matrícula'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error.message
        });
    }
};

export const contarMatriculasPorEstado = async (req, res) => {
    try {
        // Consulta SQL para contar la cantidad de matrículas por estado
        const sql = `
            SELECT 
                estado, 
                COUNT(*) AS total
            FROM 
                matriculas
            GROUP BY 
                estado
        `;

        const [results] = await pool.query(sql);

        // Mapeo de los resultados a un formato más legible
        const conteoPorEstado = {
            Induccion: 0,
            Formacion: 0,
            Condicionado: 0,
            Cancelado: 0,
            RetiroVoluntario: 0,
            PorCertificar: 0,
            Certificado: 0
        };

        // Asignar los resultados de la consulta al conteo correspondiente
        results.forEach(row => {
            switch (row.estado) {
                case 'Inducción':
                    conteoPorEstado.Induccion = row.total;
                    break;
                case 'Formación':
                    conteoPorEstado.Formacion = row.total;
                    break;
                case 'Condicionado':
                    conteoPorEstado.Condicionado = row.total;
                    break;
                case 'Cancelado':
                    conteoPorEstado.Cancelado = row.total;
                    break;
                case 'Retiro Voluntario':
                    conteoPorEstado.RetiroVoluntario = row.total;
                    break;
                case 'Por Certificar':
                    conteoPorEstado.PorCertificar = row.total;
                    break;
                case 'Certificado':
                    conteoPorEstado.Certificado = row.total;
                    break;
                default:
                    break;
            }
        });

        res.status(200).json(conteoPorEstado);
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error.message
        });
    }
};

export const listarMatriculas = async (req, res) => {
    const { codigo } = req.params; // Obtener el parámetro id_ficha de la URL

    try {
        // Realizar un JOIN entre matriculas y personas para obtener el nombre, identificación, correo y teléfono del aprendiz,
        // y filtrar por id_ficha recibido en la ruta
        let sql = `
            SELECT 
                m.id_matricula, 
                p.identificacion, 
                p.nombres AS nombre_aprendiz, 
                p.correo, 
                p.telefono, 
                m.ficha, 
                m.estado, 
                m.pendiente_tecnicos, 
                m.pendiente_transversales, 
                m.pendiente_ingles
            FROM matriculas m
            JOIN personas p ON m.aprendiz = p.id_persona
            WHERE m.ficha = ?
            ORDER BY m.ficha
        `;

        const [results] = await pool.query(sql, [codigo]);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay matrículas registradas para la ficha especificada',
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error,
        });
    }
};

export const listar = async (req, res) => {
    try {
        // Consulta para listar las matriculas junto con los nombres de los aprendices que no tienen productivas registradas
        let sql = `
            SELECT matriculas.*, personas.nombres AS nombre_aprendiz 
            FROM matriculas 
            JOIN personas ON matriculas.aprendiz = personas.id_persona
            LEFT JOIN productivas ON matriculas.id_matricula = productivas.matricula
            WHERE productivas.matricula IS NULL
        `;

        const [results] = await pool.query(sql);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No hay matrículas sin productivas registradas'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error.message
        });
    }
};


export const registrarMatriculas = async (req, res) => {
    try {
        const { ficha, aprendiz, pendientes_tecnicos, pendientes_transversales, pendiente_ingles, estado } = req.body;

        // Verificar si la matrícula ya existe
        const [existing] = await pool.query('SELECT * FROM matriculas WHERE ficha = ? AND aprendiz = ?', [ficha, aprendiz]);
        if (existing.length > 0) {
            return res.status(409).json({
                message: 'La matrícula ya existe'
            });
        }

        // Asignar 0 a los campos pendientes si son nulos
        const tecnicos = pendientes_tecnicos ?? 0;
        const transversales = pendientes_transversales ?? 0;
        const ingles = pendiente_ingles ?? 0;

        // Asegúrate de que el valor de estado sea una cadena y esté en el formato esperado
        /*  const estadoValido = ['Inducción', 'Formación', 'Condicionado', 'Cancelado', 'Retiro Voluntario', 'Por Certificar', 'Certificado'];
         if (!estadoValido.includes(estado)) {
             return res.status(400).json({
                 message: 'Estado no válido'
             });
         }
  */
        // Inserción en la base de datos
        const sql = ` INSERT INTO matriculas (ficha, aprendiz, estado, pendiente_tecnicos, pendiente_transversales, pendiente_ingles) VALUES (?, ?, ?, ?, ?, ?)`;

        const [rows] = await pool.query(sql, [ficha, aprendiz, estado, tecnicos, transversales, ingles]);

        if (rows.affectedRows > 0) {
            res.status(201).json({
                message: 'Matrícula registrada correctamente'
            });
        } else {
            res.status(403).json({
                message: 'Error al registrar la matrícula'
            });
        }

    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error.message
        });
    }
};
export const actualizarMatriculas = async (req, res) => {
    try {
        const { id_matricula } = req.params;
        const { estado, pendiente_tecnicos, pendiente_transversales, pendiente_ingles } = req.body;

        // Prepara los valores de actualización usando COALESCE para mantener valores existentes si son undefined
        const sql = `
            UPDATE matriculas SET
                estado = COALESCE(?, estado),
                pendiente_tecnicos = COALESCE(?, pendiente_tecnicos),
                pendiente_transversales = COALESCE(?, pendiente_transversales),
                pendiente_ingles = COALESCE(?, pendiente_ingles)
            WHERE id_matricula = ?
        `;

        const [rows] = await pool.query(sql, [
            estado || null, 
            pendiente_tecnicos || null, 
            pendiente_transversales || null, 
            pendiente_ingles || null, 
            id_matricula
        ]);

        if (rows.affectedRows > 0) {
            return res.status(200).json({ message: 'Matrícula actualizada correctamente' });
        } else {
            return res.status(404).json({ message: 'Matrícula no encontrada o no se realizaron cambios' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error del servidor: ' + error.message });
    }
};


export const formacionMatricula = async (req, res) => {
    try {
        const { id } = req.params

        let sql = ` UPDATE matriculas SET estado = 2 WHERE id_matricula = ?`;

        const [rows] = await pool.query(sql, [id])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'La formación se ha solicitado correctamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al solicitar la formación'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const condicionadaMatricula = async (req, res) => {
    try {
        const { id } = req.params

        let sql = `UPDATE matriculas SET estado = 3 WHERE id_matricula = ?`;

        const [rows] = await pool.query(sql, [id])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Matricula condicionada exitosamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al condicionar la matricula'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const canceladaMatricula = async (req, res) => {
    try {
        const { id_matricula } = req.params;

        // Desactivar la comprobación de claves foráneas
        await pool.query(`SET FOREIGN_KEY_CHECKS = 0`);

        // Eliminar los registros relacionados en la tabla bitacoras
        let deleteBitacorasSql = `
            DELETE b FROM bitacoras b
            JOIN seguimientos s ON b.seguimiento = s.id_seguimiento
            JOIN productivas p ON s.productiva = p.id_productiva
            WHERE p.matricula = ?
        `;
        await pool.query(deleteBitacorasSql, [id_matricula]);

        // Eliminar los registros relacionados en la tabla seguimientos
        let deleteSeguimientosSql = `
            DELETE s FROM seguimientos s
            JOIN productivas p ON s.productiva = p.id_productiva
            WHERE p.matricula = ?
        `;
        await pool.query(deleteSeguimientosSql, [id_matricula]);

        // Eliminar los registros relacionados en la tabla productivas
        let deleteProductivasSql = `DELETE FROM productivas WHERE matricula = ?`;
        await pool.query(deleteProductivasSql, [id_matricula]);

        // Eliminar la matrícula
        let deleteMatriculaSql = `DELETE FROM matriculas WHERE id_matricula = ?`;
        const [rows] = await pool.query(deleteMatriculaSql, [id_matricula]);

        // Reactivar la comprobación de claves foráneas
        await pool.query(`SET FOREIGN_KEY_CHECKS = 1`);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Matrícula y registros relacionados eliminados exitosamente'
            });
        } else {
            res.status(404).json({
                message: 'Matrícula no encontrada'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor: ' + error
        });
    }
};



export const retiroMatricula = async (req, res) => {
    try {
        const { id } = req.params

        let sql = `UPDATE matriculas SET estado = 5 WHERE id_matricula = ?`;

        const [rows] = await pool.query(sql, [id])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Matricula retirada exitosamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al retirar la matricula'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const porCertificarMatricula = async (req, res) => {
    try {
        const { id } = req.params

        let sql = `UPDATE matriculas SET estado = 6 WHERE id_matricula = ?`;

        const [rows] = await pool.query(sql, [id])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Matricula por certificar exitosamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al cambiar estado de la matricula'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const certificadaMatricula = async (req, res) => {
    try {
        const { id } = req.params

        let sql = `UPDATE matriculas SET estado = 7 WHERE id_matricula = ?`;

        const [rows] = await pool.query(sql, [id])

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: 'Matricula certificada exitosamente'
            })
        } else {
            res.status(403).json({
                message: 'Error al certificar la matricula'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}
