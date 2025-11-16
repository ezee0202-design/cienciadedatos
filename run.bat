@echo off
REM Script para ejecutar fácilmente la aplicación en Windows

title Análisis de Datos - Random Forest

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                                ║
echo ║           ^<SCRIPT PARA EJECUTAR LA APLICACIÓN DE ANÁLISIS DE DATOS^>          ║
echo ║                                                                                ║
echo ╚════════════════════════════════════════════════════════════════════════════════╝
echo.
echo Este script te ayudará a ejecutar todos los componentes de la aplicación.
echo.
echo ¿Qué deseas hacer?
echo.
echo  1) Instalar dependencias
echo  2) Ejecutar Jupyter Notebook
echo  3) Iniciar Backend (Flask)
echo  4) Iniciar Frontend (Servidor HTTP)
echo  5) Ver instrucciones completas
echo  6) Salir
echo.

set /p option="Selecciona una opción (1-6): "

if "%option%"=="1" goto install
if "%option%"=="2" goto notebook
if "%option%"=="3" goto backend
if "%option%"=="4" goto frontend
if "%option%"=="5" goto instructions
if "%option%"=="6" goto end
echo.
echo Error: Opción no válida
goto menu

:install
cls
echo.
echo Instalando dependencias Python...
echo.
python setup.py
pause
goto menu

:notebook
cls
echo.
echo Iniciando Jupyter Notebook...
echo.
cd notebooks
jupyter notebook data_analysis.ipynb
cd ..
pause
goto menu

:backend
cls
echo.
echo Iniciando Backend (Flask)...
echo.
cd backend
python app.py
cd ..
pause
goto menu

:frontend
cls
echo.
echo Iniciando Frontend (Servidor HTTP)...
echo.
cd frontend
python server.py
pause
goto menu

:instructions
cls
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo  INSTRUCCIONES PARA EJECUTAR LA APLICACIÓN
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo PASO 1: INSTALAR DEPENDENCIAS (Ejecutar una sola vez)
echo ──────────────────────────────────────────────────────
echo  python setup.py
echo.
echo PASO 2: EJECUTAR EL NOTEBOOK (5-10 minutos)
echo ────────────────────────────────────────────
echo  - Opción 2 en este menú, O
echo  - cd notebooks
echo  - jupyter notebook data_analysis.ipynb
echo  - Ejecutar todas las celdas: Ctrl+Shift+Enter
echo.
echo PASO 3: INICIAR BACKEND (Terminal 1)
echo ────────────────────────────────────
echo  - Opción 3 en este menú, O
echo  - cd backend
echo  - python app.py
echo  - Debe mostrar: "Servidor disponible en: http://localhost:5000"
echo.
echo PASO 4: INICIAR FRONTEND (Terminal 2)
echo ──────────────────────────────────────
echo  - Opción 4 en este menú, O
echo  - cd frontend
echo  - python server.py
echo  - Debe mostrar: "Servidor iniciado en: http://localhost:8000"
echo.
echo PASO 5: ABRIR EN NAVEGADOR
echo ──────────────────────────
echo  - Abre: http://localhost:8000
echo  - ¡Disfruta la aplicación!
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
pause
goto menu

:end
cls
echo.
echo ¡Hasta luego! 👋
echo.
exit /b

:menu
cls
echo.
echo Presiona cualquier tecla para volver al menú...
pause > nul
goto start
