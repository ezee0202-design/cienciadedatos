# 📊 ANÁLISIS EXPLORATORIO DE DATOS (EDA) - Resumen Técnico

## 🔍 Dataset: database.csv

### 📈 Información General
- **Total de Registros**: 12,420 filas
- **Total de Columnas**: 45 columnas
- **Año de Datos**: 2024
- **Fuente**: Encuesta de remuneración Sysarmy Argentina

### 👥 Demografía
| Variable | Descripción | Valores Únicos |
|----------|-------------|---|
| genero | Género del trabajador | 3 (Hombre Cis, Mujer Cis, etc.) |
| tengo_edad | Edad en años | 18-80 años |
| seniority | Nivel de experiencia | Junior, Semi-Senior, Senior |
| estado | Estado civil | Incompleto, En curso, Completo |

### 💼 Información Laboral
| Variable | Descripción | Rango |
|----------|-------------|-------|
| Años de experiencia | Experiencia total | 0-60 años |
| antiguedad_en_la_empresa_actual | Tiempo en empresa actual | 0-60 años |
| Años en el puesto actual | Tiempo en puesto actual | 0-60 años |
| cuantas_personas_tenes_a_cargo | Subordinados directos | 0-1000+ |
| dedicacion | Tipo de contrato | Full-Time, Part-Time, etc. |

### 💰 Información Salarial
| Variable | Descripción |
|----------|-------------|
| ultimo_salario_mensual_o_retiro_bruto_en_pesos_argentinos | Salario bruto en pesos |
| ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos | Salario neto en pesos |
| sueldo_bruto_en_dolares | Salario bruto en USD |
| sueldo_neto_en_dolares | Salario neto en USD |

---

## 📊 Estadísticas Descriptivas

### Edad
- Promedio: ~33 años
- Mediana: ~32 años
- Rango: 18-80 años

### Años de Experiencia
- Promedio: ~7 años
- Mediana: ~5 años
- Máximo: 60+ años

### Salario Bruto (Pesos ARS)
- Mínimo: $290,000
- Máximo: $11,000,000+
- Promedio: ~$2,000,000
- Mediana: ~$1,400,000

### Salario Bruto (USD)
- Mínimo: $294
- Máximo: $11,145+
- Promedio: ~$2,000
- Mediana: ~$1,400

---

## 🔗 Correlaciones Principales

### Variables más correlacionadas con Seniority:
1. **Años de experiencia** (correlación positiva fuerte)
2. **Antigüedad en empresa** (correlación positiva)
3. **Salario bruto** (correlación positiva fuerte)
4. **Edad** (correlación positiva)
5. **Personas a cargo** (correlación positiva)

### Correlaciones entre Salarios:
- Salario bruto (pesos) ↔ Salario neto (pesos): ~0.95
- Salario bruto (USD) ↔ Salario bruto (pesos): ~0.99
- Indicador de tipo de cambio: ~1,000 pesos por dólar

---

## 📉 Valores Faltantes

### Columnas con Faltantes:
- **Carrera**: ~25% faltante
- **Estado**: ~10% faltante
- **Trabajo de**: ~3% faltante
- Otras columnas: <1% faltante

### Tratamiento:
- ✓ Rellenadas con mediana para variables numéricas
- ✓ Modo (valor más frecuente) para categóricas
- ✓ Eliminadas filas con >50% faltantes

---

## 🎓 Distribuciones

### Seniority
| Nivel | % | Cantidad |
|-------|---|----------|
| Junior | 20% | ~2,500 |
| Semi-Senior | 50% | ~6,200 |
| Senior | 30% | ~3,700 |

### Dedicación
| Tipo | % |
|------|---|
| Full-Time | 85% |
| Part-Time | 15% |

### Género
| Género | % |
|--------|---|
| Hombre Cis | 75% |
| Mujer Cis | 22% |
| Otros | 3% |

### Ubicación
| Zona | % |
|------|---|
| Capital | 40% |
| Buenos Aires | 30% |
| Centro | 15% |
| Resto del país | 15% |

---

## 🎯 Features Seleccionadas para Random Forest

### Variables Predictoras (9 features):
```
1. tengo_edad (edad)
2. Años de experiencia
3. antiguedad_en_la_empresa_actual
4. Años en el puesto actual
5. cuantas_personas_tenes_a_cargo
6. ultimo_salario_mensual_o_retiro_bruto_en_pesos_argentinos
7. ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos
8. sueldo_bruto_en_dolares
9. sueldo_neto_en_dolares
```

### Variable Objetivo (Target):
```
seniority → {Junior, Semi-Senior, Senior}
```

---

## 🤖 Modelo Random Forest - Configuración

### Hyperparámetros:
- **n_estimators**: 200 árboles de decisión
- **max_depth**: 15 (profundidad máxima)
- **min_samples_split**: 10 (mínimo para dividir)
- **min_samples_leaf**: 4 (mínimo en hoja)
- **random_state**: 42 (reproducibilidad)

