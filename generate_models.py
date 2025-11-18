"""
Script para generar todos los modelos y archivos necesarios para el backend
Usa database.csv como fuente de datos
"""

import os, re, unicodedata
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import json
import matplotlib
matplotlib.use('Agg')  # Backend sin GUI
import matplotlib.pyplot as plt
import seaborn as sns

RANDOM_STATE = 42
N_ESTIMATORS = 150

print("="*80)
print("GENERANDO MODELOS Y ARCHIVOS PARA EL BACKEND")
print("="*80)

# Rutas
ROOT_DIR = Path(__file__).parent
DATA_PATH = ROOT_DIR / "database.csv"
BACKEND_DIR = ROOT_DIR / "backend"

print(f"\n📂 Directorio raíz: {ROOT_DIR}")
print(f"📂 Directorio backend: {BACKEND_DIR}")
print(f"📄 Archivo de datos: {DATA_PATH}")

# Verificar que existe database.csv
if not DATA_PATH.exists():
    print(f"\n❌ ERROR: No se encontró {DATA_PATH}")
    exit(1)

# Cargar datos
print(f"\n📊 Cargando datos...")
df = pd.read_csv(DATA_PATH, encoding="utf-8-sig", dtype=object)
print(f"✓ Datos cargados: {df.shape[0]} filas, {df.shape[1]} columnas")

# Normalizar nombres de columnas
def normalize_col(s: str) -> str:
    """Normaliza nombres de columnas quitando acentos y caracteres especiales"""
    s = str(s) if s is not None else ""
    s = s.strip().lower()
    s = ''.join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
    s = re.sub(r"[^0-9a-z]+", "_", s)
    return s.strip("_")

df.columns = [normalize_col(c) for c in df.columns]

print("\n📋 Columnas disponibles:")
for i, col in enumerate(df.columns[:10], 1):
    print(f"  {i}. {col}")
print(f"  ... y {len(df.columns) - 10} más")

# =============================================================================
# PASO 1: Preparar el target (satisfacción con ingresos)
# =============================================================================
print("\n" + "="*80)
print("PASO 1: PREPARAR TARGET - SATISFACCIÓN CON INGRESOS")
print("="*80)

target_col = "que_tan_conforme_estas_con_tus_ingresos_laborales"
if target_col not in df.columns:
    print(f"\n❌ ERROR: No encontré columna '{target_col}'")
    print("\nColumnas que contienen 'conforme' o 'ingreso':")
    matching = [c for c in df.columns if 'conforme' in c or 'ingreso' in c]
    for c in matching:
        print(f"  • {c}")
    exit(1)

y_raw = df[target_col].fillna("MISSING")

def map_conformidad(v):
    """Mapea respuesta a: 1_2 (mal pago) o 3_4 (bien pago)"""
    s = str(v).strip()
    m = re.search(r"([1-4])", s)
    if not m:
        return "OTHER"
    n = int(m.group(1))
    return "1_2" if n in (1,2) else "3_4"

y = y_raw.apply(map_conformidad)

print("\n📊 Distribución del target:")
print(y.value_counts())
print(f"\n  • '1_2' = Mal pago / Insatisfecho (valores 1-2)")
print(f"  • '3_4' = Bien pago / Satisfecho (valores 3-4)")

# Codificar target
le = LabelEncoder()
y_enc = le.fit_transform(y)

# =============================================================================
# PASO 2: Seleccionar y preparar features (igual que bloque 5)
# =============================================================================
print("\n" + "="*80)
print("PASO 2: SELECCIONAR FEATURES")
print("="*80)

# Features deseadas (del bloque 5)
desired_features = [
    'tengo_edad',
    'anos_de_experiencia',
    'anos_en_el_puesto_actual',
    'cuantas_personas_tenes_a_cargo',
    'cantidad_de_personas_en_tu_organizacion',
    'trabajo_de',
    'sueldo_bruto_en_dolares',
    'dedicacion',
    'recibio_actualizacion_de_ingresos',
    'de_que_fue_el_ajuste_total_acumulado',
]

# Verificar cuáles existen
features_ok = sorted(set(c for c in desired_features if c in df.columns))
missing_features = [f for f in desired_features if f not in df.columns]

if missing_features:
    print(f"\n⚠️ Advertencia: Faltan features:")
    for f in missing_features:
        print(f"  • {f}")

print(f"\n✓ Usando {len(features_ok)} features:")
for f in features_ok:
    print(f"  • {f}")

