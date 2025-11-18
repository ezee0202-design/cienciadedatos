# 📚 Índice de Documentación - Sistema de Ciencia de Datos

## 🎯 Inicio Rápido

Si es tu primera vez usando el sistema, empieza aquí:

1. **[GUIA_RAPIDA.md](GUIA_RAPIDA.md)** ⭐
   - Comandos básicos
   - Solución de problemas comunes
   - FAQ
   - ~5 minutos de lectura

## 🤖 Sistema de Auto-Generación de Modelos

Documentación del sistema que verifica y genera automáticamente los modelos `.pkl`:

2. **[MODELOS_AUTO_GENERACION.md](MODELOS_AUTO_GENERACION.md)**
   - Manual técnico completo
   - Arquitectura del sistema
   - Troubleshooting detallado
   - ~15 minutos de lectura

3. **[RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md)**
   - Resumen de cambios técnicos
   - Archivos modificados/creados
   - Flujos de trabajo
   - ~10 minutos de lectura

## 📖 Documentación Original del Proyecto

4. **[README.md](README.md)**
   - Descripción general del proyecto
   - Instalación de dependencias
   - Estructura del proyecto

5. **[QUICK_START.md](QUICK_START.md)**
   - Guía de inicio rápido original

6. **[MODELOS_DISPONIBLES.md](MODELOS_DISPONIBLES.md)**
   - Descripción de cada modelo
   - Métricas de rendimiento
   - Casos de uso

## 🛠️ Scripts Disponibles

### Scripts de Generación de Modelos
Estos scripts generan los archivos `.pkl` necesarios:

- `generate_models.py` - Modelo de Satisfacción Salarial ✅ CRÍTICO
- `generate_seniority_model.py` - Modelo de Bien Pagado
- `generate_xgboost_model.py` - Modelo de Búsqueda de Trabajo
- `generate_regression_model.py` - Modelo de Predicción de Sueldo (USD)
- `generate_regression_futuro.py` - Modelo de Sueldo Futuro (ARS)

### Scripts de Utilidad
- `verificar_modelos.py` - Verificar y regenerar modelos interactivamente
- `test_autogen.py` - Probar el sistema de auto-generación
- `iniciar_sistema.bat` - Iniciar backend + frontend automáticamente

## 🏗️ Estructura del Proyecto

```
cienciadedatos/
│
├── 📄 database.csv                          # Datos originales
│
├── 🐍 Scripts de Python
│   ├── generate_*.py                       # Generadores de modelos
│   ├── verificar_modelos.py                # Utilidad de verificación
│   └── test_autogen.py                     # Tests
│
├── 🌐 Backend (Flask)
│   └── backend/
│       ├── app.py                          # Servidor API
│       ├── *.pkl                           # Modelos entrenados
│       └── *.json                          # Configuración de modelos
│
├── 💻 Frontend
│   └── frontend/
│       ├── index.html                      # Página principal
│       ├── app.js                          # Lógica principal
│       ├── api.js                          # Llamadas al backend
│       └── styles.css                      # Estilos
│
└── 📚 Documentación
    ├── README.md
    ├── GUIA_RAPIDA.md                      # ⭐ Empieza aquí
    ├── MODELOS_AUTO_GENERACION.md
    └── RESUMEN_IMPLEMENTACION.md
```

## 🎨 Uso por Tipo de Usuario

### 👨‍💻 Desarrollador (Primera vez)
1. Lee [GUIA_RAPIDA.md](GUIA_RAPIDA.md)
2. Ejecuta `python verificar_modelos.py`
3. Ejecuta `iniciar_sistema.bat`

### 🔧 Administrador del Sistema
1. Lee [MODELOS_AUTO_GENERACION.md](MODELOS_AUTO_GENERACION.md)
2. Familiarízate con `verificar_modelos.py`
3. Revisa [RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md) para entender los cambios

### 👤 Usuario Final
1. Ejecuta `iniciar_sistema.bat`
2. Abre http://localhost:8080 en tu navegador
3. Si algo falla, revisa [GUIA_RAPIDA.md](GUIA_RAPIDA.md) sección "Solución de Problemas"

### 📊 Data Scientist
1. Lee [MODELOS_DISPONIBLES.md](MODELOS_DISPONIBLES.md)
2. Revisa los scripts `generate_*.py` para ver cómo se entrenan los modelos
3. Consulta `backend/app.py` para ver los endpoints de predicción

## 🚀 Comandos Quick Reference

```bash
# Ver estado de modelos
python verificar_modelos.py

# Regenerar todos los modelos
python verificar_modelos.py  # Opción 1

# Iniciar sistema completo
iniciar_sistema.bat

# Iniciar solo backend
python backend/app.py

# Iniciar solo frontend
python frontend/server.py

# Generar modelo específico
python generate_models.py
python generate_xgboost_model.py
# ... etc
```

## 📞 Soporte y Ayuda

### Problemas Comunes
1. **Backend no inicia:** Revisa [GUIA_RAPIDA.md](GUIA_RAPIDA.md) → Solución de Problemas
2. **Modelos faltantes:** Ejecuta `python verificar_modelos.py`
3. **Database.csv no encontrado:** Copia el archivo a la raíz del proyecto
4. **Frontend no conecta:** Verifica que backend esté corriendo en puerto 5000

### Recursos Adicionales
- Logs del backend: Terminal donde ejecutaste `python backend/app.py`
- Health check: http://localhost:5000/api/health
- Frontend dev console: F12 en el navegador

## 🔄 Actualizaciones Recientes

### Noviembre 2025 - v1.0
- ✨ **NUEVO:** Sistema de auto-generación de modelos
- ✨ **NUEVO:** Script `verificar_modelos.py` 
- ✨ **NUEVO:** Script `iniciar_sistema.bat`
- ✨ **NUEVO:** Documentación completa
- 🔧 **MEJORADO:** Backend verifica modelos antes de iniciar
- 🔧 **MEJORADO:** Frontend con scroll arreglado en selección de modelos

## 📖 Orden de Lectura Recomendado

### Para nuevos usuarios:
1. [GUIA_RAPIDA.md](GUIA_RAPIDA.md) - 5 min
2. Ejecutar `iniciar_sistema.bat`
3. Explorar el frontend en http://localhost:8080

### Para desarrolladores:
1. [GUIA_RAPIDA.md](GUIA_RAPIDA.md) - 5 min
2. [RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md) - 10 min
3. [MODELOS_AUTO_GENERACION.md](MODELOS_AUTO_GENERACION.md) - 15 min
4. Revisar código en `backend/app.py` función `check_and_generate_models()`

### Para administradores:
1. [MODELOS_AUTO_GENERACION.md](MODELOS_AUTO_GENERACION.md) - 15 min
2. [RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md) - 10 min
3. Probar con `python test_autogen.py`
4. Practicar con `python verificar_modelos.py`

---

**Última actualización:** Noviembre 2025  
**Mantenido por:** Equipo de Ciencia de Datos UADE

