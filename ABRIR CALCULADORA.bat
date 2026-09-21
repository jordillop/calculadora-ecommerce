@echo off
setlocal

cd /d "%~dp0"
title Calculadora ecommerce - servidor local

set "NODE_EXE=node"
where node >nul 2>&1
if not errorlevel 1 goto node_ready

set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%NODE_EXE%" goto node_ready

echo No se ha encontrado Node.js en el sistema ni en la instalacion de Codex.
echo Instala Node.js o anadelo al PATH antes de continuar.
pause
exit /b 1

:node_ready

echo Iniciando la calculadora en http://127.0.0.1:4173 ...
echo Mantenga esta ventana abierta mientras utiliza la calculadora.
echo.

start "" /b powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 800; Start-Process 'http://127.0.0.1:4173'"
"%NODE_EXE%" server.mjs

echo.
echo El servidor se ha detenido.
pause
