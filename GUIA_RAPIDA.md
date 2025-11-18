# 🎯 Guía Rápida: Sistema de Auto-Generación de Modelos

## 🚀 Inicio Rápido

### Para empezar a usar el sistema completo:

```bash
# Opción 1: Un solo comando (Windows)
iniciar_sistema.bat

# Opción 2: Paso a paso
python backend/app.py        # Terminal 1 - Backend
python frontend/server.py    # Terminal 2 - Frontend
```

---

## 🔍 ¿Qué hace el sistema automáticamente?

```
┌─────────────────────────────────────────────────────────────┐
│  1. Verificar Modelos                                       │
│     ¿Existen todos los archivos .pkl?                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         ├── SÍ ──────────────────────────┐
                         │                                 │
                         └── NO ─────┐                     │
                                     ↓                     │
                    ┌─────────────────────────────────┐   │
                    │  2. Generar Modelos Faltantes   │   │
                    │     Ejecutar scripts automát.   │   │
                    └─────────────────────────────────┘   │
                                     │                     │
                                     ├── ÉXITO ───────────┤
                                     │                     │
                                     └── ERROR (crítico)   │
                                           ↓               ↓
                                      ⛔ ABORTAR      ✅ CONTINUAR
                                                           ↓
                                      ┌─────────────────────────────────┐
                                      │  3. Cargar Modelos en Memoria   │
                                      │     pickle.load() de cada .pkl   │
                                      └─────────────────────────────────┘
                                                           ↓
                                      ┌─────────────────────────────────┐
                                      │  4. Iniciar Servidor Flask      │
                                      │     Backend listo en :5000      │
                                      └─────────────────────────────────┘
```

---

## 📋 Comandos Útiles

### Verificar estado de modelos
```bash
python verificar_modelos.py
```
**Salida:**
```
✅ OK - Modelo de Satisfacción (Random Forest)
✅ OK - Modelo de Seniority/Bien Pagado
❌ INCOMPLETO - Modelo XGBoost (Búsqueda de Trabajo)
   Archivos faltantes:
      • xgboost_model.pkl
```

### Regenerar todos los modelos
```bash
python verificar_modelos.py
# Opción 1: Regenerar TODOS los modelos
```

### Regenerar un modelo específico
```bash
python generate_models.py                  # Satisfacción
python generate_seniority_model.py         # Bien Pagado
python generate_xgboost_model.py          # Búsqueda de Trabajo
python generate_regression_model.py       # Sueldo USD
python generate_regression_futuro.py      # Sueldo Futuro ARS
```

---

## 🐛 Solución de Problemas

### ❌ Error: "database.csv no encontrado"
```bash
# Verificar que existe
dir database.csv

# Si no existe, necesitas tenerlo en la raíz del proyecto
```

### ❌ Error: "Timeout al generar modelo"
```bash
# Genera el modelo manualmente (sin timeout)
python generate_models.py
```

### ❌ Frontend dice "Cannot connect to backend"
```bash
# 1. Verifica que el backend esté corriendo
# 2. Revisa que no haya errores en la terminal del backend
# 3. Accede a http://localhost:5000/api/health

# Si ves "Servidor disponible en: http://localhost:5000"
# entonces el backend está OK
```

### ⚠️ Advertencia: "Modelo no disponible"
```bash
# Ver qué modelos faltan
python verificar_modelos.py

# Regenerar los faltantes
python verificar_modelos.py
# Opción 2: Regenerar solo los modelos faltantes
```

---

## 📊 Arquitectura de Archivos

```
cienciadedatos/
│
├── 📄 database.csv                      ← Datos originales (REQUERIDO)
│
├── 🔧 Scripts de generación
│   ├── generate_models.py              ← Genera modelo de satisfacción
│   ├── generate_seniority_model.py     ← Genera modelo bien pagado
│   ├── generate_xgboost_model.py       ← Genera modelo búsqueda trabajo
│   ├── generate_regression_model.py    ← Genera modelo sueldo USD
│   └── generate_regression_futuro.py   ← Genera modelo sueldo ARS
│
├── 🛠️ Utilidades
│   ├── verificar_modelos.py            ← Verificar/regenerar modelos
│   ├── test_autogen.py                 ← Probar auto-generación
│   └── iniciar_sistema.bat             ← Iniciar todo (Windows)
│
├── 📚 Documentación
│   ├── MODELOS_AUTO_GENERACION.md      ← Manual completo
│   ├── RESUMEN_IMPLEMENTACION.md       ← Resumen técnico
│   └── GUIA_RAPIDA.md                  ← Este archivo
│
└── backend/
    ├── 🖥️ app.py                       ← Backend Flask (con auto-gen)
    │
    └── 📦 Modelos generados (*.pkl)
        ├── random_forest_model.pkl     ← Satisfacción ✅ CRÍTICO
        ├── seniority_model.pkl         ← Bien Pagado
        ├── xgboost_model.pkl           ← Búsqueda Trabajo
        ├── regression_salary_model.pkl ← Sueldo USD
        ├── regression_salary_scaler.pkl
        ├── regression_futuro_model.pkl ← Sueldo Futuro ARS
        └── regression_futuro_scaler.pkl
```

---

## 💡 Tips y Mejores Prácticas

### ✅ DO (Hacer)
- ✅ Ejecuta `verificar_modelos.py` después de clonar el repo
- ✅ Usa `iniciar_sistema.bat` para iniciar todo de una vez
- ✅ Revisa los logs del backend si algo no funciona
- ✅ Mantén `database.csv` en la raíz del proyecto

### ❌ DON'T (No hacer)
- ❌ No elimines manualmente los archivos `.pkl` sin regenerarlos
- ❌ No edites `backend/app.py` mientras el servidor está corriendo
- ❌ No olvides tener instaladas todas las dependencias (`requirements.txt`)
- ❌ No uses Python < 3.8

---

## 🎓 Preguntas Frecuentes

### ❓ ¿Necesito regenerar los modelos cada vez?
**No.** El sistema solo regenera modelos que faltan. Si todos existen, se cargan directamente.

### ❓ ¿Puedo usar solo algunos modelos?
**Sí.** Solo el modelo de "Satisfacción" es crítico. Los demás son opcionales.

### ❓ ¿Cuánto tarda en generar los modelos?
- **Satisfacción:** ~30 segundos
- **Seniority:** ~30 segundos
- **XGBoost:** ~45 segundos
- **Regresión USD:** ~20 segundos
- **Regresión ARS:** ~20 segundos
- **Total:** ~2-3 minutos para todos

### ❓ ¿Los modelos se actualizan automáticamente?
**No.** Una vez generados, permanecen hasta que los elimines o los regeneres manualmente.

### ❓ ¿Qué pasa si falla la generación de un modelo opcional?
El backend inicia de todas formas, pero ese modelo específico no estará disponible en el frontend.

---

## 🔗 Enlaces Útiles

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:8080
- **Health Check:** http://localhost:5000/api/health
- **Documentación Completa:** Ver `MODELOS_AUTO_GENERACION.md`

---

## 📞 Necesitas Ayuda?

1. Lee `MODELOS_AUTO_GENERACION.md` para detalles completos
2. Ejecuta `python verificar_modelos.py` para diagnosticar
3. Revisa los logs en la terminal del backend
4. Verifica que `database.csv` exista y sea válido

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0

