# 📊 GUÍA DE USO - APLICACIÓN DE ANÁLISIS DE DATOS

## 🚀 Inicio Rápido

### Paso 1: Abrir 2 terminales

**Terminal 1 - Backend:**
```powershell
cd "e:\TPO - CIENCIA DE DATOS\APP 2\backend"
python app.py
```

**Terminal 2 - Frontend:**
```powershell
cd "e:\TPO - CIENCIA DE DATOS\APP 2\frontend"
python server.py
```

### Paso 2: Abrir navegador
- URL: `http://localhost:8080`

---

## 📋 Funcionalidades de la Aplicación

### 1. **Dashboard**
- 📊 Métricas generales del dataset
- 📈 Estadísticas de seniority
- ⭐ KPIs principales

### 2. **Análisis Exploratorio de Datos (EDA)**
- 📉 Distribuciones de variables
- 🔗 Matriz de correlación
- ❌ Análisis de valores faltantes

### 3. **Información del Modelo**
- 🤖 Configuración del Random Forest
- 📊 Matriz de confusión
- 📈 Métricas de desempeño (Accuracy, Precision, Recall)

### 4. **Predictor**
- ✍️ Formulario para predecir seniority
- 🎯 Resultado en tiempo real
- 💡 Recomendaciones basadas en features

### 5. **Galería de Gráficas**
- 🖼️ Visualización completa de todos los análisis
- 📥 Descargable para reportes

---

## 📊 Gráficas Disponibles

| Gráfica | Descripción | Ubicación |
|---------|-------------|-----------|
| **Distributions** | Histogramas de todas las variables | EDA + Galería |
| **Correlation Matrix** | Matriz de correlación de Pearson | EDA + Galería |
| **Missing Values** | Análisis de valores nulos | EDA + Galería |
| **Feature Importance** | Importancia de características en RF | Modelo + Galería |
| **Confusion Matrix** | Matriz de confusión del modelo | Modelo + Galería |
| **Model Metrics** | Gráficos de desempeño (Precision, Recall) | Modelo + Galería |

---

## 🐍 Archivos del Proyecto

```
├── backend/
│   ├── app.py                    # API Flask con 9 endpoints
│   ├── random_forest_model.pkl   # Modelo entrenado (1.5MB)
│   ├── features.json             # Nombres de features
│   ├── analysis_results.json     # Resultados del análisis
│   └── requirements.txt          # Dependencias
│
├── frontend/
│   ├── index.html                # Interfaz HTML5
│   ├── styles.css                # Estilos responsive
│   ├── app.js                    # Controlador principal
│   ├── api.js                    # Cliente HTTP
│   ├── ui.js                     # Actualizaciones DOM
│   ├── server.py                 # Servidor HTTP
│   └── *.png                     # 6 gráficas (300 DPI)
│
├── notebooks/
│   └── data_analysis.ipynb       # Análisis completo (Jupyter)
│
└── database.csv                  # Dataset original (12,420 filas)
```

---

## 🔧 API REST Endpoints

### Información General
```
GET /api/dashboard
GET /api/analysis
GET /api/model-info
```

### Predicciones
```
POST /api/predict
Body: {"feature_values": [...]}
```

### Gráficas
```
GET /api/graphics/<filename.png>
GET /api/graphics-base64/<filename.png>
```

### Features
```
GET /api/features
```

---

## ❌ Solución de Problemas

### Las gráficas no cargan
```powershell
# 1. Verificar que existan
python diagnostico_graficas.py

# 2. Reiniciar servidores
# Terminal 1: Ctrl+C
# Terminal 2: Ctrl+C
# Ejecutar nuevamente los comandos de inicio
```

### Error de CORS
✓ Ya está configurado en app.py con `Flask-CORS`

### Puerto 5000 en uso
```powershell
netstat -ano | Select-String "5000"
taskkill /PID <PID> /F
```

### Puerto 8080 en uso
```powershell
netstat -ano | Select-String "8080"
taskkill /PID <PID> /F
```

---

## 📈 Métricas del Modelo

| Métrica | Valor |
|---------|-------|
| **Accuracy** | 100% |
| **Features** | 9 variables |
| **Clases** | 3 (Junior, Semi-Senior, Senior) |
| **Árbol Depth** | 15 |
| **N° Árboles** | 200 |

---

## 💻 Tecnologías Utilizadas

### Backend
- Python 3.11+
- Flask 2.3.2
- scikit-learn 1.3.0
- pandas 2.0.3

### Frontend
- HTML5
- CSS3 (Responsive)
- JavaScript ES6+ (Fetch API)

### Datos
- pandas: Manipulación
- numpy: Cálculos
- matplotlib/seaborn: Visualización

---

## 📝 Notas Importantes

1. **Dataset**: 12,420 filas × 45 columnas (datos de empleados en Argentina)
2. **Target**: Seniority (Junior/Semi-Senior/Senior)
3. **Modelo**: Random Forest Classifier
4. **Precisión**: 100% en datos de entrenamiento
5. **Base64**: Las gráficas se sirven como datos codificados para máxima compatibilidad

---

## 🆘 Contacto & Soporte

Si necesitas ayuda:
1. Ejecuta: `python diagnostico_graficas.py`
2. Verifica logs en las terminales
3. Consulta `TECHNICAL_ANALYSIS.md` para detalles técnicos

---

**Última actualización**: 2024
**Estado**: ✅ Producción


