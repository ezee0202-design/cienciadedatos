# TrainUp — Marketplace de Entrenadores Personales

TrainUp es una aplicación web que conecta entrenadores personales con clientes que buscan servicios de fitness y bienestar. Los entrenadores publican sus servicios y los clientes los encuentran, contratan y califican desde la misma plataforma.

---

## Características principales

### Para clientes
- **Búsqueda avanzada** con filtros por categoría, precio, duración, zona, idioma, modalidad y calificación
- **Contratación de servicios** con simulación de pagos vía Stripe
- **Sistema de reseñas** para calificar y comentar servicios contratados
- **Chat con entrenadores** para comunicarse y compartir archivos
- **Gestión de reservas** con seguimiento de estados y reprogramación
- **Perfil personalizable** con datos personales y métricas

### Para entrenadores
- **Gestión completa de servicios** (crear, editar, publicar/despublicar, eliminar)
- **Panel de estadísticas** con métricas de rendimiento (visualizaciones, tasa de conversión, calificaciones)
- **Sistema de solicitudes** para aceptar o rechazar contrataciones
- **Respuesta a reseñas** de clientes
- **Perfil profesional** con certificaciones y descripción

### General
- **Autenticación JWT** con registro y login seguro
- **Recuperación de contraseña** vía email con token temporal (1 hora)
- **Diseño responsive** para dispositivos móviles

---

## Tecnologías

### Frontend
- React 19 con TypeScript
- React Router v6
- Axios
- Stripe React SDK
- Lucide React / React Icons
- CSS3

### Backend
- Node.js con Express.js
- MongoDB con Mongoose
- JWT para autenticación
- Bcrypt (12 rounds) para hash de contraseñas
- Multer para subida de archivos
- Nodemailer para emails
- Stripe para simulación de pagos

---

## Estructura del proyecto

```
TrainUp/
├── iniciar.bat                      # Inicio automático (Windows)
├── README.md
└── server/                          # Backend Node.js
    ├── index.js                     # Servidor principal
    ├── package.json
    ├── .env.example                 # Variables de entorno requeridas
    ├── config/
    │   └── emailConfig.js
    ├── middlewares/
    │   └── authMiddleware.js
    ├── modelos/                     # Esquemas Mongoose
    │   ├── User.js
    │   ├── Servicio.js
    │   ├── Reservas.js
    │   ├── Reseñas.js
    │   ├── Chat.js
    │   └── InteraccionServicio.js
    ├── routes/                      # Rutas de la API
    │   ├── userRoutes.js
    │   ├── serviciosRoutes.js
    │   ├── reservasRoutes.js
    │   ├── reseñasRoutes.js
    │   ├── chatRoutes.js
    │   └── interaccionesRoutes.js
    ├── data/                        # Exports de MongoDB (seed)
    ├── uploads/                     # Imágenes de servicios
    ├── scripts/                     # Utilidades de desarrollo
    └── client/                      # Frontend React
        ├── package.json
        ├── .env.example
        ├── public/
        └── src/
            ├── App.tsx
            ├── types.ts
            ├── assets/
            ├── Componentes/         # Componentes reutilizables
            └── Pantallas/           # Páginas de la aplicación
                ├── Home/
                ├── Login/
                ├── Registro/
                ├── PerfilEntrenador/
                ├── PerfilUsuario/
                ├── Chat/
                ├── InfoServicio/
                └── CompraServicio/
```

---

## Instalación

### Requisitos
- Node.js v14 o superior
- MongoDB (local o Atlas)
- npm

### Pasos

**1. Instalar dependencias del backend**
```bash
cd server
npm install
```

**2. Instalar dependencias del frontend**
```bash
cd client
npm install
```

**3. Configurar variables de entorno**

Copiar `server/.env.example` a `server/.env` y completar los valores:
```env
PORT=5000
JWT_SECRET=tu_jwt_secret_super_seguro
MONGODB_URI=mongodb://localhost:27017/grupo15_api
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=development
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

Copiar `server/client/.env.example` a `server/client/.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## Ejecución

### Opción A — Windows (automático)
```
Doble click en iniciar.bat
```

### Opción B — Manual
```bash
# Terminal 1 — Backend
cd server
npm start

# Terminal 2 — Frontend
cd server/client
npm start
```

La aplicación queda disponible en:
- **Frontend**: http://localhost:3000
- **Backend / API**: http://localhost:5000/api

---

## API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/usuarios/registro` | Registro de usuarios |
| POST | `/api/usuarios/login` | Inicio de sesión |
| POST | `/api/usuarios/recuperar-password` | Solicitar recuperación de contraseña |
| POST | `/api/usuarios/restablecer-password/:token` | Restablecer contraseña con token |

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/usuarios/me` | Perfil del usuario autenticado |
| PUT | `/api/usuarios/me` | Actualizar perfil |
| GET | `/api/usuarios/buscar-entrenadores` | Buscar entrenadores por nombre |
| GET | `/api/usuarios/entrenadores/:id` | Perfil público de un entrenador |

### Servicios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/servicios` | Listar servicios con filtros |
| POST | `/api/servicios` | Crear servicio (entrenadores) |
| GET | `/api/servicios/mios` | Mis servicios |
| GET | `/api/servicios/opciones` | Opciones para filtros |
| GET | `/api/servicios/:id` | Detalle de servicio |
| PATCH | `/api/servicios/:id` | Actualizar servicio |
| DELETE | `/api/servicios/:id` | Eliminar servicio |

### Reservas
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/reservas` | Crear reserva |
| GET | `/api/reservas/cliente` | Reservas del cliente |
| GET | `/api/reservas/entrenador` | Reservas del entrenador |
| PATCH | `/api/reservas/:id/estado` | Cambiar estado |
| PATCH | `/api/reservas/:id/fecha` | Reprogramar |

### Reseñas
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/resenas` | Crear reseña |
| GET | `/api/resenas/servicio/:id` | Reseñas de un servicio |
| GET | `/api/resenas/promedio-servicio/:id` | Promedio de calificaciones |
| PATCH | `/api/resenas/:id/respuesta` | Responder a una reseña |

### Chat
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/chat/conversaciones` | Conversaciones del usuario |
| GET | `/api/chat/mensajes/:participanteId` | Mensajes con un usuario |
| POST | `/api/chat/mensaje` | Enviar mensaje o archivo |

### Interacciones
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/interacciones/visualizacion` | Registrar visita a un servicio |
| GET | `/api/interacciones/estadisticas/:entrenadorId` | Estadísticas del entrenador |

---

## Seguridad

- Contraseñas hasheadas con **bcrypt** (12 rounds)
- **JWT** para autenticación stateless en rutas protegidas
- Validación de contraseñas: mínimo 8 caracteres, mayúscula, número y carácter especial
- Tokens de recuperación de contraseña con expiración de 1 hora
- Las claves de API (Stripe, email) se cargan exclusivamente desde `.env`, nunca hardcodeadas

---

## Estados de reserva

| Estado | Descripción |
|---|---|
| Pendiente | Esperando confirmación del entrenador |
| Confirmada | Aceptada por el entrenador |
| Finalizada | Servicio completado |
| Cancelada | Cancelada por cualquier parte |

---

## Links

- [Prototipo en Figma](https://www.figma.com/proto/9sp4QXL8a2SBYK58hfBakd/TPO?node-id=0-1&t=4HG4U9VJikibi3ZB-1)
- [Repositorio en GitHub](https://github.com/DamianMadinelli/API-GRUPO-15)

---

Trabajo práctico — Grupo 15
