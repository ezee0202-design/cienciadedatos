"""
Script simple para iniciar solo el backend con información de debug
"""

import sys
import os

# Cambiar al directorio correcto
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("="*80)
print("SCRIPT DE INICIO SIMPLE DEL BACKEND")
print("="*80)
print(f"Directorio actual: {os.getcwd()}")
print(f"Python: {sys.version}")
print(f"Ejecutable: {sys.executable}")
print("="*80 + "\n")

try:
    print("Importando módulos...")
    from backend.app import app, check_and_generate_models, load_model
    
    print("✓ Módulos importados\n")
    
    print("Verificando y generando modelos...")
    if not check_and_generate_models():
        print("\n❌ Fallo la verificación de modelos")
        sys.exit(1)
    
    print("\n✓ Modelos verificados\n")
    
    print("Cargando modelos en memoria...")
    if not load_model():
        print("\n❌ Fallo la carga de modelos")
        sys.exit(1)
    
    print("\n✓ Modelos cargados\n")
    
    print("="*80)
    print("INICIANDO SERVIDOR FLASK")
    print("="*80)
    print("\n📍 Servidor: http://localhost:5000")
    print("💡 Presiona Ctrl+C para detener\n")
    
    app.run(debug=False, port=5000, host='0.0.0.0')
    
except KeyboardInterrupt:
    print("\n\n✓ Servidor detenido por el usuario")
    sys.exit(0)
    
except Exception as e:
    print(f"\n❌ ERROR CRÍTICO: {e}")
    import traceback
    traceback.print_exc()
    print("\n" + "="*80)
    print("Presiona Enter para salir...")
    input()
    sys.exit(1)
