import { Router } from "express";
import { listarVinculaciones, registrarVinculacion, actualizarVinculacion, inactivarVinculacion, activarVinculacion } from "../controllers/vinculaciones.controller.js";
import { validarToken } from "../controllers/seguridad.controller.js";

const rutaVinculaciones = Router()

rutaVinculaciones.get('/listar', /* validarToken,  */listarVinculaciones)
rutaVinculaciones.post('/registrar',/*  validarToken,  */registrarVinculacion)
rutaVinculaciones.put('/actualizar/:id', validarToken, actualizarVinculacion)
rutaVinculaciones.put('/inactivar/:id', validarToken, inactivarVinculacion)
rutaVinculaciones.put('/activar/:id', validarToken, activarVinculacion)

export default rutaVinculaciones