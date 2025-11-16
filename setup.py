"""
Script para instalar dependencias y configurar el proyecto
Ejecutar: python setup.py
"""

import subprocess
import sys
import os
from pathlib import Path

def install_dependencies():
    """Instalar dependencias Python"""
    print("=" * 80)
    print("INSTALANDO DEPENDENCIAS PYTHON")
    print("=" * 80)
    
    backend_dir = Path(__file__).parent / "backend"
    requirements_file = backend_dir / "requirements.txt"
    
    if requirements_file.exists():
        print(f"\n📦 Instalando desde: {requirements_file}")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
            print("\n✓ Dependencias instaladas correctamente")
            return True
        except subprocess.CalledProcessError as e:
            print(f"\n❌ Error al instalar dependencias: {e}")
            return False
    else:
        print(f"\n❌ Archivo no encontrado: {requirements_file}")
        return False

def check_jupyter():
    """Verificar si Jupyter está instalado"""
    print("\n" + "=" * 80)
    print("VERIFICANDO JUPYTER")
    print("=" * 80)
    
    try:
        subprocess.check_call([sys.executable, "-m", "jupyter", "--version"], 
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("\n✓ Jupyter ya está instalado")
        return True
    except:
        print("\n⚠️ Jupyter no está instalado")
        print("\n Para instalar Jupyter, ejecuta:")
        print("   pip install jupyter")
        return False

def show_next_steps():
    """Mostrar pasos siguientes"""
    print("\n" + "=" * 80)
    print("PASOS SIGUIENTES")
    print("=" * 80)
    
    steps = """
    1️⃣  EJECUTAR ANÁLISIS (Jupyter Notebook):
        cd notebooks
        jupyter notebook data_analysis.ipynb
        
        Ejecutar todas las celdas (Ctrl+Shift+Enter)
    
    2️⃣  INICIAR BACKEND (Terminal 1):
        cd backend
        python app.py
        
        Deberías ver: "Servidor disponible en: http://localhost:5000"
    
    3️⃣  INICIAR FRONTEND (Terminal 2):
        cd frontend
        python server.py
        
        Deberías ver: "Servidor iniciado en: http://localhost:8000"
    
    4️⃣  ABRIR NAVEGADOR:
        http://localhost:8000
    
    ℹ️  NOTA IMPORTANTE:
        - Ejecuta primero el notebook para generar el modelo y gráficas
        - Luego inicia el backend y frontend
        - Asegúrate de que database.csv esté en la carpeta raíz
    """
    
    print(steps)

def main():
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 78 + "║")
    print("║" + "  📊 CONFIGURACIÓN - ANÁLISIS DE DATOS CON RANDOM FOREST".center(78) + "║")
    print("║" + " " * 78 + "║")
    print("╚" + "=" * 78 + "╝")
    
    # Instalar dependencias
    if not install_dependencies():
        print("\n❌ Error en la instalación de dependencias")
        sys.exit(1)
    
    # Verificar Jupyter
    check_jupyter()
    
    # Mostrar pasos siguientes
    show_next_steps()
    
    print("\n" + "=" * 80)
    print("✓ CONFIGURACIÓN COMPLETADA")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
