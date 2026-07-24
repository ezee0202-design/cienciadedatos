const { sendPasswordResetEmail } = require("../config/emailConfig")

async function testEmail() {
  console.log("Probando la configuración de email...")

  try {
    const result = await sendPasswordResetEmail(
      "test@example.com",
      "test-token-123",
      "http://localhost:3000/restablecer-password/test-token-123",
    )

    console.log("< ! > Test exitoso!")
    console.log("Preview URL:", result.previewUrl)
  } catch (error) {
    console.error("< X > Test falló:", error)
  }
}

testEmail()
