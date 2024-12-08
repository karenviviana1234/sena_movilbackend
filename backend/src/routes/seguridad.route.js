import { Router } from "express";
import { validar } from "../controllers/seguridad.controller.js";

const rutaSeguridad = Router();

rutaSeguridad.post("/validacion", validar);

export default rutaSeguridad;