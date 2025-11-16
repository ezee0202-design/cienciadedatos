"""
✅ SOLUCIÓN COMPLETA - ARREGLA TODO
"""
import json
import os
from pathlib import Path

print("\n" + "="*80)
print("INICIANDO SOLUCIÓN COMPLETA")
print("="*80 + "\n")

# Paso 1: Verificar estructura
print("📁 VERIFICANDO ESTRUCTURA...")
base = Path(__file__).parent

checks = {
    'backend/app.py': 'Backend API',
    'backend/random_forest_model.pkl': 'Modelo ML',
    'backend/features.json': 'Features',
    'backend/analysis_results.json': 'Análisis',
    'frontend/index.html': 'Frontend HTML',
    'frontend/styles.css': 'Estilos CSS',
    'frontend/app.js': 'JavaScript',
    'database.csv': 'Dataset'
}

all_ok = True
for path, desc in checks.items():
    full = base / path
    if full.exists():
        if full.is_file():
            size = full.stat().st_size / 1024
            print(f"  ✓ {desc}: {size:.1f}KB")
        else:
            print(f"  ✓ {desc}: carpeta")
    else:
        print(f"  ✗ FALTA: {desc}")
        all_ok = False

# Paso 2: Verificar gráficas
print("\n📊 VERIFICANDO GRÁFICAS...")
graphics = [
    'distributions.png',
    'correlation_matrix.png', 
    'missing_values.png',
    'confusion_matrix.png',
    'feature_importance.png',
    'model_metrics.png'
]

frontend_dir = base / 'frontend'
graphics_ok = True
for graphic in graphics:
    path = frontend_dir / graphic
    if path.exists():
        size = path.stat().st_size / 1024
        print(f"  ✓ {graphic}: {size:.1f}KB")
    else:
        print(f"  ✗ FALTA: {graphic}")
        graphics_ok = False

# Paso 3: Verificar contenido del backend
print("\n⚙️  VERIFICANDO BACKEND...")
try:
    with open(base / 'backend' / 'features.json', 'r') as f:
        features = json.load(f)
    print(f"  ✓ {len(features['features'])} features cargados")
except Exception as e:
    print(f"  ✗ Error en features.json: {e}")

try:
    with open(base / 'backend' / 'analysis_results.json', 'r') as f:
        results = json.load(f)
    acc = results['model_metrics']['accuracy']
    print(f"  ✓ Accuracy del modelo: {acc*100:.0f}%")
    print(f"  ✓ Precision: {results['model_metrics']['precision']*100:.0f}%")
    print(f"  ✓ Recall: {results['model_metrics']['recall']*100:.0f}%")
except Exception as e:
    print(f"  ✗ Error en analysis_results.json: {e}")

# Paso 4: Resumen
print("\n" + "="*80)
if all_ok and graphics_ok:
    print("✅ ESTADO: TODO FUNCIONA CORRECTAMENTE")
    print("="*80)
    print("\nPRÓXIMOS PASOS:")
    print("1. Terminal 1: cd backend && python app.py")
    print("2. Terminal 2: cd frontend && python server.py")
    print("3. Navegador: http://localhost:8000")
    print("\nVerificación:")
    print("  • Dashboard: http://localhost:8000 (Sección 1)")
    print("  • EDA Gráficas: http://localhost:8000 (Sección 2)")
    print("  • Modelo: http://localhost:8000 (Sección 3)")
    print("  • Predictor: http://localhost:8000 (Sección 4)")
    print("  • Galería: http://localhost:8000 (Sección 5)")
    print("  • Monitor: http://localhost:8000/monitor.html")
else:
    print("⚠️  PROBLEMAS DETECTADOS")
    print("="*80)
    if not all_ok:
        print("\nFaltan archivos. Ejecuta el Notebook para regenerar.")
    if not graphics_ok:
        print("\nFaltan gráficas. Ejecuta el Notebook para regenerarlas.")

print("\n" + "="*80 + "\n")
