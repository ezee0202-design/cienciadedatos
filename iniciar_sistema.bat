@echo off`r`nchcp 65001 >nul`r`nset PYTHONIOENCODING=utf-8
REM Script para iniciar el sistema completo con verificaci?n de modelos

echo ================================================================================
echo    INICIANDO SISTEMA DE ANALISIS DE DATOS
echo ================================================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "backend\app.py" (
    echo ERROR: No se encuentra backend\app.py
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

REM Verificar que existe database.csv
if not exist "database.csv" (
    echo ERROR: No se encuentra database.csv
    echo Este archivo es necesario para generar los modelos
    pause
    exit /b 1
)

echo [1/3] Verificando modelos...
python verificar_modelos.py
if errorlevel 1 (
    echo.
    echo ADVERTENCIA: Algunos modelos pueden estar faltando
    echo El backend intentara generarlos automaticamente...
    echo.
)

echo.
echo [2/3] Iniciando Backend (Flask en puerto 5000)...
echo      - El backend verificara y generara modelos si es necesario
echo      - Espera a ver el mensaje "Servidor disponible en..."
echo      - Si el servidor no inicia, revisa la ventana de Backend
echo.

REM Matar cualquier proceso que este usando el puerto 5000
echo Verificando puerto 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Liberando puerto 5000 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak >nul
start "Backend Flask" cmd /k "cd /d %~dp0backend && python app.py"

REM Esperar unos segundos para que el backend inicie
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Iniciando Frontend (Servidor web en puerto 8080)...
echo.

REM Matar cualquier proceso que este usando el puerto 8080
echo Verificando puerto 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Liberando puerto 8080 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

timeout /t 5 /nobreak >nul
start "Frontend Server" cmd /k "cd /d %~dp0frontend && python server.py"

echo.
echo ================================================================================
echo    SISTEMA INICIADO
echo ================================================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Para detener: Cierra las ventanas de Backend y Frontend
echo              o presiona Ctrl+C en cada una
echo.
echo ================================================================================
echo.
pause



