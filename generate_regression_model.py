"""
Script para crear modelo de Regresión Lineal prediciendo 'sueldo_neto_en_dolares'
Usando Ridge Regression con feature engineering avanzado
"""

import pandas as pd
import numpy as np
import re
import unicodedata
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import json
import pickle
import warnings
warnings.filterwarnings('ignore')

print("="*60)
print("GENERACIÓN DE MODELO: Regresión de Sueldo (USD)")
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
print("\n[PASO 2] Preparando target 'sueldo_neto_en_dolares'...")

target_col = 'sueldo_neto_en_dolares'
if target_col not in df.columns:
    raise SystemExit(f"ERROR: No encontré columna '{target_col}'")

# Convertir a numérico
df[target_col] = pd.to_numeric(
    df[target_col].astype(str).str.replace(r'[$€£\s,]', '', regex=True),
    errors='coerce'
)

# Filtrar outliers razonables (100 - 15000 USD)
min_sueldo = 100
max_sueldo = 15000

df_clean = df[
    (df[target_col] >= min_sueldo) &
    (df[target_col] <= max_sueldo) &
    (df[target_col].notna())
].copy()

print(f"✓ Registros válidos: {len(df_clean)} (removidos: {len(df) - len(df_clean)})")
print(f"  - Min: ${df_clean[target_col].min():.2f}")
print(f"  - Max: ${df_clean[target_col].max():.2f}")
print(f"  - Media: ${df_clean[target_col].mean():.2f}")
print(f"  - Mediana: ${df_clean[target_col].median():.2f}")

y = df_clean[target_col]

# =============================================================
# PASO 3: Seleccionar features
# =============================================================
print("\n[PASO 3] Seleccionando features...")

desired_features = [
    'anos_de_experiencia',
    'antiguedad_en_la_empresa_actual',
    'anos_en_el_puesto_actual',
    'cuantas_personas_tenes_a_cargo',
    'trabajo_de',
    'seniority',
    'dedicacion',
    'donde_estas_trabajando',
    'modalidad_de_trabajo',
    'cantidad_de_personas_en_tu_organizacion',
    'estudios_estado',
    'recibis_algun_tipo_de_bono',
    'tengo_edad',
    'genero',
    'que_tanto_estas_usando_copilotchatgpt_u_otras_herramientas_de_ia_para_tu_trabajo',
]

features_ok = [c for c in desired_features if c in df_clean.columns]
print(f"✓ Usando {len(features_ok)} features base")

X = df_clean[features_ok].copy()

# =============================================================
# PASO 4: Encoding y Feature Engineering
# =============================================================
print("\n[PASO 4] Feature Engineering...")

# Convertir columnas a numéricas o categóricas
for c in X.columns:
    # Intentar convertir a numérico
    cleaned = X[c].astype(str).str.replace(r'[$€£%\s,]', '', regex=True)
    coer = pd.to_numeric(cleaned, errors='coerce')
    
    if coer.notna().sum() >= max(10, int(0.02 * len(df_clean))):
        # Es numérica
        X[c] = coer.fillna(coer.median())
    else:
        # Es categórica, factorizar
        X[c] = pd.factorize(X[c].fillna('MISSING').astype(str))[0]

# Feature Engineering Avanzado
print("  Creando features derivadas...")

# 1. Ratios importantes
if 'anos_de_experiencia' in X.columns and 'tengo_edad' in X.columns:
    X['ratio_exp_edad'] = X['anos_de_experiencia'] / (X['tengo_edad'] + 1)

if 'anos_en_el_puesto_actual' in X.columns and 'anos_de_experiencia' in X.columns:
    X['ratio_puesto_exp'] = X['anos_en_el_puesto_actual'] / (X['anos_de_experiencia'] + 1)

if 'antiguedad_en_la_empresa_actual' in X.columns and 'anos_de_experiencia' in X.columns:
    X['ratio_antiguedad_exp'] = X['antiguedad_en_la_empresa_actual'] / (X['anos_de_experiencia'] + 1)

# 2. Indicadores de seniority
if 'seniority' in X.columns:
    # Crear dummies para seniority
    seniority_values = df_clean['seniority'].fillna('MISSING')
    X['es_senior'] = (seniority_values.str.contains('Senior|Lead|Principal', case=False, na=False)).astype(int)
    X['es_junior'] = (seniority_values.str.contains('Junior|Jr', case=False, na=False)).astype(int)

# 3. Indicadores de rol
if 'trabajo_de' in X.columns:
    trabajo_values = df_clean['trabajo_de'].fillna('MISSING')
    X['es_manager'] = (trabajo_values.str.contains('Manager|Lead|Director', case=False, na=False)).astype(int)
    X['es_developer'] = (trabajo_values.str.contains('Developer|Engineer|Programador', case=False, na=False)).astype(int)

