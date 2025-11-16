# 📊 Análisis de Datos con Random Forest - Aplicación Web

Una aplicación completa de ciencia de datos que realiza análisis exploratorio de datos (EDA) y aplica machine learning con Random Forest. Incluye frontend web moderno y backend con API REST.

## 📋 Características

- ✅ **Análisis Exploratorio (EDA)**: Estadísticas, distribuciones y análisis de correlaciones
- ✅ **Machine Learning**: Modelo Random Forest para predicción de Seniority
- ✅ **Visualizaciones**: Gráficas interactivas de resultados
- ✅ **Predicciones**: Interfaz web para realizar predicciones individuales
- ✅ **API REST**: Backend Flask con endpoints para todas las operaciones
- ✅ **Frontend Responsivo**: Interfaz moderna con diseño responsivo

## 🗂️ Estructura del Proyecto

```
APP 2/
├── database.csv                 # Datos de entrada
├── notebooks/
│   └── data_analysis.ipynb     # Jupyter Notebook con EDA y Random Forest
├── backend/
│   ├── app.py                  # Aplicación Flask con API
│   ├── requirements.txt         # Dependencias Python
│   ├── random_forest_model.pkl # Modelo entrenado (generado)
│   ├── features.json           # Lista de features (generado)
│   └── analysis_results.json   # Resultados del análisis (generado)
├── frontend/
│   ├── index.html              # Página principal
│   ├── styles.css              # Estilos CSS
│   ├── app.js                  # Lógica principal
│   ├── api.js                  # Funciones de API
│   ├── ui.js                   # Funciones de UI
│   ├── server.py               # Servidor HTTP
│   └── *.png                   # Gráficas generadas
└── data/                       # Carpeta para datos adicionales
```

## 🚀 Instalación y Ejecución

### Paso 1: Instalar Dependencias

```powershell
# Instalar dependencias Python
cd ".\APP 2\backend"
pip install -r requirements.txt
```

### Paso 2: Ejecutar Análisis

Abrir el notebook de Jupyter y ejecutar todas las celdas:

```powershell
cd ".\APP 2\notebooks"
jupyter notebook data_analysis.ipynb
```

O ejecutar desde VS Code:
- Instalar extensión Jupyter
- Abrir `data_analysis.ipynb`
- Ejecutar todas las celdas (Ctrl+Shift+Enter)

**Esto generará:**
- Gráficas en `frontend/`
- Modelo en `backend/random_forest_model.pkl`
- Datos en `backend/analysis_results.json` y `backend/features.json`

### Paso 3: Iniciar Backend

```powershell
cd ".\APP 2\backend"
python app.py
```

Deberías ver:
```
===============================================================================
INICIANDO SERVIDOR BACKEND
===============================================================================

✓ Modelo cargado exitosamente
✓ Iniciando servidor Flask...

📍 Servidor disponible en: http://localhost:5000
📍 Frontend disponible en: http://localhost:8000
```

### Paso 4: Iniciar Frontend (Nueva Terminal)

```powershell
cd ".\APP 2\frontend"
python server.py
```

Deberías ver:
```
================================================================================
SERVIDOR HTTP DEL FRONTEND
================================================================================

✓ Servidor iniciado en: http://localhost:8000
✓ Sirviendo archivos desde: ...
```

### Paso 5: Acceder a la Aplicación

Abre tu navegador y ve a: **http://localhost:8000**

## 📊 Secciones de la Aplicación

### 📈 Dashboard
- Resumen de métricas principales
- Información del modelo y dataset
- Distribución de seniority

### 🔍 Análisis Exploratorio
- Distribuciones de variables
- Matriz de correlación
- Análisis de valores faltantes

### 🤖 Modelo Random Forest
- Configuración del modelo
- Feature Importance
- Matriz de Confusión
- Métricas de evaluación

### 🎯 Realizar Predicción
- Formulario para ingresar datos de un trabajador
- Resultado de predicción con probabilidades
- Confianza de la predicción

### 📸 Galería de Gráficas
- Todas las gráficas generadas en alta resolución

## 🔌 Endpoints de la API

### Health Check
```
GET /api/health
```

### Obtener Información del Análisis
```
GET /api/analysis-info
```
Retorna: métricas, features importantes, info del dataset, distribuciones

### Obtener Métricas del Modelo
```
GET /api/model-metrics
```
Retorna: accuracy, precision, recall, f1-score

### Obtener Importancia de Features
```
GET /api/feature-importance
```
Retorna: lista ordenada de features por importancia

### Obtener Información del Dataset
```
GET /api/dataset-info
```
Retorna: tamaño, cantidad de filas/columnas, distribución de clases

