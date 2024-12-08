import { Router } from 'express';
import { importExcel, upload } from '../controllers/importarExcel.js'; // Asegúrate de que la ruta sea correcta

const rutaImportarExcel = Router();

// Solo usa 'upload' aquí, ya que .single('file') está definido en el controlador
rutaImportarExcel.post('/import', upload, importExcel);

export default rutaImportarExcel;