# 4. Experiencia²  (relación no lineal)
if 'anos_de_experiencia' in X.columns:
    X['exp_squared'] = X['anos_de_experiencia'] ** 2

# 5. Edad² (relación no lineal)
if 'tengo_edad' in X.columns:
    X['edad_squared'] = X['tengo_edad'] ** 2

print(f"✓ Features finales: {X.shape[1]} columnas")

# =============================================================
# PASO 5: Train/Test Split
# =============================================================
print("\n[PASO 5] Dividiendo datos en train/test...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

print(f"✓ Train: {X_train.shape[0]} registros")
print(f"✓ Test: {X_test.shape[0]} registros")

# =============================================================
# PASO 6: Escalar features
# =============================================================
print("\n[PASO 6] Escalando features...")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# =============================================================
# PASO 7: Entrenar modelo de Regresión Lineal (Ridge)
# =============================================================
print("\n[PASO 7] Entrenando modelo de Regresión Lineal (Ridge)...")

# Usar Ridge (Regresión Lineal regularizada)
model = Ridge(alpha=10.0, random_state=42)
name = 'Ridge'

print(f"  Modelo: {name}")
print(f"  Parámetro alpha: {model.alpha}")

# Entrenar con datos escalados
model.fit(X_train_scaled, y_train)
y_pred = model.predict(X_test_scaled)
y_train_pred = model.predict(X_train_scaled)

# Métricas
r2_train = r2_score(y_train, y_train_pred)
r2_test = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

results = {
    name: {
        'r2_train': r2_train,
        'r2_test': r2_test,
        'rmse': rmse,
        'mae': mae,
        'mape': mape
    }
}

print(f"\n{'='*60}")
print(f"RESULTADOS - REGRESIÓN LINEAL")
print(f"{'='*60}")
print(f"  R² Train: {r2_train:.4f}")
print(f"  R² Test: {r2_test:.4f} (explica {r2_test*100:.1f}% de la varianza)")
print(f"  RMSE: ${rmse:.2f}")
print(f"  MAE: ${mae:.2f}")
print(f"  MAPE: {mape:.2f}%")

best_model = (name, model)
best_r2 = r2_test

# =============================================================
# PASO 8: Evaluar modelo y analizar coeficientes
# =============================================================
print("\n[PASO 8] Análisis de coeficientes de Regresión Lineal...")

name, model = best_model

# Predicción final
y_pred = model.predict(X_test_scaled)

r2 = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

print(f"\nMétricas finales:")
print(f"  R² Score: {r2:.4f} (explica {r2*100:.1f}% de la varianza)")
print(f"  RMSE: ${rmse:.2f}")
print(f"  MAE: ${mae:.2f}")
print(f"  MAPE: {mape:.2f}%")

# Analizar coeficientes (importancia de features en regresión lineal)
coefficients = pd.DataFrame({
    "feature": X.columns,
    "coefficient": model.coef_
}).sort_values("coefficient", key=abs, ascending=False)

print("\nTop 10 coeficientes más influyentes:")
for idx, row in coefficients.head(10).iterrows():
    sign = "+" if row['coefficient'] > 0 else ""
    print(f"  {row['feature']:<40} {sign}{row['coefficient']:>10.2f}")

feature_importance = coefficients  # Para guardar después

# =============================================================
# PASO 9: Guardar modelo y archivos
# =============================================================
print("\n[PASO 9] Guardando modelo y archivos...")

# Guardar modelo
model_path = Path("backend") / "regression_salary_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(model, f)
print(f"✓ Modelo guardado: {model_path}")

# Guardar scaler
scaler_path = Path("backend") / "regression_salary_scaler.pkl"
with open(scaler_path, "wb") as f:
    pickle.dump(scaler, f)
print(f"✓ Scaler guardado: {scaler_path}")

# Guardar features
features_dict = {
    "features": list(X.columns),
    "feature_names": list(features_ok),
    "model_type": name,
    "uses_scaling": name == 'Ridge'
}

features_path = Path("backend") / "regression_salary_features.json"
with open(features_path, "w", encoding="utf-8") as f:
    json.dump(features_dict, f, indent=2, ensure_ascii=False)
print(f"✓ Features guardadas: {features_path}")

# Guardar análisis
analysis_dict = {
    "model_metrics": {
        "r2_score": float(r2),
        "rmse": float(rmse),
        "mae": float(mae),
        "mape": float(mape)
    },
    "model_comparison": {
        "Ridge": {
            "r2_test": float(results['Ridge']['r2_test']),
            "rmse": float(results['Ridge']['rmse']),
            "mae": float(results['Ridge']['mae'])
        }
    },
    "dataset_info": {
        "total_records": int(len(df_clean)),
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "salary_range": {
            "min": float(y.min()),
            "max": float(y.max()),
            "mean": float(y.mean()),
            "median": float(y.median())
        }
    },
    "best_model": name
}

# Guardar coeficientes de la regresión lineal
analysis_dict["coefficients"] = coefficients.head(20).to_dict(orient="records")

analysis_path = Path("backend") / "regression_salary_analysis.json"
with open(analysis_path, "w", encoding="utf-8") as f:
    json.dump(analysis_dict, f, indent=2, ensure_ascii=False)
print(f"✓ Análisis guardado: {analysis_path}")

# =============================================================
# PASO 10: Generar gráficas
# =============================================================
print("\n[PASO 10] Generando gráficas...")

try:
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # 1. Predicho vs Real
    axes[0, 0].scatter(y_test, y_pred, alpha=0.5, s=20)
    axes[0, 0].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
    axes[0, 0].set_xlabel('Sueldo Real (USD)')
    axes[0, 0].set_ylabel('Sueldo Predicho (USD)')
    axes[0, 0].set_title(f'Predicho vs Real - {name}\nR² = {r2:.4f}')
    axes[0, 0].grid(alpha=0.3)

    # 2. Residuos
    residuals = y_test - y_pred
    axes[0, 1].scatter(y_pred, residuals, alpha=0.5, s=20)
    axes[0, 1].axhline(y=0, color='r', linestyle='--', lw=2)
    axes[0, 1].set_xlabel('Sueldo Predicho (USD)')
    axes[0, 1].set_ylabel('Residuos (USD)')
    axes[0, 1].set_title('Análisis de Residuos')
    axes[0, 1].grid(alpha=0.3)

    # 3. Distribución de errores
    axes[1, 0].hist(residuals, bins=50, edgecolor='black', alpha=0.7)
    axes[1, 0].axvline(x=0, color='r', linestyle='--', lw=2)
    axes[1, 0].set_xlabel('Error (USD)')
    axes[1, 0].set_ylabel('Frecuencia')
    axes[1, 0].set_title('Distribución de Errores')
    axes[1, 0].grid(alpha=0.3)

    # 4. Métricas comparativas
    model_names = ['Ridge']
    r2_scores = [results['Ridge']['r2_test']]

    axes[1, 1].bar(model_names, r2_scores, color=['#2ecc71'])
    axes[1, 1].set_ylabel('R² Score')
    axes[1, 1].set_title('Modelo: Regresión Lineal (Ridge)')
    axes[1, 1].set_ylim(0, 1)
    axes[1, 1].grid(axis='y', alpha=0.3)

    # Añadir valor en la barra
    axes[1, 1].text(0, r2_scores[0] + 0.02, f'{r2_scores[0]:.3f}', ha='center', va='bottom', fontweight='bold')

    plt.tight_layout()
    
    # Asegurar que el directorio existe
    Path('frontend').mkdir(exist_ok=True)
    plt.savefig('frontend/regression_salary_analysis.png', dpi=100, bbox_inches='tight')
    plt.close('all')
    print("✓ Gráfica guardada: frontend/regression_salary_analysis.png")
except Exception as e:
    print(f"⚠️ Error al generar gráfica principal: {e}")
    plt.close('all')

# Gráfica de coeficientes (específica para regresión lineal)
try:
    plt.figure(figsize=(10, 8))
    top_coefs = coefficients.head(15)
    colors = ['green' if c > 0 else 'red' for c in top_coefs['coefficient']]
    plt.barh(range(len(top_coefs)), top_coefs['coefficient'], color=colors, alpha=0.7)
    plt.yticks(range(len(top_coefs)), top_coefs['feature'])
    plt.xlabel('Coeficiente (impacto en USD)')
    plt.title('Top 15 Coeficientes - Regresión Lineal')
    plt.axvline(x=0, color='black', linestyle='--', linewidth=0.8)
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig('frontend/regression_salary_coefficients.png', dpi=100, bbox_inches='tight')
    plt.close('all')
    print("✓ Gráfica guardada: frontend/regression_salary_coefficients.png")
except Exception as e:
    print(f"⚠️ Error al generar gráfica de coeficientes: {e}")
    plt.close('all')

print("\n" + "="*60)
print("✅ PROCESO COMPLETADO EXITOSAMENTE")
print("="*60)
print("\nArchivos generados:")
print("  - backend/regression_salary_model.pkl")
print("  - backend/regression_salary_scaler.pkl")
print("  - backend/regression_salary_features.json")
print("  - backend/regression_salary_analysis.json")
print("  - frontend/regression_salary_analysis.png")
print("  - frontend/regression_salary_coefficients.png")
print(f"\n🎯 Modelo: Regresión Lineal (Ridge)")
print(f"📊 R² Score: {r2:.4f} ({r2*100:.1f}% de varianza explicada)")
print(f"💰 Error promedio: ${mae:.2f} USD")
