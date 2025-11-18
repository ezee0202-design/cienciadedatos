# 📦 INSTRUCCIONES DE INSTALACIÓN

## Para usuarios nuevos (sin archivos .pkl)

### ✅ OPCIÓN 1: Setup Automático (Recomendado)

1. **Descarga el repositorio** completo con todos los archivos
2. **Abre una terminal** en la carpeta del proyecto
3. **Ejecuta el setup**:
   ```bash
   python setup_complete.py
   ```

Este script automáticamente:
- ✓ Verifica que tengas `database.csv`
- ✓ Instala todas las dependencias necesarias
- ✓ Entrena los 5 modelos de Machine Learning
- ✓ Genera todos los archivos .pkl requeridos
- ✓ Te indica cómo iniciar la aplicación

**Tiempo estimado**: 2-5 minutos (dependiendo de tu PC)

---

### ✅ OPCIÓN 2: Instalación Manual

Si prefieres hacerlo paso a paso:

#### 1. Instalar Python
Necesitas Python 3.8 o superior
```bash
python --version
```

#### 2. Instalar dependencias
```bash
pip install pandas numpy scikit-learn xgboost flask flask-cors matplotlib
```

#### 3. Entrenar los modelos
Ejecuta estos scripts en orden:

```bash
# Modelo 1: Satisfacción Salarial (Random Forest)
python generate_models.py

# Modelo 2: Nivel de Seniority
python generate_seniority_model.py

# Modelo 3: XGBoost
python generate_xgboost_model.py

# Modelo 4: Regresión Sueldo Actual (USD)
python generate_regression_model.py

# Modelo 5: Regresión Sueldo Futuro (ARS)
python generate_regression_futuro.py
```

Cada script mostrará el progreso y resultados del entrenamiento.

#### 4. Verificar que todo está listo
```bash
python verificar_todo.py
```

Deberías ver:
```
✅ random_forest_model.pkl
✅ seniority_model.pkl
✅ xgboost_model.pkl
✅ regression_salary_model.pkl
✅ regression_salary_scaler.pkl
✅ regression_futuro_model.pkl
✅ regression_futuro_scaler.pkl
```

---

## 🚀 Iniciar la Aplicación

### Windows (Opción Rápida)
```bash
run.bat
```

### Inicio Manual (Todas las plataformas)

**Terminal 1 - Backend:**
```bash
python backend/app.py
```
Espera a ver: `Running on http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
python frontend/server.py
```
Espera a ver: `Serving HTTP on 0.0.0.0 port 8000`

**Abre tu navegador:**
```
http://localhost:8000
```

---

## 📁 Archivos Requeridos

### ✅ Archivos que DEBES tener (incluidos en el repo):
```
database.csv                      # Dataset (12,418 registros)
setup_complete.py                 # Setup automático ⭐
generate_models.py                # Genera modelo satisfacción
generate_seniority_model.py       # Genera modelo seniority
generate_xgboost_model.py         # Genera modelo XGBoost
generate_regression_model.py      # Genera regresión USD
generate_regression_futuro.py     # Genera regresión ARS
backend/app.py                    # API Flask
frontend/index.html               # Interfaz web
frontend/server.py                # Servidor HTTP
run.bat                          # Script de inicio Windows
verificar_todo.py                # Verificación de archivos
```

### ⚠️ Archivos que se GENERAN automáticamente (no incluir en repo):
```
backend/random_forest_model.pkl
backend/features.json
backend/analysis_results.json
backend/seniority_model.pkl
backend/seniority_features.json
backend/seniority_analysis.json
backend/xgboost_model.pkl
backend/xgboost_features.json
backend/xgboost_analysis.json
backend/regression_salary_model.pkl
backend/regression_salary_scaler.pkl
backend/regression_salary_features.json
backend/regression_salary_analysis.json
backend/regression_futuro_model.pkl
backend/regression_futuro_scaler.pkl
backend/regression_futuro_features.json
backend/regression_futuro_analysis.json
```

---

## 🔧 Solución de Problemas

### Error: "No module named 'pandas'"
```bash
pip install pandas numpy scikit-learn xgboost flask flask-cors matplotlib
```

### Error: "database.csv not found"
Asegúrate de que `database.csv` esté en la carpeta raíz del proyecto (mismo nivel que setup_complete.py)

### Error: "Port 5000 already in use"
Cierra otras aplicaciones que usen el puerto 5000 o modifica el puerto en `backend/app.py`:
```python
app.run(debug=True, port=5001)  # Cambiar a 5001
```

### Los modelos tardan mucho en entrenar
Es normal. Con 12,418 registros, cada modelo puede tomar:
- Satisfacción: ~30 segundos
- Seniority: ~20 segundos
- XGBoost: ~40 segundos
- Regresión USD: ~15 segundos
- Regresión ARS: ~15 segundos
**Total: ~2-3 minutos**

### Error: "Invalid load key" al cargar modelos
Los modelos fueron entrenados con una versión diferente de scikit-learn. Solución:
```bash
pip install --upgrade scikit-learn
python setup_complete.py  # Re-entrenar
```

---

## 📊 ¿Qué hace cada modelo?

1. **Random Forest (Satisfacción)**: Predice si un empleado está satisfecho con su salario
2. **Seniority**: Clasifica el nivel de experiencia (Junior/Semi-Senior/Senior)
3. **XGBoost**: Predicción avanzada de satisfacción con gradient boosting
4. **Regresión USD**: Estima el sueldo actual en dólares
5. **Regresión ARS Futuro**: Predice el sueldo futuro en pesos argentinos (incluye variable temporal)

---

## 🌐 Funcionalidades de la App

- 🎯 **Predicción de Satisfacción**: 3 modelos diferentes (Random Forest, Seniority, XGBoost)
- 💰 **Predicción de Sueldo**: Actual (USD) y Futuro (ARS)
- 📈 **Clustering Interactivo**: Selecciona cualquier columna del dataset para analizar
- 📊 **Visualizaciones**: Gráficos interactivos con Chart.js

---

## 📌 Resumen Rápido

```bash
# 1. Clonar/Descargar el repo
git clone <tu-repo-url>
cd CIENCIA_DATOS

# 2. Setup automático
python setup_complete.py

# 3. Iniciar
run.bat  # Windows
# o manualmente:
# Terminal 1: python backend/app.py
# Terminal 2: python frontend/server.py

# 4. Abrir navegador
http://localhost:8000
```

---

## 💡 Tips

- **No subas los .pkl al repositorio**: Son archivos grandes y específicos de cada máquina
- **Usa .gitignore**: Agrega `*.pkl` para evitar subirlos accidentalmente
- **Comparte el código**: Los scripts `generate_*.py` permiten recrear los modelos
- **Dataset incluido**: Asegúrate de que `database.csv` SÍ esté en el repo

---

## 🆘 Soporte

Si tienes problemas:
1. Ejecuta `python verificar_todo.py` para diagnosticar
2. Revisa que todos los scripts `generate_*.py` estén presentes
3. Verifica que `database.csv` tenga 12,418 filas
4. Asegúrate de tener Python 3.8+

---

**¡Listo! 🎉** Con estos pasos, cualquier persona puede descargar tu proyecto y tenerlo funcionando en minutos.
