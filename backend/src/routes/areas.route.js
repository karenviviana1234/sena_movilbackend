import { Router } from "express";
import { listarAreas } from "../controllers/areas.controller.js";
import { validarToken } from "../controllers/seguridad.controller.js";

export const rutaAreas = Router()

rutaAreas.get("/listar", validarToken, listarAreas);