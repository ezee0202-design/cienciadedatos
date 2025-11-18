"""
Script alternativo para iniciar el backend de forma más robusta
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

if __name__ == '__main__':
    try:
        # Importar el módulo app
        print("Importando módulo backend...")
        from backend import app as backend_module
        
        print("Módulo importado exitosamente")
        print("Iniciando desde el módulo...")
        
        # El código en backend/app.py se ejecutará automáticamente
        # debido al if __name__ == '__main__'
        
    except ImportError as e:
        print(f"Error al importar el módulo backend: {e}")
        print("\nIntentando ejecutar directamente el script...")
        
        import subprocess
        result = subprocess.run(
            [sys.executable, str(backend_dir / "app.py")],
            cwd=str(Path(__file__).parent)
        )
        sys.exit(result.returncode)
        
    except Exception as e:
        print(f"Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
