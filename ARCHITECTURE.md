# 🏗️ ARQUITECTURA DE LA APLICACIÓN

## Sistema Completo de Análisis de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WEB BROWSER (Frontend)                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  📊 Dashboard  │  🔍 EDA  │  🤖 Model  │  🎯 Predicción  │     │   │
│  │                                                                  │   │
│  │  - Métricas           - Gráficas EDA    - Configuración        │   │
│  │  - KPIs              - Correlaciones   - Feature Import         │   │
│  │  - Dataset Info      - Faltantes       - Matriz Confusión       │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│           ↕ HTTP/JSON (Fetch API)                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND API (Python)                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  GET  /api/health                → Status                       │   │
│  │  GET  /api/analysis-info         → Resultados Análisis         │   │
│  │  GET  /api/model-metrics         → Métricas del Modelo         │   │
│  │  GET  /api/feature-importance    → Ranking de Features         │   │
│  │  GET  /api/dataset-info          → Info del Dataset            │   │
│  │  GET  /api/model-info            → Configuración               │   │
│  │  POST /api/predict               → Predicción (Seniority)      │   │
│  │  GET  /api/available-graphics    → Lista de Gráficas           │   │
│  │  GET  /api/graphics/{filename}   → Descarga de PNG             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│           ↕                                                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│              JUPYTER NOTEBOOK (Análisis & Entrenamiento)                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  1. Carga de Datos (database.csv)                               │   │
│  │     └─→ 12,420 registros × 45 columnas                          │   │
│  │                                                                  │   │
│  │  2. Exploración de Datos (EDA)                                  │   │
│  │     ├─ Estadísticas descriptivas                                │   │
│  │     ├─ Valores faltantes                                        │   │
│  │     ├─ Distribuciones                                           │   │
│  │     └─ Correlaciones                                            │   │
│  │                                                                  │   │
│  │  3. Preparación de Datos                                        │   │
│  │     ├─ Tratamiento de faltantes                                 │   │
│  │     ├─ Selección de 9 features                                  │   │
│  │     └─ Train/Test Split (80/20)                                 │   │
│  │                                                                  │   │
│  │  4. Entrenamiento Random Forest                                 │   │
│  │     ├─ 200 árboles                                              │   │
│  │     ├─ Max Depth: 15                                            │   │
│  │     └─ Target: Seniority                                        │   │
│  │                                                                  │   │
│  │  5. Evaluación & Validación                                     │   │
│  │     ├─ Accuracy (~75-82%)                                       │   │
│  │     ├─ Precision/Recall/F1                                      │   │
│  │     └─ Feature Importance                                       │   │
│  │                                                                  │   │
│  │  6. Generación de Gráficas (PNG)                                │   │
│  │     ├─ distributions.png                                        │   │
│  │     ├─ correlation_matrix.png                                   │   │
│  │     ├─ missing_values.png                                       │   │
│  │     ├─ confusion_matrix.png                                     │   │
│  │     ├─ feature_importance.png                                   │   │
│  │     └─ model_metrics.png                                        │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│           ↓ Genera                                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      ARCHIVOS GENERADOS                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Backend:                                                         │   │
│  │  ├─ random_forest_model.pkl (Modelo entrenado)                  │   │
│  │  ├─ features.json (Lista de features)                           │   │
│  │  └─ analysis_results.json (Resultados análisis)                 │   │
│  │                                                                  │   │
│  │ Frontend:                                                        │   │
│  │  ├─ distributions.png (Gráfica)                                 │   │
│  │  ├─ correlation_matrix.png (Gráfica)                            │   │
│  │  ├─ missing_values.png (Gráfica)                                │   │
│  │  ├─ confusion_matrix.png (Gráfica)                              │   │
│  │  ├─ feature_importance.png (Gráfica)                            │   │
│  │  └─ model_metrics.png (Gráfica)                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│           Usados por Backend API ↓                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Flujo de Datos

### Predicción (POST /api/predict)

