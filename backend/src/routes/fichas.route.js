//modificaciones
import Router from 'express'
import { listarFichas, registrarFichas, actualizarFicha, electivaFicha, finalizarFicha,  obtenerFichaPorId, finFicha, listarFichasNormal } from '../controllers/fichas.controller.js'
import { validarToken } from './../controllers/seguridad.controller.js' 

const rutaFichas = Router()

rutaFichas.get('/listar', validarToken, listarFichas)
rutaFichas.get('/listarN', validarToken, listarFichasNormal)

rutaFichas.get('/listar/:id', validarToken, obtenerFichaPorId)
rutaFichas.post('/registrar', validarToken, registrarFichas)
rutaFichas.put('/actualizar/:codigo', validarToken, actualizarFicha)
rutaFichas.put('/electiva/:id', validarToken, electivaFicha)
rutaFichas.put('/finalizar/:id', validarToken, finalizarFicha)
rutaFichas.post('/fin/:codigo', validarToken, finFicha)

export default rutaFichas