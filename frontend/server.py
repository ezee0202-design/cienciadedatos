"""
Servidor HTTP simple para servir los archivos del frontend
Se ejecuta en puerto 8080
"""

import http.server
import socketserver
import os
from pathlib import Path

FRONTEND_DIR = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)
    
    def end_headers(self):
        # Evitar caché para que siempre cargue los archivos más recientes
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def find_available_port(start_port=8080, max_attempts=10):
    """Encontrar puerto disponible comenzando desde start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socketserver.TCPServer(("", port), MyHTTPRequestHandler) as test:
                return port
        except OSError:
            continue
    raise RuntimeError(f"No ports available between {start_port} and {start_port + max_attempts}")

def run_server():
    print("=" * 80)
    print("SERVIDOR HTTP DEL FRONTEND")
    print("=" * 80)
    
    # Encontrar puerto disponible
    port = find_available_port(8080)
    handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"\n✓ Servidor iniciado en: http://localhost:{port}")
        print(f"✓ Sirviendo archivos desde: {FRONTEND_DIR}")
        print("\n💡 Para detener: Presiona Ctrl+C")
        print("=" * 80 + "\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✓ Servidor detenido")

if __name__ == '__main__':
    run_server()

