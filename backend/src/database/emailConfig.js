import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: './src/env/.env' });

// Validar que las variables de entorno existan
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Las variables de entorno EMAIL_USER y EMAIL_PASS son requeridas');
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar la conexión
transporter.verify(function (error, success) {
    if (error) {
        console.log("Error al configurar el correo:", error);
    } else {
        console.log("Servidor de correo listo");
    }
});

export default transporter;