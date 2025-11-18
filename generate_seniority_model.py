"""
Script para crear modelo Random Forest prediciendo 'bien_pagado'
basado en comparación de salario vs promedio del grupo (Trabajo de + Seniority)
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score,
    classification_report,
    confusion_matrix
)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import json
import pickle

print("="*60)
print("GENERACIÓN DE MODELO: Predicción de 'bien_pagado'")
print("="*60)

# =============================================================
# PASO 1: Cargar datos
# =============================================================
print("\n[PASO 1] Cargando database.csv...")

df = pd.read_csv("database.csv")
print(f"✓ Dataset cargado: {df.shape[0]} registros, {df.shape[1]} columnas")

# =============================================================
# PASO 2: Limpiar outliers de salarios
# =============================================================
print("\n[PASO 2] Limpiando outliers de salarios...")

# Convertir a numérico
df["sueldo_neto_en_dolares"] = pd.to_numeric(df["sueldo_neto_en_dolares"], errors="coerce")

# Filtrar outliers razonables
min_sueldo = 100
max_sueldo = 10000

df_clean = df[
    (df["sueldo_neto_en_dolares"] >= min_sueldo) &
    (df["sueldo_neto_en_dolares"] <= max_sueldo)
].copy()

print(f"✓ Registros después de limpieza: {df_clean.shape[0]} (removidos: {df.shape[0] - df_clean.shape[0]})")

# =============================================================
# PASO 3: Crear target "bien_pagado"
# =============================================================
print("\n[PASO 3] Creando variable target 'bien_pagado'...")

# Definir columnas para agrupar salarios
grupo_cols = ["Trabajo de", "seniority"]

# Calcular salario promedio por grupo (Trabajo de + seniority)
df_clean["promedio_grupo"] = df_clean.groupby(grupo_cols)["sueldo_neto_en_dolares"].transform("mean")

# Crear target: 1 si gana >= promedio del grupo, 0 si gana menos
df_clean["bien_pagado"] = (df_clean["sueldo_neto_en_dolares"] >= df_clean["promedio_grupo"]).astype(int)

print("✓ Target creado:")
print(df_clean["bien_pagado"].value_counts())
print(f"  - Bien pagados (1): {(df_clean['bien_pagado'] == 1).sum()} ({(df_clean['bien_pagado'] == 1).sum() / len(df_clean) * 100:.1f}%)")
print(f"  - Mal pagados (0): {(df_clean['bien_pagado'] == 0).sum()} ({(df_clean['bien_pagado'] == 0).sum() / len(df_clean) * 100:.1f}%)")

# =============================================================
# PASO 4: Seleccionar features del Bloque 9
# =============================================================
print("\n[PASO 4] Seleccionando features del Bloque 9...")

# Features exactas del bloque 9 - usando nombres normalizados sin acentos
features_bloque9_orig = [
    "year", 
    "genero", 
    "tengo_edad", 
    "Dónde estás trabajando",
    "Años de experiencia", 
    "antiguedad_en_la_empresa_actual",
    "Años en el puesto actual", 
    "cuantas_personas_tenes_a_cargo",
    "Trabajo de",
    "dedicacion", 
    "recibis_algun_tipo_de_bono",
    "Cantidad de personas en tu organización",
    "Modalidad de trabajo",
    "Si trabajas bajo un esquema híbrido ¿Cuántos días a la semana vas a la oficina?",
    "que_tanto_estas_usando_copilotchatgpt_u_otras_herramientas_de_ia_para_tu_trabajo",
    "seniority"
]

# Mapeo de nombres originales a nombres normalizados
column_mapping = {
    "Dónde estás trabajando": "donde_estas_trabajando",
    "Años de experiencia": "anos_de_experiencia",
    "Años en el puesto actual": "anos_en_el_puesto_actual",
    "Trabajo de": "trabajo_de",
    "Cantidad de personas en tu organización": "cantidad_de_personas_en_tu_organizacion",
    "Modalidad de trabajo": "modalidad_de_trabajo",
    "Si trabajas bajo un esquema híbrido ¿Cuántos días a la semana vas a la oficina?": "dias_a_la_semana_vas_a_la_oficina",
    "que_tanto_estas_usando_copilotchatgpt_u_otras_herramientas_de_ia_para_tu_trabajo": "uso_de_ia_para_trabajo"
}

# Renombrar columnas en el dataframe
df_clean = df_clean.rename(columns=column_mapping)

# Usar nombres normalizados para features
features_bloque9 = [column_mapping.get(col, col) for col in features_bloque9_orig]

print(f"✓ Usando {len(features_bloque9)} features")
print(f"✓ Nombres normalizados (sin acentos)")

# =============================================================
# PASO 5: Preparar X (encoding de categorías)
# =============================================================
print("\n[PASO 5] Preparando features para entrenamiento...")

X = df_clean[features_bloque9].copy()
y = df_clean["bien_pagado"]

# Encoding: convertir categorías a números
label_encoders = {}
for col in features_bloque9:
    # Intentar convertir a numérico primero
    numeric_try = pd.to_numeric(X[col], errors="coerce")
    
    if numeric_try.notna().sum() > 0.05 * len(X):
        # Es numérica
        X[col] = numeric_try.fillna(0.0)
    else:
        # Es categórica, aplicar LabelEncoder
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str).fillna("MISSING"))
        label_encoders[col] = le

print(f"✓ Features preparadas: {X.shape[1]} columnas")
print(f"✓ Columnas categóricas encodificadas: {len(label_encoders)}")

# =============================================================
# PASO 6: Train/Test Split
# =============================================================
print("\n[PASO 6] Dividiendo datos en train/test...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print(f"✓ Train: {X_train.shape[0]} registros")
print(f"✓ Test: {X_test.shape[0]} registros")

# =============================================================
# PASO 7: Entrenar Random Forest
# =============================================================
print("\n[PASO 7] Entrenando Random Forest...")

rf_model = RandomForestClassifier(
    n_estimators=250,
    max_depth=None,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)

rf_model.fit(X_train, y_train)
print("✓ Modelo entrenado exitosamente")

# =============================================================
# PASO 8: Evaluar modelo
# =============================================================
print("\n[PASO 8] Evaluando modelo...")

y_pred = rf_model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

print(f"\n{'='*60}")
print("MÉTRICAS DEL MODELO")
print(f"{'='*60}")
print(f"Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1-Score:  {f1:.4f}")
print(f"{'='*60}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Mal Pagado", "Bien Pagado"]))

# =============================================================
# PASO 9: Feature Importance
# =============================================================
print("\n[PASO 9] Calculando importancia de features...")

feature_importance = pd.DataFrame({
    "feature": features_bloque9,
    "importance": rf_model.feature_importances_
}).sort_values("importance", ascending=False)

print("\nTop 10 features más importantes:")
print(feature_importance.head(10).to_string(index=False))

# =============================================================
# PASO 10: Guardar modelo y archivos
# =============================================================
print("\n[PASO 10] Guardando modelo y archivos...")

# Guardar modelo
model_path = Path("backend") / "seniority_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(rf_model, f)
print(f"✓ Modelo guardado: {model_path}")

# Guardar features
features_dict = {
    "features": features_bloque9,
    "numeric_features": [col for col in features_bloque9 if col not in label_encoders],
    "categorical_features": list(label_encoders.keys())
}

features_path = Path("backend") / "seniority_features.json"
with open(features_path, "w", encoding="utf-8") as f:
    json.dump(features_dict, f, indent=2, ensure_ascii=False)
print(f"✓ Features guardadas: {features_path}")

# Guardar análisis
analysis_dict = {
    "model_metrics": {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1)
    },
    "feature_importance": feature_importance.head(10).to_dict(orient="records"),
    "dataset_info": {
        "total_records": int(len(df_clean)),
        "total_rows": int(df_clean.shape[0]),
        "total_columns": int(df_clean.shape[1]),
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test))
    },
    "target_distribution": {
        "bien_pagado": int((df_clean['bien_pagado'] == 1).sum()),
        "mal_pagado": int((df_clean['bien_pagado'] == 0).sum())
    }
}

analysis_path = Path("backend") / "seniority_analysis.json"
with open(analysis_path, "w", encoding="utf-8") as f:
    json.dump(analysis_dict, f, indent=2, ensure_ascii=False)
print(f"✓ Análisis guardado: {analysis_path}")

# =============================================================
# PASO 11: Generar gráficas
# =============================================================
print("\n[PASO 11] Generando gráficas del modelo...")

# 1. Feature Importance
plt.figure(figsize=(12, 8))
top10 = feature_importance.head(10)
plt.barh(range(len(top10)), top10['importance'])
plt.yticks(range(len(top10)), top10['feature'])
plt.xlabel('Importancia')
plt.title('Top 10 Features más Importantes - Modelo Seniority')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig('frontend/seniority_feature_importance.png', dpi=100, bbox_inches='tight')
plt.close()
print("✓ Gráfica guardada: frontend/seniority_feature_importance.png")

# 2. Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['Mal Pagado', 'Bien Pagado'],
            yticklabels=['Mal Pagado', 'Bien Pagado'])
plt.title('Matriz de Confusión - Modelo Seniority')
plt.ylabel('Real')
plt.xlabel('Predicción')
plt.tight_layout()
plt.savefig('frontend/seniority_confusion_matrix.png', dpi=100, bbox_inches='tight')
plt.close()
print("✓ Gráfica guardada: frontend/seniority_confusion_matrix.png")

# 3. Métricas
metrics_names = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
metrics_values = [accuracy, precision, recall, f1]

plt.figure(figsize=(10, 6))
bars = plt.bar(metrics_names, metrics_values, color=['#2ecc71', '#3498db', '#e74c3c', '#f39c12'])
plt.ylim(0, 1)
plt.ylabel('Score')
plt.title('Métricas del Modelo - Seniority')
for i, (bar, value) in enumerate(zip(bars, metrics_values)):
    plt.text(bar.get_x() + bar.get_width()/2, value + 0.02, 
             f'{value:.3f}', ha='center', va='bottom', fontweight='bold')
plt.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.savefig('frontend/seniority_model_metrics.png', dpi=100, bbox_inches='tight')
plt.close()
print("✓ Gráfica guardada: frontend/seniority_model_metrics.png")

print("\n" + "="*60)
print("✅ PROCESO COMPLETADO EXITOSAMENTE")
print("="*60)
print("\nArchivos generados:")
print("  - backend/seniority_model.pkl")
print("  - backend/seniority_features.json")
print("  - backend/seniority_analysis.json")
print("  - frontend/seniority_feature_importance.png")
print("  - frontend/seniority_confusion_matrix.png")
print("  - frontend/seniority_model_metrics.png")
print("\nPuedes usar estos archivos para crear un endpoint diferente en el backend.")
