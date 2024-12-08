import { Router } from "express";
import { descargarPdf } from "../controllers/principal.js";

export const Principal = Router()

Principal.get("/descargar", descargarPdf);