# Preparar dataframe de features
X = df[features_ok].copy()

# Detectar numéricas vs categóricas
def is_numeric(col: pd.Series) -> bool:
    """Detecta si una columna es numérica"""
    cleaned = col.astype(str).str.replace(r"[\$€£\s]", "", regex=True).str.replace(r",(?=\d{1,2}$)", ".", regex=True)
    numeric_try = pd.to_numeric(cleaned, errors="coerce")
    return numeric_try.notna().mean() >= 0.30

numeric_cols = [c for c in features_ok if is_numeric(X[c])]
categorical_cols = [c for c in features_ok if c not in numeric_cols]

print(f"\n  • Numéricas: {len(numeric_cols)} → {numeric_cols}")
print(f"  • Categóricas: {len(categorical_cols)} → {categorical_cols}")

print(f"\n✓ Datos preparados: {X.shape}")
print(f"✓ Target preparado: {len(y_enc)} registros")

# =============================================================================
# PASO 3: Entrenar modelo Random Forest con Pipeline
# =============================================================================
print("\n" + "="*80)
print("PASO 3: ENTRENAR RANDOM FOREST CON PIPELINE")
print("="*80)

# Crear pipeline de preprocesamiento
preprocess = ColumnTransformer(
    transformers=[
        ("num", "passthrough", numeric_cols),
        ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), categorical_cols),
    ],
    remainder="drop",
    sparse_threshold=0
)

# Pipeline completo
pipeline = Pipeline(steps=[
    ("prep", preprocess),
    ("rf", RandomForestClassifier(n_estimators=N_ESTIMATORS, max_depth=10, random_state=RANDOM_STATE, n_jobs=-1))
])

# Split train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=RANDOM_STATE, stratify=y_enc
)

print(f"\n📊 División de datos:")
print(f"  • Train: {len(X_train)} registros")
print(f"  • Test: {len(X_test)} registros")

# Entrenar modelo
print(f"\n🤖 Entrenando Random Forest ({N_ESTIMATORS} estimadores)...")
pipeline.fit(X_train, y_train)
print("✓ Modelo entrenado")

