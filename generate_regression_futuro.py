"""
Script para generar modelo de Regresión Lineal (Ridge) - Sueldo Futuro (Pesos ARS)
Predice: ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos
Incluye la variable 'year' para capturar tendencia temporal
"""

import os, re, unicodedata
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib
matplotlib.use('Agg')  # Backend no-interactivo
import matplotlib.pyplot as plt
import seaborn as sns
import pickle  # Cambiar a pickle directamente
import json
import warnings
warnings.filterwarnings('ignore')

# Configuración
RANDOM_STATE = 42
ALPHA = 10.0  # Parámetro de regularización Ridge

# Paths
DATA_DIR = Path(__file__).parent
input_path = DATA_DIR / 'database.csv'
backend_dir = DATA_DIR / 'backend'
frontend_dir = DATA_DIR / 'frontend'

backend_dir.mkdir(exist_ok=True)
frontend_dir.mkdir(exist_ok=True)

print('='*60)
print('GENERACIÓN DE MODELO: Regresión de Sueldo Futuro (ARS)')
print('='*60)

# =============================================================
# PASO 1: Cargar datos
# =============================================================
print("\n[PASO 1] Cargando database.csv...")

df = pd.read_csv(input_path, dtype=object)
print(f"[OK] Dataset cargado: {df.shape[0]} registros, {df.shape[1]} columnas")

# Normalizar columnas
def normalize_col(s: str) -> str:
    s = str(s).strip().lower()
    s = ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))
    return re.sub(r'[^0-9a-z]+', '_', s).strip('_')

df.columns = [normalize_col(c) for c in df.columns]

# =============================================================
# PASO 2: Preparar target
# =============================================================
print("\n[PASO 2] Preparando target 'ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos'...")

target_col = 'ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos'
if target_col not in df.columns:
    raise SystemExit(f"ERROR: No encontré columna '{target_col}'")

# Convertir a numérico
df[target_col] = pd.to_numeric(
    df[target_col].astype(str).str.replace(r'[$€£\s,]', '', regex=True),
    errors='coerce'
)

# Verificar que exista columna 'year'
if 'year' not in df.columns:
    raise SystemExit("ERROR: No encontré columna 'year'. Este modelo requiere datos temporales.")

df['year'] = pd.to_numeric(df['year'], errors='coerce')

# Filtrar outliers razonables para ARS (considerando inflación)
# Rango: 50,000 - 10,000,000 ARS
min_sueldo = 50000
max_sueldo = 10000000

df_clean = df[
    (df[target_col] >= min_sueldo) &
    (df[target_col] <= max_sueldo) &
    (df[target_col].notna()) &
    (df['year'].notna())
].copy()

print(f"[OK] Registros válidos: {len(df_clean)} (removidos: {len(df) - len(df_clean)})")
print(f"  - Min: ${df_clean[target_col].min():,.0f} ARS")
print(f"  - Max: ${df_clean[target_col].max():,.0f} ARS")
print(f"  - Media: ${df_clean[target_col].mean():,.0f} ARS")
print(f"  - Mediana: ${df_clean[target_col].median():,.0f} ARS")
print(f"  - Años disponibles: {sorted(df_clean['year'].unique())}")

# =============================================================
# PASO 3: Seleccionar features (incluye 'year')
# =============================================================
print("\n[PASO 3] Seleccionando features...")

base_features = [
    'year',  # ⭐ Variable temporal para capturar tendencia
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
    'que_tanto_estas_usando_copilotchatgpt_u_otras_herramientas_de_ia_para_tu_trabajo'
]

available_features = [f for f in base_features if f in df_clean.columns]
print(f"[OK] Usando {len(available_features)} features base (incluye 'year')")

X = df_clean[available_features].copy()
y = df_clean[target_col].copy()

# Procesar features
for col in X.columns:
    if col == 'year':
        # Year ya está como numérico
        continue
    
    # Intentar convertir a numérico
    coerced = pd.to_numeric(
        X[col].astype(str).str.replace(r'[$€£%\s,]', '', regex=True),
        errors='coerce'
    )
    
    if coerced.notna().sum() / len(X) >= 0.5:  # Si >50% son numéricos
        X[col] = coerced.fillna(coerced.median())
    else:
        # Factorizar categóricas
        X[col] = pd.factorize(X[col].fillna('MISSING').astype(str))[0]

# =============================================================
# PASO 4: Feature Engineering
# =============================================================
print("\n[PASO 4] Feature Engineering...")
print("  Creando features derivadas...")

# Ratios
X['ratio_exp_edad'] = X['anos_de_experiencia'] / (X['tengo_edad'] + 1)
X['ratio_puesto_exp'] = X['anos_en_el_puesto_actual'] / (X['anos_de_experiencia'] + 1)
X['ratio_antiguedad_exp'] = X['antiguedad_en_la_empresa_actual'] / (X['tengo_edad'] + 1)

