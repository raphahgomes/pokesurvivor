@echo off
title PokéSurvivor Modded - Offline Launcher
echo ========================================================
echo     Iniciando PokéSurvivor Modded (100%% Offline)
echo ========================================================
echo.
echo Iniciando servidor local na porta 8080...
start "" http://localhost:8080/
python -m http.server 8080
pause
