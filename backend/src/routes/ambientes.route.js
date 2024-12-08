import { Router } from "express";
import { listarAmbientes, registrarAmbientes, actualizarAmbientes, activarAmbiente, inactivarAmbiente } from "../controllers/ambientes.controller.js";
import { validarToken } from "../controllers/seguridad.controller.js";

const rutaAmbientes = Router();

rutaAmbientes.get("/listar", validarToken, listarAmbientes);
rutaAmbientes.post("/registrar", validarToken, registrarAmbientes);
rutaAmbientes.put("/actualizar/:id_ambiente", validarToken, actualizarAmbientes);
rutaAmbientes.put("/activar/:id_ambiente", validarToken, activarAmbiente);
rutaAmbientes.put("/inactivar/:id_ambiente", validarToken, inactivarAmbiente);

export default rutaAmbientes;

//comentario random borrenlo