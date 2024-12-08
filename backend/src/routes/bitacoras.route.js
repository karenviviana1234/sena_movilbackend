import Router from 'express'
import { listarBitacora, registrarBitacora, actualizarBitacora, aprobarBitacora, cargarBitacora, rechazarBitacora, uploadPdfToBitacoras, bitacoraSeguimiento, buscarBitacora, descargarPdfBitacora, contarEstadosBitacoras } from '../controllers/bitacoras.controller.js'
import { validarToken } from '../controllers/seguridad.controller.js'

const rutaBitacoras = Router()

rutaBitacoras.get('/listar', validarToken, listarBitacora)
rutaBitacoras.get('/listarEstados', validarToken, contarEstadosBitacoras)
rutaBitacoras.post('/registrar', validarToken, cargarBitacora, registrarBitacora)

rutaBitacoras.post('/cargarpdf/:id_bitacora',  cargarBitacora,uploadPdfToBitacoras)

rutaBitacoras.put('/actualizar/:id', validarToken, cargarBitacora, actualizarBitacora)
rutaBitacoras.put('/aprobar/:id_bitacora', validarToken, aprobarBitacora)
rutaBitacoras.put('/rechazar/:id_bitacora', validarToken, rechazarBitacora)
rutaBitacoras.get('/bitacorasSeguimiento/:id', validarToken, bitacoraSeguimiento)
rutaBitacoras.get('/buscar/:id', validarToken, buscarBitacora)
rutaBitacoras.get('/download/:id_bitacora', descargarPdfBitacora);

export default rutaBitacoras    