# Indicadores booleanos (detectar patrones en categóricas factorizadas)
# Para seniority
seniority_median = X['seniority'].median()
X['es_senior'] = (X['seniority'] > seniority_median).astype(float)
X['es_junior'] = (X['seniority'] < seniority_median * 0.5).astype(float)

# Para trabajo_de
trabajo_median = X['trabajo_de'].median()
X['es_manager'] = (X['trabajo_de'] > trabajo_median * 1.5).astype(float)
X['es_developer'] = (X['trabajo_de'] < trabajo_median * 0.8).astype(float)

# Polinomios para capturar relaciones no lineales
X['exp_squared'] = X['anos_de_experiencia'] ** 2
X['edad_squared'] = X['tengo_edad'] ** 2

print(f"[OK] Features finales: {len(X.columns)} columnas")

# =============================================================
# PASO 5: Split train/test
# =============================================================
print("\n[PASO 5] Dividiendo datos en train/test...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=RANDOM_STATE
)

print(f"[OK] Train: {X_train.shape[0]} registros")
print(f"[OK] Test: {X_test.shape[0]} registros")

# =============================================================
# PASO 6: Escalar features
# =============================================================
print("\n[PASO 6] Escalando features...")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# =============================================================
# PASO 7: Entrenar modelo Ridge
# =============================================================
print(f"\n[PASO 7] Entrenando modelo de Regresión Lineal (Ridge)...")
print(f"  Modelo: Ridge")
print(f"  Parámetro alpha: {ALPHA}")

model = Ridge(alpha=ALPHA, random_state=RANDOM_STATE)
model.fit(X_train_scaled, y_train)

# Predicciones
y_pred_train = model.predict(X_train_scaled)
y_pred_test = model.predict(X_test_scaled)

