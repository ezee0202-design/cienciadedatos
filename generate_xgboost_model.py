"""
Script para crear modelo XGBoost prediciendo 'estas_buscando_trabajo'
Target: Búsqueda activa de trabajo (Sí vs No)
"""

import pandas as pd
import numpy as np
import re
import unicodedata
from pathlib import Path
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score,
    classification_report,
    confusion_matrix
)
from imblearn.over_sampling import SMOTE
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import json
import pickle
import warnings
warnings.filterwarnings('ignore')

# Verificar e instalar XGBoost si es necesario
try:
    import xgboost as xgb
except ImportError:
    print('Instalando XGBoost...')
    import subprocess
    import sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', 'xgboost'])
    import xgboost as xgb

# Verificar e instalar imbalanced-learn si es necesario
try:
    from imblearn.over_sampling import SMOTE
except ImportError:
    print('Instalando imbalanced-learn...')
    import subprocess
    import sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', 'imbalanced-learn'])
    from imblearn.over_sampling import SMOTE

print("="*60)
print("GENERACIÓN DE MODELO: XGBoost - Búsqueda de Trabajo")
print("="*60)

# =============================================================
# PASO 1: Cargar datos
# =============================================================
print("\n[PASO 1] Cargando database.csv...")

df = pd.read_csv("database.csv", dtype=object)
print(f"✓ Dataset cargado: {df.shape[0]} registros, {df.shape[1]} columnas")

# Normalizar columnas
def normalize_col(s: str) -> str:
    s = str(s).strip().lower()
    s = ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))
    return re.sub(r'[^0-9a-z]+', '_', s).strip('_')

df.columns = [normalize_col(c) for c in df.columns]

# =============================================================
# PASO 2: Preparar target
# =============================================================
print("\n[PASO 2] Preparando variable target 'estas_buscando_trabajo'...")

target_col = 'estas_buscando_trabajo'
if target_col not in df.columns:
    raise SystemExit(f"ERROR: No encontré columna '{target_col}'")

# Mapeo de respuestas
def map_buscando_trabajo(v):
    if pd.isna(v):
        return 'MISSING'
    s = str(v).strip().lower()
    if 'activamente' in s or 'buscando activamente' in s:
        return 'Si'
    if 'conforme' in s or 'ofertas' in s or 'escucho ofertas' in s:
        return 'No'
    return 'OTHER'

y = df[target_col].apply(map_buscando_trabajo)

print("✓ Distribución original:")
print(y.value_counts())

# Filtrar solo clases válidas (Si/No)
valid = ['Si', 'No']
mask = y.isin(valid)
df_clean = df[mask].reset_index(drop=True)
y_clean = y[mask].reset_index(drop=True)

print(f"\n✓ Después de filtrar:")
print(f"  - Total registros: {len(df_clean)}")
print(f"  - Sí (buscando): {(y_clean=='Si').sum()} ({(y_clean=='Si').sum()/len(y_clean)*100:.1f}%)")
print(f"  - No (conforme): {(y_clean=='No').sum()} ({(y_clean=='No').sum()/len(y_clean)*100:.1f}%)")

# =============================================================
# PASO 3: Seleccionar features
# =============================================================
print("\n[PASO 3] Seleccionando features...")

desired_features = [
    'tengo_edad',
    'anos_de_experiencia',
    'anos_en_el_puesto_actual',
    'cuantas_personas_tenes_a_cargo',
    'cantidad_de_personas_en_tu_organizacion',
    'trabajo_de',
    'sueldo_bruto_en_dolares',
    'estudios_estado',
    'dedicacion',
    'recibio_actualizacion_de_ingresos',
    'de_que_fue_el_ajuste_total_acumulado',
]

features_ok = [c for c in desired_features if c in df_clean.columns]
print(f"✓ Usando {len(features_ok)} features")

X = df_clean[features_ok].copy()

# =============================================================
# PASO 4: Encoding de features
# =============================================================
print("\n[PASO 4] Codificando features...")

