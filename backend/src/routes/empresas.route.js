import { Router } from "express";
import { listarEmpresas, registrarEmpresas, actualizarEmpresas, inactivarEmpresa, activarEmpresa, listarEmpresasPorMunicipio } from "../controllers/empresas.controller.js";
import { validarToken } from "../controllers/seguridad.controller.js";

const rutaEmpresas = Router();

rutaEmpresas.get("/listar", validarToken, listarEmpresas);
rutaEmpresas.get("/listarEmpresaMunicipio/:municipioId", /* validarToken, */ listarEmpresasPorMunicipio);
rutaEmpresas.post("/registrar", validarToken, registrarEmpresas);
rutaEmpresas.put("/actualizar/:id_empresa", validarToken, actualizarEmpresas);
rutaEmpresas.post("/inactivar/:id_empresa", validarToken, inactivarEmpresa);
rutaEmpresas.put("/activar/:id", validarToken, activarEmpresa);

export default rutaEmpresas;