# Métricas
r2_train = r2_score(y_train, y_pred_train)
r2_test = r2_score(y_test, y_pred_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
mae = mean_absolute_error(y_test, y_pred_test)
mape = np.mean(np.abs((y_test - y_pred_test) / y_test)) * 100

print("\n" + "="*62)
print("RESULTADOS - REGRESIÓN LINEAL (SUELDO FUTURO ARS)")
print("="*62)
print(f"  R² Train: {r2_train:.4f}")
print(f"  R² Test: {r2_test:.4f} (explica {r2_test*100:.1f}% de la varianza)")
print(f"  RMSE: ${rmse:,.2f} ARS")
print(f"  MAE: ${mae:,.2f} ARS")
print(f"  MAPE: {mape:.2f}%")

# =============================================================
# PASO 8: Análisis de coeficientes
# =============================================================
print("\n[PASO 8] Análisis de coeficientes de Regresión Lineal...")

coefficients = pd.DataFrame({
    "feature": X.columns,
    "coefficient": model.coef_
}).sort_values("coefficient", key=abs, ascending=False)

print("\nMétricas finales:")
print(f"  R² Score: {r2_test:.4f} (explica {r2_test*100:.1f}% de la varianza)")
print(f"  RMSE: ${rmse:,.2f} ARS")
print(f"  MAE: ${mae:,.2f} ARS")
print(f"  MAPE: {mape:.2f}%")

print("\nTop 10 coeficientes más influyentes:")
for idx, row in coefficients.head(10).iterrows():
    sign = '+' if row['coefficient'] >= 0 else ''
    print(f"  {row['feature']:<45} {sign} {row['coefficient']:>10,.2f}")

# =============================================================
# PASO 9: Guardar modelo y archivos
# =============================================================
print("\n[PASO 9] Guardando modelo y archivos...")

# Guardar modelo con pickle
model_path = backend_dir / 'regression_futuro_model.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(model, f, protocol=pickle.HIGHEST_PROTOCOL)
print(f"[OK] Modelo guardado: {model_path}")

# Guardar scaler con pickle
scaler_path = backend_dir / 'regression_futuro_scaler.pkl'
with open(scaler_path, 'wb') as f:
    pickle.dump(scaler, f, protocol=pickle.HIGHEST_PROTOCOL)
print(f"[OK] Scaler guardado: {scaler_path}")

# Guardar features
features_dict = {
    'features': list(X.columns),
    'feature_names': available_features,  # Features base
    'model_type': 'Ridge',
    'uses_scaling': True,
    'currency': 'ARS',
    'includes_year': True
}

features_path = backend_dir / 'regression_futuro_features.json'
with open(features_path, 'w', encoding='utf-8') as f:
    json.dump(features_dict, f, indent=2, ensure_ascii=False)
print(f"[OK] Features guardadas: {features_path}")

# Guardar análisis
analysis_dict = {
    'model_comparison': {
        'Ridge': {
            'r2_train': float(r2_train),
            'r2_test': float(r2_test),
            'rmse': float(rmse),
            'mae': float(mae),
            'mape': float(mape)
        }
    },
    'coefficients': coefficients.head(20).to_dict('records'),
    'target': target_col,
    'n_features': len(X.columns),
    'n_samples_train': len(X_train),
    'n_samples_test': len(X_test)
}

analysis_path = backend_dir / 'regression_futuro_analysis.json'
with open(analysis_path, 'w', encoding='utf-8') as f:
    json.dump(analysis_dict, f, indent=2, ensure_ascii=False)
print(f"[OK] Análisis guardado: {analysis_path}")

# =============================================================
# PASO 10: Generar gráficas
# =============================================================
print("\n[PASO 10] Generando gráficas...")

plt.style.use('seaborn-v0_8-darkgrid')
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Gráfica 1: Predicción vs Real
axes[0, 0].scatter(y_test, y_pred_test, alpha=0.5, s=20)
axes[0, 0].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
axes[0, 0].set_xlabel('Sueldo Real (ARS)')
axes[0, 0].set_ylabel('Sueldo Predicho (ARS)')
axes[0, 0].set_title('Predicción vs Real - Sueldo Futuro')
axes[0, 0].text(0.05, 0.95, f'R² = {r2_test:.3f}', transform=axes[0, 0].transAxes,
                verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

# Gráfica 2: Residuales
residuals = y_test - y_pred_test
axes[0, 1].scatter(y_pred_test, residuals, alpha=0.5, s=20)
axes[0, 1].axhline(y=0, color='r', linestyle='--', lw=2)
axes[0, 1].set_xlabel('Valores Predichos (ARS)')
axes[0, 1].set_ylabel('Residuales')
axes[0, 1].set_title('Análisis de Residuales')

# Gráfica 3: Distribución de errores
axes[1, 0].hist(residuals, bins=50, edgecolor='black', alpha=0.7)
axes[1, 0].set_xlabel('Residuales')
axes[1, 0].set_ylabel('Frecuencia')
axes[1, 0].set_title('Distribución de Errores')
axes[1, 0].axvline(x=0, color='r', linestyle='--', lw=2)

# Gráfica 4: Comparación modelo (barra única)
axes[1, 1].bar(['Ridge'], [r2_test], color='green', alpha=0.7, edgecolor='black')
axes[1, 1].set_ylabel('R² Score')
axes[1, 1].set_title('Modelo: Regresión Lineal (Ridge)')
axes[1, 1].set_ylim(0, 1)
axes[1, 1].axhline(y=r2_test, color='gray', linestyle='--', alpha=0.3)
for i, v in enumerate([r2_test]):
    axes[1, 1].text(i, v + 0.02, f'{v:.3f}', ha='center', fontweight='bold')

plt.tight_layout()
analysis_img_path = frontend_dir / 'regression_futuro_analysis.png'
plt.savefig(analysis_img_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"[OK] Gráfica guardada: {analysis_img_path}")

# Gráfica de coeficientes
plt.figure(figsize=(10, 8))
top_coefs = coefficients.head(15)
colors = ['green' if c >= 0 else 'red' for c in top_coefs['coefficient']]
plt.barh(range(len(top_coefs)), top_coefs['coefficient'], color=colors, alpha=0.7, edgecolor='black')
plt.yticks(range(len(top_coefs)), top_coefs['feature'])
plt.xlabel('Coeficiente (impacto en ARS)')
plt.title('Top 15 Coeficientes Más Influyentes - Sueldo Futuro')
plt.axvline(x=0, color='black', linestyle='-', linewidth=0.8)
plt.tight_layout()
coef_img_path = frontend_dir / 'regression_futuro_coefficients.png'
plt.savefig(coef_img_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"[OK] Gráfica guardada: {coef_img_path}")

# =============================================================
# FINALIZACIÓN
# =============================================================
print("\n" + "="*62)
print("[OK] PROCESO COMPLETADO EXITOSAMENTE")
print("="*62)

print("\nArchivos generados:")
print(f"  - {model_path}")
print(f"  - {scaler_path}")
print(f"  - {features_path}")
print(f"  - {analysis_path}")
print(f"  - {analysis_img_path}")
print(f"  - {coef_img_path}")

print(f"\n🎯 Modelo: Regresión Lineal (Ridge)")
print(f"📊 R² Score: {r2_test:.4f} ({r2_test*100:.1f}% de varianza explicada)")
print(f"💰 Error promedio: ${mae:,.2f} ARS")
print(f"⭐ Incluye variable temporal 'year' para tendencia")