# Evaluar
y_pred = pipeline.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n📈 Métricas del modelo:")
print(f"  • Accuracy: {accuracy:.3f}")
print(f"\n📊 Reporte de clasificación:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# =============================================================================
# PASO 4: Guardar modelo y archivos de configuración
# =============================================================================
print("\n" + "="*80)
print("PASO 4: GUARDAR ARCHIVOS")
print("="*80)

# Crear directorio backend si no existe
BACKEND_DIR.mkdir(exist_ok=True)

# 1. Guardar modelo (pipeline completo)
model_path = BACKEND_DIR / "random_forest_model.pkl"
import pickle
with open(model_path, 'wb') as f:
    pickle.dump(pipeline, f, protocol=4)
print(f"\n✓ Modelo guardado: {model_path}")

# 2. Guardar lista de features (nombres originales, en orden)
features_path = BACKEND_DIR / "features.json"
features_data = {
    "features": features_ok,  # Mantener el orden
    "n_features": len(features_ok),
    "numeric_features": numeric_cols,
    "categorical_features": categorical_cols
}
with open(features_path, 'w', encoding='utf-8') as f:
    json.dump(features_data, f, indent=2, ensure_ascii=False)
print(f"✓ Features guardadas: {features_path}")

# 3. Crear analysis_results.json con métricas y estadísticas
print(f"\n📊 Calculando estadísticas del dataset...")

# Calcular métricas adicionales
from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

# Feature importance del Random Forest
rf_model = pipeline.named_steps["rf"]
feat_order = numeric_cols + categorical_cols  # Orden después del preprocesamiento
feature_importance = sorted(
    zip(feat_order, rf_model.feature_importances_),
    key=lambda x: x[1],
    reverse=True
)

# Distribución del target
target_dist = y.value_counts().to_dict()

# Estadísticas del dataset
dataset_stats = {
    "total_records": len(df),
    "total_rows": len(df),
    "total_columns": len(df.columns),
    "n_features": len(features_ok),
    "train_size": len(X_train),
    "test_size": len(X_test)
}

# Crear analysis_results
analysis_results = {
    "model_metrics": {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "n_estimators": N_ESTIMATORS,
        "max_depth": 10,
        "random_state": RANDOM_STATE
    },
    "feature_importance": [
        {"feature": feat, "importance": float(imp)}
        for feat, imp in feature_importance
    ],
    "dataset_info": dataset_stats,
    "seniority_distribution": target_dist,
    "target_variable": target_col,
    "target_classes": {
        "1_2": "Mal pago / Insatisfecho (valores 1-2)",
        "3_4": "Bien pago / Satisfecho (valores 3-4)"
    }
}

results_path = BACKEND_DIR / "analysis_results.json"
with open(results_path, 'w', encoding='utf-8') as f:
    json.dump(analysis_results, f, indent=2, ensure_ascii=False)
print(f"✓ Resultados guardados: {results_path}")

# =============================================================================
# PASO 5: Generar gráficas de EDA (Análisis Exploratorio)
# =============================================================================
print("\n" + "="*80)
print("PASO 5: GENERAR GRÁFICAS DE EDA")
print("="*80)

FRONTEND_DIR = ROOT_DIR / "frontend"
FRONTEND_DIR.mkdir(exist_ok=True)

# Configurar estilo
sns.set_style("whitegrid")
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = 'white'

# EDA 1: Distribuciones de variables clave
print("\n📊 Generando gráfica de Distribuciones...")
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Distribuciones de Variables Clave', fontsize=16, fontweight='bold')

# Género
if 'genero' in df.columns:
    genero_counts = df['genero'].value_counts()
    axes[0, 0].bar(range(len(genero_counts)), genero_counts.values, color='skyblue', edgecolor='black')
    axes[0, 0].set_xticks(range(len(genero_counts)))
    axes[0, 0].set_xticklabels(genero_counts.index, rotation=45, ha='right')
    axes[0, 0].set_title('Distribución por Género', fontweight='bold')
    axes[0, 0].set_ylabel('Cantidad')
    for i, v in enumerate(genero_counts.values):
        axes[0, 0].text(i, v + max(genero_counts.values)*0.01, str(v), ha='center', va='bottom')

# Dedicación
if 'dedicacion' in df.columns:
    dedicacion_counts = df['dedicacion'].value_counts()
    axes[0, 1].bar(range(len(dedicacion_counts)), dedicacion_counts.values, color='lightcoral', edgecolor='black')
    axes[0, 1].set_xticks(range(len(dedicacion_counts)))
    axes[0, 1].set_xticklabels(dedicacion_counts.index, rotation=45, ha='right')
    axes[0, 1].set_title('Distribución por Dedicación', fontweight='bold')
    axes[0, 1].set_ylabel('Cantidad')
    for i, v in enumerate(dedicacion_counts.values):
        axes[0, 1].text(i, v + max(dedicacion_counts.values)*0.01, str(v), ha='center', va='bottom')

# Satisfacción con ingresos
target_counts = y.value_counts()
colors_target = ['#e74c3c', '#2ecc71']
axes[1, 0].bar(range(len(target_counts)), target_counts.values, color=colors_target, edgecolor='black')
axes[1, 0].set_xticks(range(len(target_counts)))
axes[1, 0].set_xticklabels(['Mal Pago (1-2)', 'Bien Pago (3-4)'], rotation=0)
axes[1, 0].set_title('Distribución: Satisfacción con Ingresos', fontweight='bold')
axes[1, 0].set_ylabel('Cantidad')
for i, v in enumerate(target_counts.values):
    axes[1, 0].text(i, v + max(target_counts.values)*0.01, str(v), ha='center', va='bottom')

# Edad
if 'tengo_edad' in df.columns:
    edad_numeric = pd.to_numeric(df['tengo_edad'], errors='coerce').dropna()
    axes[1, 1].hist(edad_numeric, bins=20, color='mediumpurple', edgecolor='black', alpha=0.7)
    axes[1, 1].set_title('Distribución de Edad', fontweight='bold')
    axes[1, 1].set_xlabel('Edad')
    axes[1, 1].set_ylabel('Frecuencia')
    axes[1, 1].axvline(edad_numeric.median(), color='red', linestyle='--', linewidth=2, label=f'Mediana: {edad_numeric.median():.0f}')
    axes[1, 1].legend()

plt.tight_layout()
distributions_path = FRONTEND_DIR / "distributions.png"
plt.savefig(distributions_path, dpi=100, bbox_inches='tight')
plt.close()
print(f"✓ Gráfica guardada: {distributions_path}")

# EDA 2: Matriz de Correlación
print("\n📊 Generando Matriz de Correlación...")
# Seleccionar solo columnas numéricas del dataset completo
numeric_cols_all = []
for col in df.columns:
    try:
        numeric_data = pd.to_numeric(df[col], errors='coerce')
        if numeric_data.notna().sum() > 100:  # Al menos 100 valores válidos
            numeric_cols_all.append(col)
    except:
        pass

if len(numeric_cols_all) > 1:
    df_numeric = df[numeric_cols_all].apply(pd.to_numeric, errors='coerce')
    correlation_matrix = df_numeric.corr()
    
    # Limitar a top 15 variables para que sea legible
    top_n_corr = min(15, len(correlation_matrix))
    
    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(correlation_matrix.iloc[:top_n_corr, :top_n_corr], 
                annot=True, fmt='.2f', cmap='coolwarm', center=0,
                square=True, linewidths=1, cbar_kws={"shrink": 0.8},
                ax=ax)
    ax.set_title('Matriz de Correlación - Variables Numéricas', fontsize=14, fontweight='bold')
    plt.tight_layout()
    correlation_path = FRONTEND_DIR / "correlation_matrix.png"
    plt.savefig(correlation_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"✓ Gráfica guardada: {correlation_path}")
else:
    print("⚠️ No hay suficientes columnas numéricas para matriz de correlación")

# EDA 3: Valores Faltantes
print("\n📊 Generando gráfica de Valores Faltantes...")
missing_data = df.isnull().sum()
missing_percent = (missing_data / len(df)) * 100
missing_df = pd.DataFrame({
    'Columna': missing_data.index,
    'Valores_Faltantes': missing_data.values,
    'Porcentaje': missing_percent.values
})
missing_df = missing_df[missing_df['Valores_Faltantes'] > 0].sort_values('Porcentaje', ascending=True)

if len(missing_df) > 0:
    # Limitar a top 20 para legibilidad
    top_missing = missing_df.tail(20)
    
    fig, ax = plt.subplots(figsize=(10, max(6, len(top_missing) * 0.3)))
    colors = plt.cm.YlOrRd(top_missing['Porcentaje'] / 100)
    bars = ax.barh(range(len(top_missing)), top_missing['Porcentaje'], color=colors, edgecolor='black')
    ax.set_yticks(range(len(top_missing)))
    ax.set_yticklabels(top_missing['Columna'])
    ax.set_xlabel('Porcentaje de Valores Faltantes (%)', fontsize=12)
    ax.set_title('Top 20 Columnas con Valores Faltantes', fontsize=14, fontweight='bold')
    ax.axvline(x=50, color='red', linestyle='--', alpha=0.5, label='50%')
    ax.legend()
    
    # Agregar valores
    for i, (bar, val) in enumerate(zip(bars, top_missing['Porcentaje'])):
        ax.text(val + 1, i, f'{val:.1f}%', va='center', fontsize=9)
    
    plt.tight_layout()
    missing_path = FRONTEND_DIR / "missing_values.png"
    plt.savefig(missing_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"✓ Gráfica guardada: {missing_path}")
else:
    print("✓ No hay valores faltantes en el dataset")

# =============================================================================
# PASO 6: Generar gráficas del modelo
# =============================================================================
print("\n" + "="*80)
print("PASO 6: GENERAR GRÁFICAS DEL MODELO")
print("="*80)

# 1. Feature Importance
print("\n📊 Generando gráfica de Feature Importance...")
fig, ax = plt.subplots(figsize=(10, 6))
top_n = min(10, len(feature_importance))
top_features = feature_importance[:top_n]
features_names = [f[0] for f in top_features]
importances = [f[1] for f in top_features]

colors = sns.color_palette("viridis", top_n)
bars = ax.barh(range(top_n), importances, color=colors)
ax.set_yticks(range(top_n))
ax.set_yticklabels(features_names)
ax.set_xlabel('Importancia', fontsize=12)
ax.set_title('Top Features - Importancia en Random Forest', fontsize=14, fontweight='bold')
ax.invert_yaxis()

# Agregar valores en las barras
for i, (bar, val) in enumerate(zip(bars, importances)):
    ax.text(val, i, f' {val:.3f}', va='center', fontsize=10)

plt.tight_layout()
feature_imp_path = FRONTEND_DIR / "feature_importance.png"
plt.savefig(feature_imp_path, dpi=100, bbox_inches='tight')
plt.close()
print(f"✓ Gráfica guardada: {feature_imp_path}")

# 2. Matriz de Confusión
print("\n📊 Generando Matriz de Confusión...")
cm = confusion_matrix(y_test, y_pred)
fig, ax = plt.subplots(figsize=(8, 6))

sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=le.classes_, 
            yticklabels=le.classes_,
            cbar_kws={'label': 'Cantidad'},
            ax=ax)

