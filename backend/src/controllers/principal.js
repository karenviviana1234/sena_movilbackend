import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const descargarPdf = async (req, res) => {
    try {
        const pdfFileName = req.query.nombre;

        if (!pdfFileName || typeof pdfFileName !== 'string') {
            return res.status(400).json({ message: 'Debe proporcionar un nombre de archivo válido' });
        }

        // Ruta específica de tus archivos
        const filePath = path.resolve(__dirname, '../../public/archivos', pdfFileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: `Archivo no encontrado en la ruta: ${filePath}` });
        }

        res.sendFile(filePath, { headers: { 'Content-Disposition': `attachment; filename="${pdfFileName}"` } });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
};
