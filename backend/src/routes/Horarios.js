import { Router } from "express";
import { ActualizarHorarios, CrearHorario, DesactivarHorario, listarHorarios, listarHorariosPorFicha } from "../controllers/Horarios.js";
import { validarToken } from "../controllers/seguridad.controller.js";

export const rutaHorarios = Router();

rutaHorarios.get("/listar", validarToken, listarHorarios);
rutaHorarios.get("/listarPorFicha/:codigo", validarToken, listarHorariosPorFicha);
rutaHorarios.post("/registrar", validarToken, CrearHorario);
rutaHorarios.put("/actualizar/:id_horario", validarToken, ActualizarHorarios);
rutaHorarios.post("/desactivar/:id_horario", validarToken, DesactivarHorario);