ax.set_xlabel('Predicción', fontsize=12)
ax.set_ylabel('Real', fontsize=12)
ax.set_title('Matriz de Confusión', fontsize=14, fontweight='bold')

# Agregar porcentajes
for i in range(len(cm)):
    for j in range(len(cm)):
        percentage = cm[i, j] / cm[i].sum() * 100
        ax.text(j + 0.5, i + 0.7, f'({percentage:.1f}%)', 
                ha='center', va='center', fontsize=9, color='gray')

plt.tight_layout()
confusion_path = FRONTEND_DIR / "confusion_matrix.png"
plt.savefig(confusion_path, dpi=100, bbox_inches='tight')
plt.close()
print(f"✓ Gráfica guardada: {confusion_path}")

# 3. Métricas de Evaluación
print("\n📊 Generando gráfica de Métricas...")
from sklearn.metrics import precision_score, recall_score, f1_score

# Calcular métricas
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

metrics_data = {
    'Accuracy': accuracy,
    'Precision': precision,
    'Recall': recall,
    'F1-Score': f1
}

fig, ax = plt.subplots(figsize=(10, 6))
metrics_names = list(metrics_data.keys())
metrics_values = list(metrics_data.values())

colors = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12']
bars = ax.bar(metrics_names, metrics_values, color=colors, alpha=0.8, edgecolor='black', linewidth=1.5)

