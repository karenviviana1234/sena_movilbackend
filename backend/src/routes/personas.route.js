import Router from 'express'
import { registrarAprendiz, actualizarPersona, eliminarPersona, listarPersonas, buscarPersonas, listarAprendices, listarInstructores, registrarInstructor, listarMunicipios, desactivarPersona, registrarUsuarios, cambiarInstructor, listarInstructoresLider, perfil, actualizarPerfil, listarAprendicesPorInstructor } from '../controllers/personas.controller.js'
import { validarToken } from '../controllers/seguridad.controller.js'

const rutaPersona = Router()

rutaPersona.get('/listar',  validarToken, listarPersonas)
rutaPersona.get('/listarM', validarToken, listarMunicipios)
rutaPersona.get('/listarA', /* validarToken, */ listarAprendices)
rutaPersona.get('/listarAprendicesI/:id_persona', validarToken, listarAprendicesPorInstructor)
rutaPersona.get('/listarI', validarToken, listarInstructores)
rutaPersona.get('/listarL', validarToken, listarInstructoresLider)
rutaPersona.get('/buscar/:id_persona', validarToken, buscarPersonas)
rutaPersona.post('/registrarA', registrarAprendiz)
rutaPersona.post('/registrarI', registrarInstructor)
rutaPersona.post('/registrares', registrarUsuarios);

/* Perfil */
rutaPersona.get('/perfil/:id_persona', perfil);
rutaPersona.put('/perfilActualizar/:id_persona', actualizarPerfil);


rutaPersona.put('/actualizar/:id_persona', validarToken, actualizarPersona)
rutaPersona.delete('/eliminar/:id_persona', validarToken, eliminarPersona)
rutaPersona.post('/desactivar/:id_persona', validarToken, desactivarPersona)

//cambiar instructor
rutaPersona.put('/cambiarInstructor/:id_persona', validarToken, cambiarInstructor);

export default rutaPersona