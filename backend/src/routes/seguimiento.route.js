import Router from 'express'
import { listarSeguimiento, registrarSeguimiento, actualizarSeguimiento, listarSeguimientoPorProductiva, cargarSeguimiento, aprobarSeguimiento, rechazarSeguimiento, listarSeguimientoAprendices, uploadPdfToSeguimiento, descargarPdf, listarEstadoSeguimiento, listarEstadosBitacorasSeguimientos } from '../controllers/seguimientos.controller.js'
import { validarToken } from './../controllers/seguridad.controller.js'

const rutaSeguimiento = Router()

rutaSeguimiento.get('/listar',validarToken,  listarSeguimiento)
rutaSeguimiento.get('/listarA', validarToken,   listarSeguimientoAprendices)
rutaSeguimiento.get('/listarSeguimientoP/:id_productiva',  listarSeguimientoPorProductiva)
rutaSeguimiento.post('/registrar', validarToken, cargarSeguimiento, registrarSeguimiento)
rutaSeguimiento.post('/cargarPdf/:id_seguimiento', validarToken, cargarSeguimiento, uploadPdfToSeguimiento)
rutaSeguimiento.get('/estadosBitacoras/:id_persona', validarToken,  listarEstadosBitacorasSeguimientos)
rutaSeguimiento.put('/actualizar/:id', validarToken, cargarSeguimiento, actualizarSeguimiento)
rutaSeguimiento.put('/aprobar/:id_seguimiento', validarToken, aprobarSeguimiento)
rutaSeguimiento.put('/rechazar/:id_seguimiento', validarToken, rechazarSeguimiento)
rutaSeguimiento.get('/descargarPdf/:id_seguimiento',  descargarPdf)
rutaSeguimiento.get('/listarEstado/:id_seguimiento', validarToken, listarEstadoSeguimiento)



export default rutaSeguimiento
