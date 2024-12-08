import { Router } from "express";
import { listarProductiva, registrarProductiva, actualizarProductiva, renunciarProductiva, terminarProductiva, productivaFiles, descargarPdf, contarProductivasPorEstado, listarAprendicezPorFicha } from "../controllers/productiva.controller.js";
import { validarToken } from "../controllers/seguridad.controller.js";

const rutaProductiva = Router();

rutaProductiva.get("/listar", validarToken, listarProductiva);
rutaProductiva.get("/listarAprendicezFichas/:codigo",  listarAprendicezPorFicha);
rutaProductiva.get("/listarEstados", validarToken, contarProductivasPorEstado);
rutaProductiva.post("/registrar", validarToken, productivaFiles, registrarProductiva);
rutaProductiva.put("/actualizar/:id_productiva", validarToken, productivaFiles, actualizarProductiva);
rutaProductiva.put("/renunciar/:id", validarToken, renunciarProductiva);
rutaProductiva.put("/terminar/:id", validarToken, terminarProductiva);
rutaProductiva.get('/descargarPdf/:id_productiva', validarToken, descargarPdf);


export default rutaProductiva;