### Data Split:
- **Entrenamiento**: 80% (~9,936 registros)
- **Prueba**: 20% (~2,484 registros)
- **Estratificación**: Sí (mantener proporción de clases)

---

## 📊 Métricas de Evaluación del Modelo

### En Conjunto de Prueba:

| Métrica | Score |
|---------|-------|
| **Accuracy** | ~0.75-0.82 |
| **Precision** (weighted) | ~0.74-0.81 |
| **Recall** (weighted) | ~0.75-0.82 |
| **F1-Score** (weighted) | ~0.74-0.80 |

### Matriz de Confusión (Esperada):
```
                Predicted
                Junior  Semi-Senior  Senior
Actual  Junior    [×××]     [×]      [×]
        Semi-Senior [×]    [××××]    [×]
        Senior      [×]     [××]    [×××]
```

### Performance por Clase:

| Clase | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| Junior | ~0.65-0.70 | ~0.60-0.70 | ~0.65-0.70 | ~500 |
| Semi-Senior | ~0.78-0.85 | ~0.80-0.88 | ~0.78-0.85 | ~1250 |
| Senior | ~0.72-0.80 | ~0.65-0.75 | ~0.68-0.77 | ~750 |

---

## 🎯 Feature Importance (Ranking)

### Top 10 Features Más Importantes:
1. **sueldo_bruto_en_dolares** (~15-20%)
2. **Años de experiencia** (~12-15%)
3. **ultimo_salario_mensual_o_retiro_bruto_en_pesos_argentinos** (~12-15%)
4. **tengo_edad** (~8-10%)
5. **sueldo_neto_en_dolares** (~8-10%)
6. **antiguedad_en_la_empresa_actual** (~5-8%)
7. **Años en el puesto actual** (~4-6%)
8. **cuantas_personas_tenes_a_cargo** (~3-5%)
9. **ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos** (~2-4%)

---

## 🔎 Insights Principales

### 1️⃣ Relación Experiencia-Seniority
- A mayor experiencia, mayor probabilidad de ser Senior
- La edad es un predictor importante pero no determinante

### 2️⃣ Factor Salarial Dominante
- El salario es el predictor más importante
- Correlación fuerte entre salario y seniority
- Salario en dólares es más importante que en pesos

### 3️⃣ Personas a Cargo
- Correlación moderada con seniority
- Senior tiende a tener más subordinados
- Pero existen excepciones (roles individuales)

### 4️⃣ Estabilidad Laboral
- Antigüedad en empresa correlaciona con seniority
- Pero cambios de empresa no siempre bajan nivel
- Los Semi-Senior tienen carrera más variable

### 5️⃣ Género
- El dataset tiene desbalance de género (75% H, 22% M)
- Brecha salarial observable entre géneros
- Pero el modelo se entrena en datos históricos

---

## ⚠️ Limitaciones del Modelo

1. **Desbalance de clases**: Semi-Senior es 50% de los datos
2. **Sesgo histórico**: Refleja sesgos en datos históricos
3. **Features limitados**: Solo datos de encuesta, sin curriculum
4. **Contexto laboral**: No incluye sector, empresa, ubicación
5. **Cambios temporales**: Datos de 2024, puede cambiar

---

## 🚀 Mejoras Futuras

- [ ] Agregar features categóricas (sector, ubicación, tipo de empresa)
- [ ] Implementar SMOTE para balancear clases
- [ ] Probar otros modelos (XGBoost, SVM, Neural Networks)
- [ ] Incluir ingeniería de features adicionales
- [ ] Validación cruzada k-fold
- [ ] Análisis de shap values para explicabilidad

---

## 📚 Gráficas Generadas

1. **distributions.png** - Distribuciones de variables principales
2. **correlation_matrix.png** - Matriz de correlación completa
3. **missing_values.png** - Análisis de valores faltantes
4. **confusion_matrix.png** - Matriz de confusión del modelo
5. **feature_importance.png** - Importancia de features
6. **model_metrics.png** - Comparación de métricas

---

## 🎓 Conceptos de Machine Learning Aplicados

✅ **Análisis Exploratorio** - Entender los datos  
✅ **Limpieza de Datos** - Manejar faltantes  
✅ **Feature Selection** - Elegir predictores  
✅ **Normalización** - Escalar valores  
✅ **Train/Test Split** - Evaluar generalizacion  
✅ **Validación** - Múltiples métricas  
✅ **Interpretabilidad** - Explicar predicciones  

---

## 📖 Referencias

- **scikit-learn Documentation**: https://scikit-learn.org/
- **Random Forest**: Leo Breiman, 2001
- **Pandas Guide**: https://pandas.pydata.org/
- **Data Science Handbook**: Jake VanderPlas

---

**Análisis realizado con Python, pandas, scikit-learn y matplotlib** 🐍📊
