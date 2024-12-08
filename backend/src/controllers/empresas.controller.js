import { pool } from "../database/conexion.js";
export const listarEmpresas = async (req, res) => {
    try {
      const { rol, userId } = req.user; // Obtener el rol y el ID del usuario autenticado
  
      let sql;
      let params = [];
  
      if (rol === 'Lider') {
        // Consulta para listar solo las empresas relacionadas con las productivas de las fichas del líder (filtrando por el id_persona del líder)
        sql = `
          SELECT e.*, m.*
          FROM empresas e
          INNER JOIN municipios m ON e.municipio = m.id_municipio
          INNER JOIN productivas p ON e.id_empresa = p.empresa
          INNER JOIN matriculas mt ON p.aprendiz = mt.aprendiz
          INNER JOIN fichas f ON mt.ficha = f.codigo
          WHERE f.instructor_lider = ? AND e.estado = 'activo'
        `;
        params = [userId];  // Utilizar el id_persona (userId) del líder
      } else {
        // Consulta para listar todas las empresas para otros roles
        sql = `
          SELECT e.*, m.*
          FROM empresas e
          INNER JOIN municipios m ON e.municipio = m.id_municipio
          WHERE e.estado = 'activo'
        `;
      }
  
      const [results] = await pool.query(sql, params);
  
      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(404).json({
          message: 'No hay empresas registradas con estado activo'
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error del servidor: ' + error.message
      });
    }
  };
  /* listar por el municipio */
  // controllers/empresaController.js

  export const listarEmpresasPorMunicipio = async (req, res) => {
    const { municipioId } = req.params;
    console.log("Municipio ID recibido:", municipioId); // Depuración
  
    try {
      const sql = `
        SELECT e.*, m.*
        FROM empresas e
        INNER JOIN municipios m ON e.municipio = m.id_municipio
        WHERE e.municipio = ? AND e.estado = 1
      `;
      
      const [results] = await pool.query(sql, [municipioId]);
  
      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(404).json({
          message: 'No se encontraron empresas registradas en este municipio.'
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error del servidor: ' + error.message
      });
    }
  };
  




export const registrarEmpresas = async (req, res) => {
    try {
        const { razon_social, direccion, telefono, correo, municipio, jefe_inmediato } = req.body

        let sql = `INSERT INTO empresas (razon_social, direccion, telefono, correo, municipio, jefe_inmediato, estado) VALUES (?, ?, ?, ?, ?, ?, 1)`

        const [rows] = await pool.query(sql, [razon_social, direccion, telefono, correo, municipio, jefe_inmediato])

        if(rows.affectedRows>0){
            res.status(200).json({
                message: 'Empresa registrada correctamente'
            })
        }else{
            res.status(403).json({
                message: 'Error al registrar la empresa'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}

export const actualizarEmpresas = async (req, res) => {
    const { id_empresa } = req.params
    const { razon_social, direccion, telefono, correo, municipio, jefe_inmediato } = req.body
    const sql = `
    UPDATE empresas SET 
    razon_social = ?, 
    direccion = ?, 
    telefono = ?, 
    correo = ?, 
    municipio = ?, 
    jefe_inmediato = ?
    WHERE id_empresa = ?`;
    try {
     const [result] = await pool.query(sql, [razon_social, direccion, telefono, correo, municipio, jefe_inmediato, id_empresa]);
     if (result.affectedRows === 0) {
       return res.status(404).json({ message: 'Empresa no encontrada' });
     }
     res.status(200).json({ message: 'Empresa actualizada correctamente' });
   } catch (error) {
     res.status(500).json({ message: 'Error del servidor' + error });
   }
 }
 export const inactivarEmpresa = async (req, res) => {
     try {
         const {id_empresa} = req.params
         let sql = `UPDATE empresas SET estado = 2 WHERE id_empresa =?`
 
         const [rows] = await pool.query(sql, [id_empresa])
 
         if(rows.affectedRows>0){
             res.status(200).json({
                 message: 'Empresa inactivada correctamente'
             })
         }else{
             res.status(403).json({
                 message: 'Error al inactivar la empresa'
             })
         }
     } catch (error) {
         res.status(500).json({
             message: 'Error del servidor' + error
         })
     }
 }
 

 export const activarEmpresa = async (req, res) => {
    try {
        const {id} = req.params
        let sql = `UPDATE empresa SET estado = 1 WHERE id_empresa =?`

        const [rows] = await pool.query(sql, [id])

        if(rows.affectedRows>0){
            res.status(200).json({
                message: 'Empresa activada correctamente'
            })
        }else{
            res.status(403).json({
                message: 'Error al activar la empresa'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor' + error
        })
    }
}