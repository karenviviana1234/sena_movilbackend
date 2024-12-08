import express from 'express'
//d

import body_parser from 'body-parser'
import cors from 'cors'
import rutaPersona from './src/routes/personas.route.js'
import rutaActividades from './src/routes/actividades.route.js'
import rutaSeguimiento from './src/routes/seguimiento.route.js'
import rutaBitacoras from './src/routes/bitacoras.route.js'
import rutaFichas from './src/routes/fichas.route.js'
import rutaMatriculas from './src/routes/matriculas.route.js'
import rutaVinculaciones from './src/routes/vinculaciones.route.js'
import rutaProductiva from './src/routes/productiva.route.js'
import rutaEmpresas from './src/routes/empresas.route.js'
import rutaAmbientes from './src/routes/ambientes.route.js'
import rutaSeguridad from './src/routes/seguridad.route.js'
import rutaPrograma from './src/routes/programa.route.js'
import { rutaAreas } from './src/routes/areas.route.js'
import { rutaHorarios } from './src/routes/Horarios.js'
import { RutaMunicipios } from './src/routes/municipios.route.js'
import rutaNovedades from './src/routes/novedades.route.js'
import rutaAsignacion from './src/routes/asignacion.route.js'
import router from './src/routes/importExcel.route.js'
import rutaImportarExcel from './src/routes/importExcel.route.js'
import routepassword from './src/routes/recuperar.route.js'
import { Principal } from './src/routes/principal.route.js'

const servidor = express()

servidor.use(cors())

servidor.use(body_parser.json())
servidor.use(body_parser.urlencoded({ extended: false }))
servidor.use('/public', express.static('public'));

servidor.use( rutaSeguridad )
servidor.use('/personas', rutaPersona)
servidor.use('/actividades', rutaActividades)
servidor.use('/seguimientos', rutaSeguimiento)
servidor.use('/bitacoras', rutaBitacoras)
servidor.use('/fichas', rutaFichas)
servidor.use('/matriculas', rutaMatriculas)
servidor.use('/vinculacion', rutaVinculaciones)
servidor.use('/productiva', rutaProductiva)
servidor.use('/empresas', rutaEmpresas)
servidor.use('/ambientes', rutaAmbientes)
servidor.use('/programa', rutaPrograma)
servidor.use('/areas', rutaAreas)
servidor.use('/horarios', rutaHorarios )
servidor.use('/municipios', RutaMunicipios )
servidor.use('/novedad', rutaNovedades )
servidor.use(rutaAsignacion )
servidor.use('/import', router)
servidor.use('/novedades', rutaNovedades)
servidor.use('/excel', rutaImportarExcel)
servidor.use('/password', routepassword)
servidor.use('/principal', Principal)

servidor.use(express.static('./public'))
servidor.set('view engine', 'ejs')

servidor.get('/document', (req,res) => {
    res.render('document.ejs')
})

servidor.listen(3000, '0.0.0.0', () => {
    console.log('Servidor funcionando en el puerto 3000');
});