```
User Input (Formulario)
    ↓
JavaScript (app.js)
    ↓
Fetch API → POST /api/predict
    ↓
Flask Backend (app.py)
    ↓
RandomForest.predict() [Modelo cargado en memoria]
    ↓
Calcular probabilidades
    ↓
JSON Response
    ↓
UI Update (ui.js)
    ↓
Mostrar resultado en navegador
```

### Consulta de Análisis (GET /api/analysis-info)

```
Cargar Dashboard
    ↓
Fetch API → GET /api/analysis-info
    ↓
Backend carga analysis_results.json
    ↓
JSON Response
    ↓
ui.updateDashboard()
    ↓
Mostrar métricas, KPIs, gráficos
```

---

## 🔄 Ciclo de Vida de la Aplicación

```
1. INSTALACIÓN
   └─→ python setup.py
       └─→ Instala dependencias Python

2. ANÁLISIS & ENTRENAMIENTO
   └─→ jupyter notebook data_analysis.ipynb
       ├─→ Lee database.csv
       ├─→ Realiza EDA
       ├─→ Entrena Random Forest
       ├─→ Genera gráficas (PNG)
       └─→ Guarda modelo y resultados (JSON, PKL)

3. INICIO DEL BACKEND
   └─→ python backend/app.py
       ├─→ Carga modelo (PKL)
       ├─→ Carga resultados (JSON)
       └─→ Inicia Flask en puerto 5000

4. INICIO DEL FRONTEND
   └─→ python frontend/server.py
       └─→ Inicia servidor HTTP en puerto 8080

5. INTERACCIÓN CON USUARIO
   ├─→ Abre navegador: http://localhost:8080
   ├─→ Frontend carga index.html
   ├─→ JavaScript ejecuta app.js
   ├─→ Conecta con Backend API (http://localhost:5000)
   ├─→ Carga y muestra datos
   ├─→ Usuario interactúa:
   │   ├─ Navega por secciones
   │   ├─ Ve análisis y gráficas
   │   ├─ Realiza predicciones
   │   └─ Descarga gráficas
   └─→ Todas las acciones vía API REST

6. CIERRE
   └─→ Ctrl+C en terminales
       ├─→ Detiene Backend
       ├─→ Detiene Frontend
       └─→ Todos los procesos finalizados
```

---

## 🎯 Arquitectura de Software

### Patrón: Model-View-Controller (MVC)

```
MODEL (Backend)
├─ Random Forest Classifier
├─ Dataset Analysis
└─ Prediction Logic

CONTROLLER (Flask API)
├─ Request Handling
├─ Data Processing
└─ Response Generation

VIEW (Frontend)
├─ HTML (Estructura)
├─ CSS (Presentación)
├─ JavaScript (Interacción)
└─ UI Updates
```

### Patrón: REST API

```
HTTP Methods:
├─ GET    → Retrieve (leer datos)
├─ POST   → Create (crear/predecir)
├─ PUT    → Update (actualizar) [No usado]
└─ DELETE → Delete (borrar) [No usado]

Resource Endpoints:
├─ /api/analysis-info
├─ /api/model-metrics
├─ /api/model-info
├─ /api/dataset-info
├─ /api/feature-importance
├─ /api/graphics/...
└─ /api/predict
```

---

## 💾 Almacenamiento de Datos

### Sesión 1: Entrenamiento del Modelo

```
database.csv (input)
    ↓
pandas.read_csv()
    ↓
Limpieza y preparación
    ↓
Entrenamiento Random Forest
    ↓
Exportar:
├─ random_forest_model.pkl (Modelo)
├─ features.json (Columnas)
├─ analysis_results.json (Resultados)
└─ *.png (Gráficas)
```

### Sesión 2+: Predicción

```
Frontend (app.js)
    ↓
Solicitud POST /api/predict
    ↓
Backend carga:
├─ random_forest_model.pkl
├─ features.json
    ↓
Random Forest.predict()
    ↓
Response JSON
    ↓
Frontend renderiza resultado
```

