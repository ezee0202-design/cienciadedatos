"""
Script de diagnóstico para verificar gráficas
Ejecutar: python diagnostico_graficas.py
"""

import os
import json
from pathlib import Path

print("\n" + "="*80)
print("DIAGNÓSTICO DE GRÁFICAS")
print("="*80)

# Rutas
BACKEND_DIR = Path(__file__).parent / "backend"
FRONTEND_DIR = Path(__file__).parent / "frontend"

print("\n📁 DIRECTORIOS:")
print(f"  Backend: {BACKEND_DIR}")
print(f"  Frontend: {FRONTEND_DIR}")

# Verificar archivos del backend
print("\n🐍 ARCHIVOS BACKEND:")
backend_files = {
    'random_forest_model.pkl': BACKEND_DIR / 'random_forest_model.pkl',
    'features.json': BACKEND_DIR / 'features.json',
    'analysis_results.json': BACKEND_DIR / 'analysis_results.json',
    'app.py': BACKEND_DIR / 'app.py'
}

for name, path in backend_files.items():
    exists = path.exists()
    size = f"{path.stat().st_size / 1024:.1f}KB" if exists else "N/A"
    status = "✓" if exists else "❌"
    print(f"  {status} {name}: {size}")

# Verificar gráficas
print("\n📊 GRÁFICAS EN FRONTEND:")
if FRONTEND_DIR.exists():
    graphics = list(FRONTEND_DIR.glob('*.png'))
    if graphics:
        for g in sorted(graphics):
            size = f"{g.stat().st_size / 1024:.1f}KB"
            print(f"  ✓ {g.name}: {size}")
    else:
        print("  ❌ NO HAY GRÁFICAS GENERADAS")
else:
    print("  ❌ Carpeta frontend no existe")

# Verificar analysis_results.json
print("\n📈 CONTENIDO ANÁLISIS:")
try:
    with open(BACKEND_DIR / 'analysis_results.json', 'r', encoding='utf-8') as f:
        results = json.load(f)
    
    if 'model_metrics' in results:
        metrics = results['model_metrics']
        print(f"  Accuracy: {metrics.get('accuracy', 'N/A')}")
        print(f"  Features: {len(results.get('feature_importance', []))} listadas")
    
    if 'seniority_distribution' in results:
        dist = results['seniority_distribution']
        print(f"  Distribución Seniority:")
        for clase, count in dist.items():
            print(f"    - {clase}: {count}")
except Exception as e:
    print(f"  ❌ Error leyendo analysis_results.json: {e}")

# Verificar features.json
print("\n⭐ FEATURES:")
try:
    with open(BACKEND_DIR / 'features.json', 'r') as f:
        features_data = json.load(f)
    features = features_data.get('features', [])
    print(f"  Total: {len(features)} features")
    for i, feat in enumerate(features, 1):
        print(f"    {i}. {feat}")
except Exception as e:
    print(f"  ❌ Error: {e}")

print("\n" + "="*80)
print("INSTRUCCIONES PARA ARREGLAR SI FALTA ALGO:")
print("="*80)
print("""
1. Si faltan gráficas:
   → Ejecutar: cd notebooks
   → jupyter notebook data_analysis.ipynb
   → Ejecutar todas las celdas: Ctrl+Shift+Enter

2. Si faltan JSON/PKL:
   → Ejecutar el notebook completo (paso 1)

3. Si todo OK:
   → Backend: python backend/app.py
   → Frontend: python frontend/server.py
   → Navegador: http://localhost:8000

""")