label_encoders = {}

for c in X.columns:
    # Intentar convertir a numérico
    cleaned = X[c].astype(str).str.replace(r'[$€£%\s]', '', regex=True).str.replace(r',(?=\d{1,2}$)', '.', regex=True)
    coer = pd.to_numeric(cleaned, errors='coerce')
    
    if coer.notna().sum() >= max(10, int(0.02 * len(df_clean))):
        # Es numérica
        X[c] = coer.fillna(-1.0)
    else:
        # Es categórica, factorizar
        X[c] = pd.factorize(X[c].fillna('MISSING').astype(str))[0]
        label_encoders[c] = 'factorized'

print(f"✓ Features preparadas: {X.shape[1]} columnas")
print(f"✓ Columnas categóricas factorizadas: {len(label_encoders)}")

# Encode target
le_target = LabelEncoder()
y_enc = le_target.fit_transform(y_clean)

# =============================================================
# PASO 5: Train/Test Split
# =============================================================
print("\n[PASO 5] Dividiendo datos en train/test...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc,
    test_size=0.2,
    random_state=42,
    stratify=y_enc
)

print(f"✓ Train: {X_train.shape[0]} registros")
print(f"✓ Test: {X_test.shape[0]} registros")

# Calcular scale_pos_weight (ratio de clase mayoritaria / minoritaria)
n_neg = (y_train == 0).sum()  # Clase No
n_pos = (y_train == 1).sum()  # Clase Si
scale_pos_weight_base = n_neg / n_pos

# Aumentar el peso para mejorar recall de clase "Si"
# Multiplicamos por 1.5 para dar más importancia a detectar búsqueda activa
scale_pos_weight = scale_pos_weight_base * 1.5

print(f"\n⚖️ Balance de clases:")
print(f"  Clase No: {n_neg} ({n_neg/len(y_train)*100:.1f}%)")
print(f"  Clase Si: {n_pos} ({n_pos/len(y_train)*100:.1f}%)")
print(f"  Scale pos weight base: {scale_pos_weight_base:.2f}")
print(f"  Scale pos weight ajustado: {scale_pos_weight:.2f} (x1.5 para mejor recall)")

# =============================================================
# PASO 6: Entrenar XGBoost con GridSearch (SIN SMOTE, usando scale_pos_weight)
# =============================================================
print("\n[PASO 6] Entrenando XGBoost con GridSearchCV...")

xgb_base = xgb.XGBClassifier(
    random_state=42,
    n_jobs=-1,
    eval_metric='logloss',
    scale_pos_weight=scale_pos_weight  # Usar peso automático en lugar de SMOTE
)

param_grid = {
    'n_estimators': [200, 300],
    'max_depth': [4, 6],
    'learning_rate': [0.1],
    'subsample': [0.9],
    'colsample_bytree': [0.9]
}

grid_search = GridSearchCV(
    xgb_base,
    param_grid,
    cv=2,  # 2 folds como en Colab
    scoring='f1_weighted',
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train, y_train)  # Sin SMOTE, datos originales

print(f"\n✓ Mejores parámetros: {grid_search.best_params_}")
print(f"✓ F1 Score (CV): {grid_search.best_score_:.4f}")

xgb_model = grid_search.best_estimator_

# =============================================================
# PASO 7: Evaluar modelo
# =============================================================
print("\n[PASO 7] Evaluando modelo...")

y_pred = xgb_model.predict(X_test)

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
print(classification_report(y_test, y_pred, target_names=le_target.classes_))

# Mostrar matriz de confusión en consola
cm = confusion_matrix(y_test, y_pred)
print("\nMatriz de Confusión:")
print(f"                 Predicho No  Predicho Sí")
print(f"Real No          {cm[0,0]:>11}  {cm[0,1]:>11}")
print(f"Real Sí          {cm[1,0]:>11}  {cm[1,1]:>11}")

