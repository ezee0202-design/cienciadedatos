"""
Setup completo de la aplicación
Entrena todos los modelos automáticamente si no existen
"""

import os
import sys
from pathlib import Path
import subprocess

print("="*80)
print("SETUP AUTOMÁTICO - ANÁLISIS DE SATISFACCIÓN LABORAL")
print("="*80)

# Directorios
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / 'backend'
FRONTEND_DIR = ROOT_DIR / 'frontend'

# Verificar que existe database.csv
if not (ROOT_DIR / 'database.csv').exists():
    print("\n❌ ERROR: No se encontró database.csv")
    print("Por favor, asegúrate de tener el archivo database.csv en la carpeta raíz")
    sys.exit(1)

print("\n✓ database.csv encontrado")

# Crear directorios si no existen
BACKEND_DIR.mkdir(exist_ok=True)
FRONTEND_DIR.mkdir(exist_ok=True)
print("✓ Directorios creados")

# Lista de modelos requeridos
REQUIRED_MODELS = [
    'random_forest_model.pkl',
    'seniority_model.pkl',
    'xgboost_model.pkl',
    'regression_salary_model.pkl',
    'regression_salary_scaler.pkl',
    'regression_futuro_model.pkl',
    'regression_futuro_scaler.pkl'
]

# Verificar qué modelos faltan
missing_models = [m for m in REQUIRED_MODELS if not (BACKEND_DIR / m).exists()]

if not missing_models:
    print("\n✅ Todos los modelos ya están entrenados")
    print("\nPuedes iniciar la aplicación con:")
    print("  1. python backend/app.py")
    print("  2. python frontend/server.py")
    print("  3. Abrir http://localhost:8000")
    sys.exit(0)

print(f"\n⚠️  Faltan {len(missing_models)} modelos por entrenar")
print("Iniciando entrenamiento automático...\n")

# Instalar dependencias necesarias
print("="*80)
print("PASO 1: Verificando dependencias")
print("="*80)

dependencies = [
    'pandas',
    'numpy',
    'scikit-learn',
    'xgboost',
    'flask',
    'flask-cors',
    'matplotlib'
]

print("\nInstalando dependencias (si faltan)...")
for dep in dependencies:
    try:
        __import__(dep.replace('-', '_'))
        print(f"  ✓ {dep}")
    except ImportError:
        print(f"  ⚠️  Instalando {dep}...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', dep])
        print(f"  ✓ {dep} instalado")

print("\n✅ Todas las dependencias instaladas")

# Entrenar modelos
print("\n" + "="*80)
print("PASO 2: Entrenando modelos")
print("="*80)

scripts_to_run = []

# Determinar qué scripts ejecutar según los modelos faltantes
if 'random_forest_model.pkl' in missing_models:
    scripts_to_run.append(('generate_models.py', 'Modelo de Satisfacción Salarial'))

if 'seniority_model.pkl' in missing_models:
    scripts_to_run.append(('generate_seniority_model.py', 'Modelo de Seniority'))

if 'xgboost_model.pkl' in missing_models:
    scripts_to_run.append(('generate_xgboost_model.py', 'Modelo XGBoost'))

if 'regression_salary_model.pkl' in missing_models or 'regression_salary_scaler.pkl' in missing_models:
    scripts_to_run.append(('generate_regression_model.py', 'Modelo de Regresión (USD)'))

if 'regression_futuro_model.pkl' in missing_models or 'regression_futuro_scaler.pkl' in missing_models:
    scripts_to_run.append(('generate_regression_futuro.py', 'Modelo de Regresión Futuro (ARS)'))

# Ejecutar scripts
for script_name, description in scripts_to_run:
    script_path = ROOT_DIR / script_name
    
    if not script_path.exists():
        print(f"\n⚠️  ADVERTENCIA: No se encontró {script_name}")
        print(f"   Este script es necesario para generar: {description}")
        continue
    
    print(f"\n{'='*80}")
    print(f"Entrenando: {description}")
    print(f"Script: {script_name}")
    print(f"{'='*80}")
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(ROOT_DIR),
            capture_output=False,
            text=True
        )
        
        if result.returncode == 0:
            print(f"\n✅ {description} entrenado exitosamente")
        else:
            print(f"\n❌ Error al entrenar {description}")
            print(f"   Código de salida: {result.returncode}")
    
    except Exception as e:
        print(f"\n❌ Error al ejecutar {script_name}: {e}")
        continue

# Verificar que todos los modelos se generaron
print("\n" + "="*80)
print("PASO 3: Verificación final")
print("="*80)

still_missing = [m for m in REQUIRED_MODELS if not (BACKEND_DIR / m).exists()]

if still_missing:
    print(f"\n⚠️  Todavía faltan {len(still_missing)} modelos:")
    for m in still_missing:
        print(f"   - {m}")
    print("\nEs posible que algunos scripts de generación no existan.")
    print("Revisa la carpeta raíz y asegúrate de tener todos los scripts generate_*.py")
else:
    print("\n✅ ¡Todos los modelos se generaron correctamente!")

# Resumen final
print("\n" + "="*80)
print("SETUP COMPLETADO")
print("="*80)

if not still_missing:
    print("\n🎉 ¡La aplicación está lista para usar!")
    print("\nPasos siguientes:")
    print("  1. Abre una terminal y ejecuta: python backend/app.py")
    print("  2. Abre otra terminal y ejecuta: python frontend/server.py")
    print("  3. Abre tu navegador en: http://localhost:8000")
    print("\n💡 Tip: Puedes usar run.bat para iniciar todo automáticamente")
else:
    print("\n⚠️  Algunos modelos no se pudieron generar")
    print("Revisa los errores anteriores y asegúrate de tener todos los scripts")

print("\n" + "="*80)
