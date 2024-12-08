import { pool } from "../database/conexion.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import transporter from "../database/emailConfig.js";
import dotenv from "dotenv";

dotenv.config({path:'./src/env/.env'});

// Validar email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar contraseña
const isValidPassword = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && // Al menos una mayúscula
           /[a-z]/.test(password) && // Al menos una minúscula
           /[0-9]/.test(password) && // Al menos un número
           /[!@#$%^&*]/.test(password); // Al menos un carácter especial
};

// Nuevo endpoint para verificar token
export const verifyToken = async (req, res) => {
    try {
        const { token } = req.body;
        
        const sql = `
            SELECT * FROM personas 
            WHERE resetPasswordToken = ? 
            AND resetPasswordExpires > NOW()
            AND estado = 'Activo'
        `;
        const [user] = await pool.query(sql, [token]);

        if (user.length === 0) {
            return res.status(400).json({ 
                message: "Token inválido o expirado" 
            });
        }

        res.status(200).json({ 
            message: "Token válido",
            email: user[0].correo // Enviar email para mostrar al usuario
        });

    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(500).json({ 
            message: "Error al verificar el token" 
        });
    }
};

export const tokenPassword = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!isValidEmail(correo)) {
            return res.status(400).json({ 
                message: "Formato de correo electrónico inválido" 
            });
        }

        const sql = `
            SELECT * FROM personas 
            WHERE correo = ? 
            AND estado = 'Activo'
        `;
        const [user] = await pool.query(sql, [correo]);

        if (user.length === 0) {
            return res.status(404).json({ 
                message: "No se encontró un usuario activo con este correo" 
            });
        }

        // Verificar tiempo entre solicitudes
        const [existingToken] = await pool.query(
            `SELECT resetPasswordExpires FROM personas 
             WHERE correo = ? AND resetPasswordExpires > NOW()`,
            [correo]
        );

        if (existingToken.length > 0) {
            // Calcular tiempo restante
            const tiempoRestante = new Date(existingToken[0].resetPasswordExpires) - new Date();
            const minutosRestantes = Math.ceil(tiempoRestante / 60000); // Convertir a minutos y redondear hacia arriba

            return res.status(429).json({ 
                message: `Por favor espere ${minutosRestantes} minutos antes de solicitar otro código`,
                tiempoRestante: minutosRestantes
            });
        }

        // Resto del código igual...
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const token = jwt.sign(
            { 
                identificacion: user[0].identificacion,
                code: verificationCode
            },
            process.env.AUT_SECRET,
            { expiresIn: '1h' }
        );

        const expires = new Date(Date.now() + 3600000); // 1 hora
        await pool.query(
            `UPDATE personas 
             SET resetPasswordToken = ?, 
                 resetPasswordExpires = ? 
             WHERE correo = ?`,
            [verificationCode, expires, correo]
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user[0].correo,
            subject: "Código de Verificación - TrackProductivo",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #006000;">Recuperación de Contraseña</h2>
                    <p>Hola ${user[0].nombres},</p>
                    <p>Tu código de verificación es:</p>
                    <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
                        ${verificationCode}
                    </div>
                    <p>Este código expirará en 1 hora.</p>
                    <p>Si no solicitaste este código, ignora este correo.</p>
                    <p>Saludos,<br>El equipo de TrackProductivo</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ 
            message: "Código de verificación enviado exitosamente",
            expiraEn: 60 // Indicar que el código expira en 60 minutos
        });

    } catch (error) {
        console.error('Error en recuperación:', error);
        res.status(500).json({ 
            message: "Error al procesar la solicitud" 
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!isValidPassword(password)) {
            return res.status(400).json({ 
                message: "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales como *" 
            });
        }

        const sql = `
            SELECT * FROM personas 
            WHERE resetPasswordToken = ? 
            AND resetPasswordExpires > NOW()
            AND estado = 'Activo'
        `;
        const [user] = await pool.query(sql, [token]);

        if (user.length === 0) {
            return res.status(400).json({ 
                message: "Código inválido o expirado" 
            });
        }

        const isSamePassword = await bcrypt.compare(password, user[0].password);
        if (isSamePassword) {
            return res.status(400).json({ 
                message: "La nueva contraseña debe ser diferente a la anterior" 
            });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sqlUpdate = `
            UPDATE personas 
            SET password = ?,
                resetPasswordToken = NULL,
                resetPasswordExpires = NULL 
            WHERE id_persona = ?
        `;
        const [result] = await pool.query(sqlUpdate, [hashedPassword, user[0].id_persona]);

        if (result.affectedRows > 0) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user[0].correo,
                subject: "Contraseña Actualizada - TrackProductivo",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #006000;">Contraseña Actualizada</h2>
                        <p>Hola ${user[0].nombres},</p>
                        <p>Tu contraseña ha sido actualizada exitosamente.</p>
                        <p>Si no realizaste este cambio, contacta inmediatamente con soporte.</p>
                        <p>Saludos,<br>El equipo de TrackProductivo</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);

            return res.status(200).json({ 
                message: "Contraseña actualizada exitosamente" 
            });
        }

        throw new Error("Error al actualizar la contraseña");

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ 
            message: "Error al restablecer la contraseña" 
        });
    }
};