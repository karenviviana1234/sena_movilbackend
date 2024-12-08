import { Router } from 'express';
import { 
  registrarNovedad, 
  actualizarNovedades, 
  eliminarNovedad, 
  listarnovedades, 
  cargarImage,
  listar
} from '../controllers/novedades.controller.js';
import { validarToken } from '../controllers/seguridad.controller.js';


const rutaNovedades = Router();



rutaNovedades.get('/listarN/:id_seguimiento', validarToken, listar);

rutaNovedades.get('/listar/:identificacion', validarToken, listarnovedades);
rutaNovedades.post('/registrar', validarToken, cargarImage, registrarNovedad);
rutaNovedades.put('/actualizar/:id', validarToken, cargarImage, actualizarNovedades);
rutaNovedades.delete('/eliminar/:id_novedad', validarToken, eliminarNovedad);

export default rutaNovedades;