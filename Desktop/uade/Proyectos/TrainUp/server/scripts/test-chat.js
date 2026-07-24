const axios = require("axios")

// Configuración
const BASE_URL = "http://localhost:5000"
let token1, token2
let user1Id, user2Id

async function testChat() {
  console.log("Iniciando pruebas del chat...\n")

  try {
    // 1. Crear dos usuarios de prueba
    console.log("1. Creando usuarios de prueba...")

    try {
      const user1 = await axios.post(`${BASE_URL}/api/usuarios/registro`, {
        email: "cliente1@test.com",
        contraseña: "123456",
        nombreCompleto: "Cliente Test 1",
        FechaNacimiento: "1990-01-01",
        role: "cliente",
      })
      console.log("- Usuario 1 creado")
    } catch (error) {
      if (error.response?.data?.mensaje?.includes("ya está registrado")) {
        console.log("i: Usuario 1 ya existe, continuando...")
      } else {
        throw error
      }
    }

    try {
      const user2 = await axios.post(`${BASE_URL}/api/usuarios/registro`, {
        email: "entrenador1@test.com",
        contraseña: "123456",
        nombreCompleto: "Entrenador Test 1",
        FechaNacimiento: "1985-01-01",
        role: "entrenador",
      })
      console.log("- Usuario 2 creado")
    } catch (error) {
      if (error.response?.data?.mensaje?.includes("ya está registrado")) {
        console.log("i: Usuario 2 ya existe, continuando...")
      } else {
        throw error
      }
    }

    // 2. Hacer login con ambos usuarios
    console.log("\n2. Haciendo login...")

    const login1 = await axios.post(`${BASE_URL}/api/usuarios/login`, {
      email: "cliente1@test.com",
      contraseña: "123456",
    })
    token1 = login1.data.token
    user1Id = login1.data.usuario.id
    console.log("- Login usuario 1 exitoso")

    const login2 = await axios.post(`${BASE_URL}/api/usuarios/login`, {
      email: "entrenador1@test.com",
      contraseña: "123456",
    })
    token2 = login2.data.token
    user2Id = login2.data.usuario.id
    console.log("- Login usuario 2 exitoso")

    // 3. Enviar mensaje del usuario 1 al usuario 2
    console.log("\n3. Enviando mensaje de prueba...")

    const mensaje = await axios.post(
      `${BASE_URL}/api/chat/enviar-mensaje`,
      {
        participanteId: user2Id,
        contenido: "¡Hola! Este es un mensaje de prueba del chat 👋",
      },
      {
        headers: { Authorization: `Bearer ${token1}` },
      },
    )
    console.log("- Mensaje enviado:", mensaje.data)

    // 4. Responder desde el usuario 2
    console.log("\n4. Enviando respuesta...")

    const respuesta = await axios.post(
      `${BASE_URL}/api/chat/enviar-mensaje`,
      {
        participanteId: user1Id,
        contenido: "¡Hola! Soy el entrenador, ¿en qué puedo ayudarte? 💪",
      },
      {
        headers: { Authorization: `Bearer ${token2}` },
      },
    )
    console.log("- Respuesta enviada:", respuesta.data)

    // 5. Verificar conversaciones del usuario 1
    console.log("\n5. Verificando conversaciones...")

    const conversaciones1 = await axios.get(`${BASE_URL}/api/chat/conversaciones`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    console.log("- Conversaciones usuario 1:", conversaciones1.data.length)

    const conversaciones2 = await axios.get(`${BASE_URL}/api/chat/conversaciones`, {
      headers: { Authorization: `Bearer ${token2}` },
    })
    console.log("- Conversaciones usuario 2:", conversaciones2.data.length)

    // 6. Obtener mensajes de la conversación
    console.log("\n6. Obteniendo mensajes...")

    const conversacion = await axios.get(`${BASE_URL}/api/chat/conversacion/${user2Id}`, {
      headers: { Authorization: `Bearer ${token1}` },
    })
    console.log("- Mensajes en conversación:", conversacion.data.mensajes.length)
    console.log("- Mensajes:")
    conversacion.data.mensajes.forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg.esPropio ? "Tú" : "Otro"}: ${msg.contenido}`)
    })

    console.log("\n Todas las pruebas del chat pasaron exitosamente")
    console.log("\n Datos para probar en el frontend:")
    console.log(` Usuario 1: cliente1@test.com / 123456`)
    console.log(` Usuario 2: entrenador1@test.com / 123456`)
    console.log(` User1 ID: ${user1Id}`)
    console.log(` User2 ID: ${user2Id}`)
  } catch (error) {
    console.error(" Error en las pruebas:")
    console.error("Status:", error.response?.status)
    console.error("Data:", error.response?.data)
    console.error("Message:", error.message)
  }
}

// Ejecutar las pruebas
testChat()
