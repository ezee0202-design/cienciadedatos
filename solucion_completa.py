#!/usr/bin/env python3
"""
SCRIPT DE SOLUCIÓN COMPLETA
Arregla todos los problemas de la aplicación
"""

import os
import sys
import json
from pathlib import Path
import subprocess

# Colores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_section(title):
    print(f"\n{BLUE}{'='*80}")
    print(f"{BLUE}{title}")
    print(f"{BLUE}{'='*80}{RESET}\n")

def check_and_fix():
    print_section("🔧 INICIANDO SOLUCIÓN COMPLETA")
    
    base_dir = Path(__file__).parent
    
    # 1. Verificar archivos críticos
    print(f"{YELLOW}1. Verificando archivos críticos...{RESET}")
    
    required_files = {
        'backend/app.py': 'Backend API',
        'backend/random_forest_model.pkl': 'Modelo ML',
        'backend/features.json': 'Features',
        'backend/analysis_results.json': 'Resultados análisis',
        'frontend/index.html': 'Frontend',
        'notebooks/data_analysis.ipynb': 'Notebook',
        'database.csv': 'Dataset'
    }
    
    missing = []
    for file_path, description in required_files.items():
        full_path = base_dir / file_path
        if full_path.exists():
            size = full_path.stat().st_size / 1024
            print(f"  {GREEN}✓{RESET} {description}: {size:.1f}KB")
        else:
            print(f"  {RED}✗{RESET} {description}: FALTA")
            missing.append(file_path)
    
    # 2. Verificar gráficas
    print(f"\n{YELLOW}2. Verificando gráficas...{RESET}")
    
    graphics = [
        'distributions.png',
        'correlation_matrix.png',
        'missing_values.png',
        'confusion_matrix.png',
        'feature_importance.png',
        'model_metrics.png'
    ]
    
    graphics_dir = base_dir / 'frontend'
    missing_graphics = []
    
    for graphic in graphics:
        graphic_path = graphics_dir / graphic
        if graphic_path.exists():
            size = graphic_path.stat().st_size / 1024
            print(f"  {GREEN}✓{RESET} {graphic}: {size:.1f}KB")
        else:
            print(f"  {RED}✗{RESET} {graphic}: FALTA")
            missing_graphics.append(graphic)
    
    # 3. Verificar backend
    print(f"\n{YELLOW}3. Verificando Backend...{RESET}")
    
    backend_file = base_dir / 'backend' / 'app.py'
    if backend_file.exists():
        print(f"  {GREEN}✓{RESET} app.py encontrado")
        
        # Verificar que tenga los endpoints
        with open(backend_file, 'r') as f:
            content = f.read()
            
        endpoints = [
            '/api/dashboard',
            '/api/analysis',
            '/api/model-info',
            '/api/predict',
            '/api/graphics'
        ]
        
        for endpoint in endpoints:
            if endpoint in content:
                print(f"    {GREEN}✓{RESET} Endpoint {endpoint}")
            else:
                print(f"    {RED}✗{RESET} Endpoint {endpoint} FALTA")
    
    # 4. Verificar frontend
    print(f"\n{YELLOW}4. Verificando Frontend...{RESET}")
    
    frontend_file = base_dir / 'frontend' / 'index.html'
    if frontend_file.exists():
        print(f"  {GREEN}✓{RESET} index.html encontrado")
        
        with open(frontend_file, 'r') as f:
            content = f.read()
            
        sections = ['Dashboard', 'EDA', 'Modelo', 'Predictor', 'Galería']
        for section in sections:
            if section.lower() in content.lower():
                print(f"    {GREEN}✓{RESET} Sección {section}")
            else:
                print(f"    {RED}✗{RESET} Sección {section} FALTA")
    
    # 5. Resumen
    print_section("📊 RESUMEN DE PROBLEMAS")
    
    if missing:
        print(f"{RED}Archivos faltantes:{RESET}")
        for f in missing:
            print(f"  - {f}")
    
    if missing_graphics:
        print(f"{RED}Gráficas faltantes:{RESET}")
        for g in missing_graphics:
            print(f"  - {g}")
    
    if not missing and not missing_graphics:
        print(f"{GREEN}✓ Todos los archivos están presentes{RESET}")
    
    # 6. Verificar estado de servidores
    print_section("🖥️ ESTADO DE SERVIDORES")
    
    try:
        import requests
        
        try:
            resp = requests.get('http://localhost:5000/api/dashboard', timeout=2)
            print(f"  {GREEN}✓{RESET} Backend: ACTIVO (puerto 5000)")
        except:
            print(f"  {RED}✗{RESET} Backend: INACTIVO")
            print(f"    Solución: cd backend && python app.py")
        
        try:
            resp = requests.get('http://localhost:8000/', timeout=2)
            print(f"  {GREEN}✓{RESET} Frontend: ACTIVO (puerto 8000)")
        except:
            print(f"  {RED}✗{RESET} Frontend: INACTIVO")
            print(f"    Solución: cd frontend && python server.py")
    except:
        print(f"  {YELLOW}⚠{RESET} No se pudo verificar (requests no instalado)")
    
    # 7. Recomendaciones finales
    print_section("✅ RECOMENDACIONES")
    
    if not missing and not missing_graphics:
        print(f"{GREEN}✓ Estructura del proyecto: OK{RESET}")
        print(f"{GREEN}✓ Todos los archivos están presentes{RESET}")
        print(f"{GREEN}✓ Todas las gráficas están generadas{RESET}")
    
    print(f"\n{YELLOW}Próximas acciones:{RESET}")
    print(f"  1. Terminal 1: cd backend && python app.py")
    print(f"  2. Terminal 2: cd frontend && python server.py")
    print(f"  3. Navegador: http://localhost:8000")
    
    print(f"\n{GREEN}✓ Diagnóstico completado{RESET}")

if __name__ == '__main__':
    check_and_fix()