### Obtener Información del Modelo
```
GET /api/model-info
```
Retorna: tipo, número de árboles, profundidad, clases, etc.

### Realizar Predicción
```
POST /api/predict
Content-Type: application/json

{
    "tengo_edad": 30,
    "Años de experiencia": 5,
    "antiguedad_en_la_empresa_actual": 2,
    "Años en el puesto actual": 2,
    "cuantas_personas_tenes_a_cargo": 0,
    "ultimo_salario_mensual_o_retiro_bruto_en_pesos_argentinos": 1000000,
    "ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos": 850000,
    "sueldo_bruto_en_dolares": 1000,
    "sueldo_neto_en_dolares": 850
}
```
Retorna: predicción, confianza, probabilidades por clase

### Obtener Gráficas Disponibles
```
GET /api/available-graphics
```
Retorna: lista de nombres de archivos PNG disponibles

### Descargar Gráfica
```
GET /api/graphics/{filename}
```
Retorna: archivo PNG

## 📈 Características del Notebook

El notebook `data_analysis.ipynb` contiene:

1. **Importación de librerías**: pandas, numpy, scikit-learn, matplotlib, seaborn
2. **Carga de datos**: Lee database.csv y muestra información general
3. **Análisis Exploratorio**:
   - Estadísticas descriptivas
   - Análisis de valores faltantes
   - Distribuciones de variables
   - Matriz de correlaciones
4. **Preparación de datos**:
   - Tratamiento de faltantes
   - Selección de features
   - Normalización
   - Split train/test (80/20)
5. **Entrenamiento Random Forest**:
   - 200 árboles
   - Profundidad máxima 15
   - Validación cruzada
6. **Evaluación**:
   - Accuracy, Precision, Recall, F1-Score
   - Matriz de confusión
   - ROC-AUC
7. **Visualizaciones**:
   - Feature Importance
   - Métricas de rendimiento
   - Distribuciones
   - Correlaciones

## 🎯 Modelo Random Forest

**Configuración:**
- Estimadores: 200 árboles
- Profundidad máxima: 15
- Estratificación: Sí
- Split: 80% entrenamiento, 20% prueba

**Target Variable:** Seniority
- Junior
- Semi-Senior
- Senior

**Features Utilizadas:**
- Edad
- Años de experiencia
- Antigüedad en empresa
- Años en puesto actual
- Personas a cargo
- Salarios (bruto/neto en pesos y dólares)

## 🛠️ Tecnologías Utilizadas

**Backend:**
- Python 3.11+
- Flask (Framework web)
- scikit-learn (Machine Learning)
- pandas (Análisis de datos)
- numpy (Computación numérica)
- matplotlib/seaborn (Visualizaciones)

**Frontend:**
- HTML5
- CSS3 (Diseño responsivo)
- JavaScript (Vanilla)
- Fetch API (Comunicación HTTP)

**Otros:**
- Jupyter Notebook (Análisis)
- pickle (Serialización de modelos)

## 🐛 Solución de Problemas

### "Servidor backend no disponible"
- Verifica que Flask esté corriendo en puerto 5000
- Ejecuta: `python app.py` en la carpeta backend

### "No se encuentran las gráficas"
- Asegúrate de haber ejecutado todo el notebook
- Las gráficas deben estar en `frontend/` con extensión `.png`

### "Error CORS"
- Verifica que Flask-CORS esté instalado
- El backend debe permitir solicitudes desde localhost:8000

### Puerto 5000 u 8000 ocupado
```powershell
# Encontrar proceso usando puerto 5000
netstat -ano | findstr :5000

# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F
```

## 📝 Notas Importantes

1. **Ejecutar notebook primero**: El notebook genera el modelo y gráficas necesarias
2. **Orden de inicio**:
   - Primero: Jupyter Notebook (ejecutar todas las celdas)
   - Segundo: Backend Flask
   - Tercero: Frontend
   - Cuarto: Abrir navegador

3. **Ubicación relativa**: Asegúrate de que database.csv esté en la carpeta raíz del proyecto

## 🔐 Consideraciones de Seguridad

- La aplicación está configurada en modo debug (desarrollo)
- Para producción, cambiar `debug=False` en app.py
- Implementar autenticación si es necesario
- Validar todos los inputs en la API

## 📧 Contacto y Soporte

Para problemas o sugerencias, revisa:
- Logs de Flask en la terminal del backend
- Console de navegador (F12) para errores de frontend
- Notebook para validar datos y modelo

## 📄 Licencia

Proyecto de Ingeniería en Ciencia de Datos - 2024

---

**¡Listo para usar! 🚀**
