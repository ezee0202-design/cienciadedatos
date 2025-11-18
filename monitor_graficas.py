"""
Monitor de Gráficas - Verifica que todas las gráficas carguen correctamente
Ejecutar: python monitor_graficas.py
"""

try:
    import requests
except ImportError:
    print("El paquete 'requests' no está instalado. Por favor, instálalo con 'pip install requests'")
    sys.exit(1)

import time
import json
from pathlib import Path
from datetime import datetime

# URLs de los servidores
BACKEND_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:8080"

# Lista de gráficas esperadas
GRAPHICS = [
    'distributions.png',
    'correlation_matrix.png',
    'missing_values.png',
    'confusion_matrix.png',
    'feature_importance.png',
    'model_metrics.png'
]

def test_backend_health():
    """Verificar que el backend responda"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/dashboard", timeout=2)
        return response.status_code == 200
    except:
        return False

def test_graphics_endpoint():
    """Verificar endpoint de gráficas"""
    results = {}
    for graphic in GRAPHICS:
        try:
            # Probar endpoint directo
            response = requests.get(
                f"{BACKEND_URL}/api/graphics/{graphic}",
                timeout=3
            )
            results[graphic] = {
                'direct': response.status_code == 200,
                'size_kb': len(response.content) / 1024 if response.status_code == 200 else 0
            }
        except Exception as e:
            results[graphic] = {
                'direct': False,
                'error': str(e)
            }
        
        # Probar endpoint base64
        try:
            response = requests.get(
                f"{BACKEND_URL}/api/graphics-base64/{graphic}",
                timeout=3
            )
            if response.status_code == 200:
                data = response.json()
                results[graphic]['base64'] = len(data.get('data_url', '')) > 100
            else:
                results[graphic]['base64'] = False
        except Exception as e:
            results[graphic]['base64'] = False
            results[graphic]['error_base64'] = str(e)
    
    return results

def test_frontend():
    """Verificar que el frontend cargue"""
    try:
        response = requests.get(f"{FRONTEND_URL}/", timeout=2)
        return response.status_code == 200
    except:
        return False

def test_api_endpoints():
    """Probar todos los endpoints de la API"""
    endpoints = [
        '/api/dashboard',
        '/api/analysis',
        '/api/model-info',
        '/api/features'
    ]
    
    results = {}
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=2)
            results[endpoint] = response.status_code == 200
        except:
            results[endpoint] = False
    
    return results

def print_report(report):
    """Imprimir reporte formateado"""
    print("\n" + "="*80)
    print("MONITOR DE GRÁFICAS")
    print("="*80)
    print(f"Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Estado de servidores
    print("🖥️  ESTADO DE SERVIDORES:")
    backend = report.get('backend_health', False)
    frontend = report.get('frontend', False)
    print(f"  {'✓' if backend else '❌'} Backend (http://localhost:5000)")
    print(f"  {'✓' if frontend else '❌'} Frontend (http://localhost:8080)")
    
    if not backend or not frontend:
        print("\n⚠️  Los servidores no están disponibles. Asegúrate de ejecutar:")
        print("  Terminal 1: cd backend && python app.py")
        print("  Terminal 2: cd frontend && python server.py")
        return
    
    # Endpoints API
    print("\n📡 ENDPOINTS API:")
    for endpoint, status in report.get('api_endpoints', {}).items():
        print(f"  {'✓' if status else '❌'} {endpoint}")
    
    # Gráficas
    print("\n📊 GRÁFICAS:")
    graphics = report.get('graphics', {})
    all_ok = True
    
    for graphic, info in graphics.items():
        direct = info.get('direct', False)
        base64 = info.get('base64', False)
        size = info.get('size_kb', 0)
        
        status = '✓' if (direct or base64) else '❌'
        size_str = f"{size:.1f}KB" if size > 0 else "N/A"
        
        print(f"  {status} {graphic}")
        if direct:
            print(f"      └─ Direct: {size_str}")
        if base64:
            print(f"      └─ Base64: ✓")
        if not (direct or base64):
            print(f"      └─ Error: {info.get('error', 'Unknown')}")
            all_ok = False
    
    # Resumen
    print("\n" + "="*80)
    if all_ok and backend and frontend:
        print("✅ TODO ESTÁ FUNCIONANDO CORRECTAMENTE")
        print("   Abre: http://localhost:8080")
    else:
        print("❌ Hay problemas a resolver")
    print("="*80 + "\n")

def monitor_continuous(interval=5):
    """Monitoreo continuo"""
    print("Iniciando monitoreo continuo (Presiona Ctrl+C para detener)...")
    
    try:
        while True:
            report = {
                'backend_health': test_backend_health(),
                'frontend': test_frontend(),
                'api_endpoints': test_api_endpoints(),
                'graphics': test_graphics_endpoint()
            }
            
            print("\033[2J\033[H")  # Limpiar pantalla
            print_report(report)
            
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n\n✓ Monitoreo detenido")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--continuous':
        monitor_continuous()
    else:
        # Un solo chequeo
        report = {
            'backend_health': test_backend_health(),
            'frontend': test_frontend(),
            'api_endpoints': test_api_endpoints(),
            'graphics': test_graphics_endpoint()
        }
        print_report(report)

