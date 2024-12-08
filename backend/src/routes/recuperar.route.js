import { Router } from "express";
import {
    tokenPassword,
    resetPassword,
    verifyToken 
} from "../controllers/recuperar.controller.js";

const routepassword = Router();

// Endpoint para solicitar el token de recuperación
routepassword.post("/recuperar", tokenPassword);

// Endpoint para verificar si un token es válido
routepassword.post("/verificar", verifyToken);

// Endpoint para cambiar la contraseña
routepassword.put("/cambiar", resetPassword);

export default routepassword;