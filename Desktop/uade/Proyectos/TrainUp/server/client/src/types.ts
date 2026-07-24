export interface Conversacion {
  id: string
  participante: {
    id: string
    nombre: string
    avatar: string
  }
  ultimoMensaje: {
    contenido: string
    fecha: string
  } | null
  fechaUltimaActividad: string
}

export interface Mensaje {
  id: string
  contenido: string
  esPropio: boolean
  timestamp: string
  tipoArchivo?: string
  archivoUrl?: string
  nombreArchivo?: string
}

export interface Usuario {
  id: string
  nombreCompleto: string
  email: string
  role: "cliente" | "entrenador"
  fotoPerfilUrl?: string
}
