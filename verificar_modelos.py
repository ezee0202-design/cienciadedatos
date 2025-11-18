"""
Script de Utilidad para Verificar y Regenerar Modelos
Permite verificar el estado de todos los modelos y regenerarlos si es necesario
"""

import sys
import subprocess
from pathlib import Path

# Configuración
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / "backend"

MODELS_CONFIG = [
    {
        'name': 'Modelo de Satisfacción (Random Forest)',
        'files': [
            BACKEND_DIR / 'random_forest_model.pkl',
            BACKEND_DIR / 'features.json',
            BACKEND_DIR / 'analysis_results.json'
        ],
        'script': ROOT_DIR / 'generate_models.py'
    },
    {
        'name': 'Modelo de Seniority/Bien Pagado',
        'files': [
            BACKEND_DIR / 'seniority_model.pkl',
            BACKEND_DIR / 'seniority_features.json',
            BACKEND_DIR / 'seniority_analysis.json'
        ],
        'script': ROOT_DIR / 'generate_seniority_model.py'
    },
    {
        'name': 'Modelo XGBoost (Búsqueda de Trabajo)',
        'files': [
            BACKEND_DIR / 'xgboost_model.pkl',
            BACKEND_DIR / 'xgboost_features.json',
            BACKEND_DIR / 'xgboost_analysis.json'
        ],
        'script': ROOT_DIR / 'generate_xgboost_model.py'
    },
    {
        'name': 'Modelo de Regresión de Sueldo (USD)',
        'files': [
            BACKEND_DIR / 'regression_salary_model.pkl',
            BACKEND_DIR / 'regression_salary_scaler.pkl',
            BACKEND_DIR / 'regression_salary_features.json',
            BACKEND_DIR / 'regression_salary_analysis.json'
        ],
        'script': ROOT_DIR / 'generate_regression_model.py'
    },
    {
        'name': 'Modelo de Regresión de Sueldo Futuro (ARS)',
        'files': [
            BACKEND_DIR / 'regression_futuro_model.pkl',
            BACKEND_DIR / 'regression_futuro_scaler.pkl',
            BACKEND_DIR / 'regression_futuro_features.json',
            BACKEND_DIR / 'regression_futuro_analysis.json'
        ],
        'script': ROOT_DIR / 'generate_regression_futuro.py'
    }
]

def check_model_status():
    """Verifica el estado de todos los modelos"""
    print("\n" + "="*80)
    print("📊 ESTADO DE MODELOS")
    print("="*80 + "\n")
    
    all_ok = True
    models_status = []
    
    for model_info in MODELS_CONFIG:
        name = model_info['name']
        files = model_info['files']
        script = model_info['script']
        
        missing = [f.name for f in files if not f.exists()]
        
        if missing:
            status = "❌ INCOMPLETO"
            all_ok = False
        else:
            status = "✅ OK"
        
        models_status.append({
            'name': name,
            'status': status,
            'missing': missing,
            'script': script
        })
        
        print(f"{status} - {name}")
        if missing:
            print(f"   Archivos faltantes:")
            for f in missing:
                print(f"      • {f}")
            print(f"   Script de regeneración: {script.name}")
        print()
    
    print("="*80)
    
    if all_ok:
        print("✅ Todos los modelos están completos y listos para usar")
    else:
        print("⚠️  Algunos modelos están incompletos")
    
    return all_ok, models_status

def regenerate_model(model_index):
    """Regenera un modelo específico"""
    model_info = MODELS_CONFIG[model_index]
    script = model_info['script']
    name = model_info['name']
    
    if not script.exists():
        print(f"❌ Script no encontrado: {script}")
        return False
    
    print(f"\n🔄 Regenerando: {name}")
    print(f"   Ejecutando: {script.name}")
    print("-" * 80)
    
    try:
        result = subprocess.run(
            [sys.executable, str(script)],
            cwd=str(ROOT_DIR),
            timeout=600  # 10 minutos timeout
        )
        
        if result.returncode == 0:
            print("-" * 80)
            print(f"✅ {name} regenerado exitosamente")
            return True
        else:
            print("-" * 80)
            print(f"❌ Error al regenerar {name}")
            return False
            
    except subprocess.TimeoutExpired:
        print("-" * 80)
        print(f"❌ Timeout al regenerar {name} (>10 min)")
        return False
    except Exception as e:
        print("-" * 80)
        print(f"❌ Error inesperado: {e}")
        return False

def regenerate_all():
    """Regenera todos los modelos"""
    print("\n🔄 REGENERANDO TODOS LOS MODELOS")
    print("="*80)
    print("⚠️  Este proceso puede tomar varios minutos...")
    print()
    
    results = []
    for i, model_info in enumerate(MODELS_CONFIG):
        success = regenerate_model(i)
        results.append({
            'name': model_info['name'],
            'success': success
        })
    
    print("\n" + "="*80)
    print("📊 RESUMEN DE REGENERACIÓN")
    print("="*80)
    
    for result in results:
        status = "✅" if result['success'] else "❌"
        print(f"{status} {result['name']}")
    
    all_ok = all(r['success'] for r in results)
    
    if all_ok:
        print("\n✅ Todos los modelos fueron regenerados exitosamente")
    else:
        print("\n⚠️  Algunos modelos fallaron al regenerarse")
    
    return all_ok

def main():
    """Función principal"""
    print("="*80)
    print("🔧 VERIFICADOR Y REGENERADOR DE MODELOS")
    print("="*80)
    
    # Verificar estado actual
    all_ok, models_status = check_model_status()
    
    if all_ok:
        print("\n💡 Todos los modelos están completos.")
        print("   ¿Deseas regenerarlos de todas formas? (s/N): ", end='')
        
        try:
            response = input().strip().lower()
            if response == 's':
                regenerate_all()
            else:
                print("\n✓ No se realizaron cambios")
        except KeyboardInterrupt:
            print("\n\n✓ Operación cancelada")
            return
    else:
        print("\n❓ ¿Qué deseas hacer?")
        print("   1. Regenerar TODOS los modelos")
        print("   2. Regenerar solo los modelos faltantes")
        print("   3. Regenerar un modelo específico")
        print("   0. Salir")
        print("\nOpción: ", end='')
        
        try:
            option = input().strip()
            
            if option == '1':
                regenerate_all()
            elif option == '2':
                for i, model_info in enumerate(MODELS_CONFIG):
                    missing = [f.name for f in model_info['files'] if not f.exists()]
                    if missing:
                        regenerate_model(i)
            elif option == '3':
                print("\nModelos disponibles:")
                for i, model_info in enumerate(MODELS_CONFIG):
                    status = "✅" if all(f.exists() for f in model_info['files']) else "❌"
                    print(f"   {i+1}. {status} {model_info['name']}")
                print("\nSelecciona el número del modelo (1-5): ", end='')
                
                model_num = int(input().strip())
                if 1 <= model_num <= len(MODELS_CONFIG):
                    regenerate_model(model_num - 1)
                else:
                    print("❌ Número de modelo inválido")
            elif option == '0':
                print("\n✓ Operación cancelada")
            else:
                print("\n❌ Opción inválida")
                
        except KeyboardInterrupt:
            print("\n\n✓ Operación cancelada")
        except ValueError:
            print("\n❌ Entrada inválida")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
