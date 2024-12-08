import { Router } from "express";
import { listarMunicipios } from "../controllers/municipios.controller.js";

export const RutaMunicipios = Router()

RutaMunicipios.get ('/listar', listarMunicipios)