# =============================================================
# PASO 8: Feature Importance
# =============================================================
print("\n[PASO 8] Calculando importancia de features...")

feature_importance = pd.DataFrame({
    "feature": features_ok,
    "importance": xgb_model.feature_importances_
}).sort_values("importance", ascending=False)

print("\nTop 10 features más importantes:")
print(feature_importance.head(10).to_string(index=False))

# =============================================================
# PASO 9: Guardar modelo y archivos
# =============================================================
print("\n[PASO 9] Guardando modelo y archivos...")

# Guardar modelo
model_path = Path("backend") / "xgboost_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(xgb_model, f)
print(f"✓ Modelo guardado: {model_path}")

# Guardar features
features_dict = {
    "features": features_ok,
    "numeric_features": [c for c in features_ok if c not in label_encoders],
    "categorical_features": list(label_encoders.keys())
}

features_path = Path("backend") / "xgboost_features.json"
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
        "buscando_trabajo": int((y_clean == 'Si').sum()),
        "no_buscando": int((y_clean == 'No').sum())
    },
    "best_params": grid_search.best_params_,
    "balancing_technique": f"scale_pos_weight={scale_pos_weight:.2f}"
}

analysis_path = Path("backend") / "xgboost_analysis.json"
with open(analysis_path, "w", encoding="utf-8") as f:
    json.dump(analysis_dict, f, indent=2, ensure_ascii=False)
print(f"✓ Análisis guardado: {analysis_path}")

# =============================================================
# PASO 10: Generar gráficas
# =============================================================
print("\n[PASO 10] Generando gráficas del modelo...")

# 1. Feature Importance
plt.figure(figsize=(12, 8))
top10 = feature_importance.head(10)
plt.barh(range(len(top10)), top10['importance'])
plt.yticks(range(len(top10)), top10['feature'])
plt.xlabel('Importancia')
plt.title('Top 10 Features más Importantes - XGBoost Búsqueda de Trabajo')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig('frontend/xgboost_feature_importance.png', dpi=100, bbox_inches='tight')
plt.close()
print("✓ Gráfica guardada: frontend/xgboost_feature_importance.png")

# 2. Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=le_target.classes_,
            yticklabels=le_target.classes_)
plt.title('Matriz de Confusión - XGBoost Búsqueda de Trabajo')
plt.ylabel('Real')
plt.xlabel('Predicción')
plt.tight_layout()
plt.savefig('frontend/xgboost_confusion_matrix.png', dpi=100, bbox_inches='tight')
plt.close()
print("✓ Gráfica guardada: frontend/xgboost_confusion_matrix.png")

# 3. Métricas
metrics_names = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
metrics_values = [accuracy, precision, recall, f1]

plt.figure(figsize=(10, 6))
bars = plt.bar(metrics_names, metrics_values, color=['#2ecc71', '#3498db', '#e74c3c', '#f39c12'])
plt.ylim(0, 1)
plt.ylabel('Score')
plt.title('Métricas del Modelo - XGBoost Búsqueda de Trabajo')
for i, (bar, value) in enumerate(zip(bars, metrics_values)):
    plt.text(bar.get_x() + bar.get_width()/2, value + 0.02, 
             f'{value:.3f}', ha='center', va='bottom', fontweight='bold')
plt.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.savefig('frontend/xgboost_model_metrics.png', dpi=100, bbox_inches='tight')
plt.close()
print("✓ Gráfica guardada: frontend/xgboost_model_metrics.png")

print("\n" + "="*60)
print("✅ PROCESO COMPLETADO EXITOSAMENTE")
print("="*60)
print("\nArchivos generados:")
print("  - backend/xgboost_model.pkl")
print("  - backend/xgboost_features.json")
print("  - backend/xgboost_analysis.json")
print("  - frontend/xgboost_feature_importance.png")
print("  - frontend/xgboost_confusion_matrix.png")
print("  - frontend/xgboost_model_metrics.png")
print("\nPuedes usar estos archivos para el tercer modelo en el frontend.")
