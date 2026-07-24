const nodemailer = require("nodemailer")

// Ethereal para debugging
const createEtherealTransporter = async () => {
  try {
    console.log("// Creando cuenta de Ethereal...")

    // Crear cuenta de prueba en Ethereal
    const testAccount = await nodemailer.createTestAccount()

    console.log("!! Cuenta de Ethereal creada:")
    console.log("   Usuario:", testAccount.user)
    console.log("   Contraseña:", testAccount.pass)

    const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
  tls: {
    rejectUnauthorized: false, // acepta certificados autofirmados
  },
  debug: true,   // opcional para ver logs
  logger: true,  // opcional para ver más detalles
});

    // verificar la conexión
    await transporter.verify()
    console.log("- Conexión SMTP verificada correctamente")

    return transporter
  } catch (error) {
    console.error("X Error configurando Ethereal:", error)
    throw error
  }
}

// aca envia mail de recuperación
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    console.log(`Preparando email para: ${email}`)
    console.log(`URL de reset: ${resetUrl}`)

    const transporter = await createEtherealTransporter()

    const mailOptions = {
      from: '"TrainUp - Soporte" <noreply@trainup.com>',
      to: email,
      subject: "Recuperación de Contraseña - TrainUp",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2600FF; margin: 0;">TrainUp</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-top: 0;">Recuperación de Contraseña</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Hola,
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Recibimos una solicitud para restablecer tu contraseña en TrainUp.
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Haz clic en el siguiente botón para restablecer tu contraseña:
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2600FF; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;
                        font-weight: bold; font-size: 16px;">
                Restablecer Contraseña
              </a>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                ⚠️ Este enlace expirará en 1 hora.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Si no solicitaste este cambio, puedes ignorar este email de forma segura.
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              Si tienes problemas con el botón, copia y pega este enlace en tu navegador:
            </p>
            <p style="color: #2600FF; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 TrainUp. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
      text: `
TrainUp - Recuperación de Contraseña

Hola,

Recibimos una solicitud para restablecer tu contraseña en TrainUp.

Visita el siguiente enlace para restablecer tu contraseña:
${resetUrl}

⚠️ Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este email de forma segura.

---
Este es un email automático, por favor no respondas a este mensaje.
© 2025 TrainUp. Todos los derechos reservados.
      `,
    }

    console.log(" -- Enviando email...")
    const info = await transporter.sendMail(mailOptions)

    console.log("!! Email enviado exitosamente!")
    console.log("   Message ID:", info.messageId)

    const previewUrl = nodemailer.getTestMessageUrl(info)
    console.log("- Preview URL:", previewUrl)

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl,
    }
  } catch (error) {
    console.error("Error enviando email:", error)
    throw error
  }
}

module.exports = {
  sendPasswordResetEmail,
  createEtherealTransporter,
}
