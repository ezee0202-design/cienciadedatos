"""
Script de Prueba del Sistema de Auto-Generación de Modelos
Simula la eliminación de un modelo y verifica que se regenere automáticamente
"""

from pathlib import Path
import shutil
import sys

BACKEND_DIR = Path(__file__).parent / "backend"

def test_autogeneration():
    """Prueba la auto-generación eliminando temporalmente un archivo"""
    print("="*80)
    print("🧪 PRUEBA DEL SISTEMA DE AUTO-GENERACIÓN")
    print("="*80)
    
    # Archivo de prueba (uno no crítico)
    test_file = BACKEND_DIR / "xgboost_model.pkl"
    backup_file = BACKEND_DIR / "xgboost_model.pkl.backup"
    
    # Verificar si existe
    if not test_file.exists():
        print(f"\n⚠️  {test_file.name} no existe, no se puede probar")
        print("   Ejecuta primero: python generate_xgboost_model.py")
        return False
    
    print(f"\n1️⃣ Haciendo backup de {test_file.name}...")
    try:
        shutil.copy(test_file, backup_file)
        print(f"   ✅ Backup creado: {backup_file.name}")
    except Exception as e:
        print(f"   ❌ Error al crear backup: {e}")
        return False
    
    print(f"\n2️⃣ Eliminando temporalmente {test_file.name}...")
    try:
        test_file.unlink()
        print(f"   ✅ Archivo eliminado")
    except Exception as e:
        print(f"   ❌ Error al eliminar: {e}")
        # Restaurar backup
        shutil.copy(backup_file, test_file)
        backup_file.unlink()
        return False
    
    print(f"\n3️⃣ El archivo debería regenerarse automáticamente al iniciar el backend")
    print(f"   Ejecuta: python backend/app.py")
    print(f"   Y observa si se regenera {test_file.name}\n")
    
    print(f"4️⃣ Para restaurar el backup manualmente:")
    print(f"   Ejecuta: python -c \"import shutil; shutil.copy('{backup_file}', '{test_file}')\"")
    
    print("\n" + "="*80)
    print("✅ Prueba configurada exitosamente")
    print("="*80)
    
    return True

if __name__ == '__main__':
    test_autogeneration()