---

## 🔐 Seguridad

### Validación
- ✓ Validación de inputs en frontend
- ✓ Validación de features en backend
- ✓ Manejo de excepciones

### CORS
- ✓ Flask-CORS habilitado
- ✓ Acepta solicitudes de localhost:8080

### Error Handling
- ✓ Try-catch en JavaScript
- ✓ Try-except en Python
- ✓ Mensajes de error user-friendly

---

## 📊 Stack Tecnológico

```
                    Frontend
                   ┌────────┐
                   │ Browser│
                   └────────┘
                       ↕
          HTTP/JSON (Fetch API)
                       ↕
    ┌──────────────────────────────────┐
    │      Backend Flask API           │
    │  ┌────────────────────────────┐  │
    │  │  Python 3.11+              │  │
    │  │  - Flask                   │  │
    │  │  - Flask-CORS              │  │
    │  │  - scikit-learn            │  │
    │  │  - pandas                  │  │
    │  └────────────────────────────┘  │
    └──────────────────────────────────┘
                       ↑
              Consume Modelo
                       ↑
    ┌──────────────────────────────────┐
    │   Machine Learning Model         │
    │  ┌────────────────────────────┐  │
    │  │  Random Forest Classifier  │  │
    │  │  - 200 árboles             │  │
    │  │  - 9 features              │  │
    │  │  - 3 clases (Seniority)    │  │
    │  └────────────────────────────┘  │
    └──────────────────────────────────┘
                       ↑
            Entrenado desde
                       ↑
    ┌──────────────────────────────────┐
    │  Jupyter Notebook - EDA & ML     │
    │  ┌────────────────────────────┐  │
    │  │  Python 3.11+              │  │
    │  │  - pandas                  │  │
    │  │  - numpy                   │  │
    │  │  - scikit-learn            │  │
    │  │  - matplotlib              │  │
    │  │  - seaborn                 │  │
    │  └────────────────────────────┘  │
    └──────────────────────────────────┘
                       ↑
                Analiza
                       ↑
                database.csv
```

---

## 📈 Performance

### Tiempos Esperados

```
Setup (install dependencies)     : 5-10 minutos
Notebook (EDA + Training)        : 5-10 minutos
Backend start                    : 2-5 segundos
Frontend start                   : 1-2 segundos
Dashboard load                   : 2-3 segundos
Prediction                       : <100 ms
Graphics load                    : 1-5 segundos
```

### Escalabilidad

```
Actual:
├─ 1 usuario
├─ Local (localhost)
└─ ~100 MB RAM

Para Producción:
├─ Múltiples usuarios
├─ Servidor remoto
├─ Load Balancing
├─ Base de datos
└─ Caché (Redis)
```

---

## 🎓 Aprendizajes

### Ciencia de Datos
- ✓ Análisis exploratorio
- ✓ Limpieza de datos
- ✓ Feature engineering
- ✓ Machine learning
- ✓ Validación de modelos

### Ingeniería de Software
- ✓ API REST
- ✓ Frontend web
- ✓ Full-stack development
- ✓ Integration
- ✓ Documentation

### Herramientas
- ✓ Python/pandas/scikit-learn
- ✓ Flask
- ✓ HTML/CSS/JavaScript
- ✓ Jupyter
- ✓ Git (opcional)

---

## 🚀 Próximos Niveles

```
NIVEL 1 (Actual)
├─ Single User
├─ Local
└─ In-Memory Storage

NIVEL 2 (Próximo)
├─ Multi User
├─ Database (PostgreSQL)
└─ Authentication

NIVEL 3 (Avanzado)
├─ Cloud Deployment (AWS/GCP/Azure)
├─ Microservices
├─ Real-time Updates
└─ Advanced Analytics

NIVEL 4 (Experto)
├─ Multiple Models
├─ A/B Testing
├─ Monitoring & Logging
└─ AutoML
```

---

**Arquitectura diseñada para ser escalable, mantenible y educativa** 🏗️