ax.set_ylim(0, 1.0)
ax.set_ylabel('Score', fontsize=12)
ax.set_title('Métricas de Evaluación del Modelo', fontsize=14, fontweight='bold')
ax.axhline(y=0.5, color='gray', linestyle='--', alpha=0.5, label='Baseline (0.5)')
ax.grid(axis='y', alpha=0.3)
ax.legend()

# Agregar valores sobre las barras
for bar, val in zip(bars, metrics_values):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height + 0.02,
            f'{val:.3f}\n({val*100:.1f}%)',
            ha='center', va='bottom', fontsize=11, fontweight='bold')

plt.tight_layout()
metrics_path = FRONTEND_DIR / "model_metrics.png"
plt.savefig(metrics_path, dpi=100, bbox_inches='tight')
plt.close()
print(f"✓ Gráfica guardada: {metrics_path}")

# =============================================================================
# RESUMEN FINAL
# =============================================================================
print("\n" + "="*80)
print("✅ GENERACIÓN COMPLETADA")
print("="*80)

print(f"\n📁 Archivos generados en {BACKEND_DIR}:")
print(f"  1. random_forest_model.pkl - Modelo entrenado (Pipeline)")
print(f"  2. features.json - Lista de features")
print(f"  3. analysis_results.json - Métricas y estadísticas")

print(f"\n📊 Gráficas de EDA generadas en {FRONTEND_DIR}:")
print(f"  1. distributions.png - Distribuciones de variables")
print(f"  2. correlation_matrix.png - Matriz de correlación")
print(f"  3. missing_values.png - Valores faltantes")

print(f"\n📊 Gráficas del modelo generadas en {FRONTEND_DIR}:")
print(f"  4. feature_importance.png - Importancia de features")
print(f"  5. confusion_matrix.png - Matriz de confusión")
print(f"  6. model_metrics.png - Métricas de evaluación")

print(f"\n📊 Resumen del modelo:")
print(f"  • Tipo: Random Forest Classifier con Pipeline")
print(f"  • Accuracy: {accuracy:.3f}")
print(f"  • Features: {len(features_ok)} ({len(numeric_cols)} numéricas, {len(categorical_cols)} categóricas)")
print(f"  • Clases: {list(le.classes_)}")

print(f"\n🎯 Top 5 features más importantes:")
for i, (feat, imp) in enumerate(feature_importance[:5], 1):
    print(f"  {i}. {feat}: {imp:.3f}")

print("\n✅ Ahora puedes iniciar el backend:")
print("   cd backend && python app.py")
print("\n✅ Y el frontend:")
print("   cd frontend && python server.py")
print("\n🌐 Accede a: http://localhost:8080")
print("="*80)

