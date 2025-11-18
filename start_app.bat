@echo off
echo ========================================
echo Iniciando Aplicacion de Ciencia de Datos
echo ========================================
echo.

REM Iniciar Backend
echo [1/2] Iniciando Backend (Flask)...
start "Backend Flask" cmd /k "cd backend && python app.py"
timeout /t 3 /nobreak >nul

REM Iniciar Frontend
echo [2/2] Iniciando Frontend (HTTP Server)...
start "Frontend HTTP" cmd /k "cd frontend && python -m http.server 8080"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  APLICACION LISTA
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8080
echo ========================================
echo.
echo Abre tu navegador en: http://localhost:8080
echo.
pause
