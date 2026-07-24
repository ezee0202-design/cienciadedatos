@echo off

REM Iniciar backend en una nueva consola
start "Servidor" cmd /k cd /d "%~dp0server" ^& node index.js ^& pause

REM Iniciar frontend en otra nueva consola
start "Cliente" cmd /k cd /d "%~dp0client" ^& npm start ^& pause