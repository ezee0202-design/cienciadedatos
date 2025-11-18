# 🎯 Guía de Modelos Disponibles

Tu aplicación ahora soporta **dos modelos de predicción** diferentes. El usuario puede elegir entre ellos usando un selector en el frontend.

---

## 📊 Modelos Disponibles

### 1. **Modelo de Satisfacción Salarial** (Default)
- **Archivo**: `backend/random_forest_model.pkl`
- **Target**: Predice si estás conforme con tu salario
  - **Clase 0**: Mal Pago / Insatisfecho (valores 1-2 en encuesta)
  - **Clase 1**: Bien Pago / Satisfecho (valores 3-4 en encuesta)
- **Features**: 10 características del trabajador
- **Accuracy**: 69.5%
- **F1-Score**: 69.3%
- **Top Feature**: `sueldo_bruto_en_dolares` (46.1% importancia)

**¿Cuándo usar este modelo?**
- Quieres saber si un trabajador está satisfecho con su salario
- Basado en la pregunta: "¿Qué tan conforme estás con tus ingresos?"

---

### 2. **Modelo Bien Pagado** (Nuevo)
- **Archivo**: `backend/seniority_model.pkl`
- **Target**: Predice si ganas más que el promedio de tu grupo (rol + seniority)
  - **Clase 0**: Mal Pagado (gana menos que promedio del grupo)
  - **Clase 1**: Bien Pagado (gana más que promedio del grupo)
- **Features**: 16 características (mismo bloque 9 del notebook)
- **Accuracy**: 68.4%
- **F1-Score**: 67.4%
- **Top Feature**: `tengo_edad` (14.4% importancia)

**¿Cuándo usar este modelo?**
- Quieres saber si un trabajador está bien pagado comparado con su grupo
- Compara salario vs promedio de personas con mismo `Trabajo de` + `seniority`

---

## 🔄 Cómo Cambiar Entre Modelos

### En el Frontend (index.html)

El usuario ve un selector destacado al inicio del formulario de predicción:

```html
<select id="model-select" class="form-input model-select">
    <option value="satisfaction">Satisfacción Salarial</option>
    <option value="seniority">Bien Pagado</option>
</select>
```

### Flujo de Selección

1. Usuario selecciona el modelo desde el dropdown
2. La descripción se actualiza automáticamente
3. Al hacer clic en "Realizar Predicción":
   - Se envía `model_type: 'satisfaction'` o `'seniority'`
   - Backend carga el modelo correspondiente
   - Retorna predicción usando el modelo seleccionado

---

## 🎨 Interfaz Visual

La caja del selector tiene un diseño destacado con:
- **Fondo degradado**: Morado/azul
- **Descripción dinámica**: Cambia según el modelo seleccionado
- **Texto explicativo**: Indica qué predice cada modelo

---

## 🔧 Backend (app.py)

El backend detecta automáticamente qué modelo usar:

```python
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    model_type = data.get('model_type', 'satisfaction')  # default
    
    if model_type == 'seniority':
        selected_model = seniority_model
        selected_features = seniority_features
    else:
        selected_model = model
        selected_features = features
    
    # ... realiza predicción con el modelo seleccionado
```

**Archivos cargados al iniciar**:
- `random_forest_model.pkl` + `features.json` + `analysis_results.json`
- `seniority_model.pkl` + `seniority_features.json` + `seniority_analysis.json`

---

## 📈 Comparación de Modelos

| Característica | Satisfacción | Bien Pagado |
|---|---|---|
| **Accuracy** | 69.5% | 68.4% |
| **F1-Score** | 69.3% | 67.4% |
| **Features más importante** | Sueldo bruto USD | Edad |
| **Tipo de target** | Subjetivo (opinión) | Objetivo (vs promedio) |
| **Registros** | 12,418 | 12,401 |
| **Clase 0** | Insatisfecho (1-2) | Gana menos del promedio |
| **Clase 1** | Satisfecho (3-4) | Gana más del promedio |

---

## 🚀 Cómo Usar la Aplicación

1. **Iniciar servidores**:
   ```bash
   # Backend
   cd backend
   python app.py
   
   # Frontend (otra terminal)
   cd frontend
   python server.py
   ```

2. **Abrir navegador**: http://localhost:8080

3. **Realizar predicción**:
   - Seleccionar modelo deseado
   - Llenar formulario con datos del trabajador
   - Hacer clic en "Realizar Predicción"
   - Ver resultado con probabilidades

---

## 📁 Archivos del Proyecto

### Modelos
```
backend/
├── random_forest_model.pkl          # Modelo satisfacción
├── features.json                    # Features satisfacción
├── analysis_results.json            # Métricas satisfacción
├── seniority_model.pkl              # Modelo bien pagado
├── seniority_features.json          # Features bien pagado
└── seniority_analysis.json          # Métricas bien pagado
```

### Scripts de Generación
```
generate_models.py           # Genera modelo de satisfacción
generate_seniority_model.py  # Genera modelo de bien pagado
```

### Frontend
```
frontend/
├── index.html           # Interfaz con selector de modelos
├── app.js              # Lógica de la aplicación
├── api.js              # Comunicación con backend
├── ui.js               # Actualización de UI
└── styles.css          # Estilos (incluye .model-selector-box)
```

---

## 💡 Futuras Mejoras

- **Agregar más modelos**: Por ejemplo, predicción de rango salarial
- **Comparar ambos modelos**: Mostrar predicción de ambos simultáneamente
- **Gráficas por modelo**: Mostrar feature importance específico del modelo elegido
- **Explicabilidad**: Integrar SHAP para explicar cada predicción

---

## ❓ FAQ

**¿Puedo usar ambos modelos al mismo tiempo?**
- Sí, el backend los carga simultáneamente. Solo selecciona uno por predicción.

**¿Los modelos usan las mismas features?**
- No exactamente:
  - **Satisfacción**: 10 features (incluye sueldo_bruto_en_dolares)
  - **Bien Pagado**: 16 features (más características del bloque 9)

**¿Qué pasa si falta el modelo de seniority?**
- El backend seguirá funcionando, solo mostrará error si intentas usarlo.
- El modelo de satisfacción funciona independientemente.

**¿Cómo agrego un tercer modelo?**
1. Entrena el modelo y guarda `.pkl`
2. Agrega path en `backend/app.py`
3. Carga el modelo en `load_model()`
4. Agrega opción en `<select id="model-select">`
5. Actualiza lógica en `/api/predict`

---

## 🎓 Créditos

- **Dataset**: Encuesta Sysarmy 2024-2025
- **Algoritmo**: Random Forest Classifier (scikit-learn)
- **Framework Backend**: Flask
- **Framework Frontend**: Vanilla JavaScript
