import Router from 'express'
import { listarMatriculas, registrarMatriculas, actualizarMatriculas, formacionMatricula,  condicionadaMatricula, canceladaMatricula, retiroMatricula, porCertificarMatricula, certificadaMatricula, listarAprendices, listar, contarMatriculasPorEstado } from '../controllers/matriculas.controller.js'
import { validarToken } from '../controllers/seguridad.controller.js'

const rutaMatriculas = Router()

rutaMatriculas.get('/listar/:codigo', validarToken, listarMatriculas)
rutaMatriculas.get("/listarEstados", validarToken, contarMatriculasPorEstado);
rutaMatriculas.get('/listarA', validarToken, listarAprendices)
rutaMatriculas.get('/lista', validarToken, listar)
rutaMatriculas.post('/registrar', validarToken, registrarMatriculas)
rutaMatriculas.put('/actualizar/:id_matricula', validarToken, actualizarMatriculas)
rutaMatriculas.put('/formacion/:id', validarToken, formacionMatricula)
rutaMatriculas.put('/condicionada/:id', validarToken, condicionadaMatricula)
rutaMatriculas.put('/retiro/:id', validarToken, retiroMatricula)
rutaMatriculas.put('/porCertificar/:id', validarToken, porCertificarMatricula)
rutaMatriculas.put('/certificada/:id', validarToken, certificadaMatricula)
rutaMatriculas.delete('/cancelada/:id_matricula', validarToken, canceladaMatricula)

export default rutaMatriculas