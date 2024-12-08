import { Router } from "express";
import { listarasignaciones, registrarasignacion, actualizarasignacion, buscarasignacion, eliminarAsignacion } from "../controllers/asignacion.controller.js";
import { validarToken } from "../controllers/seguridad.controller.js";

const rutaAsignacion = Router();

rutaAsignacion.get("/listar", validarToken, listarasignaciones);
rutaAsignacion.post("/registrar", validarToken, registrarasignacion);
rutaAsignacion.put("/actualizar/:id_asignacion", validarToken, actualizarasignacion);
rutaAsignacion.delete("/eliminar/:id_asignacion", validarToken, eliminarAsignacion);
rutaAsignacion.get("/buscar/:id_asignacion", validarToken, buscarasignacion);


export default rutaAsignacion;