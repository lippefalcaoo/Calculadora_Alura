@echo off
chcp 65001 >nul
title Empacotador Automatico - Calculadora CustomTkinter (.exe)

echo ============================================================================
echo   INICIANDO GERACAO DO EXECUTAVEL (.EXE) - CALCULADORA CUSTOMTKINTER
echo ============================================================================
echo.

:: 1. Verifica e instala/atualiza as dependencias necessarias
echo [1/4] Verificando dependencias (CustomTkinter e PyInstaller)...
python -m pip install --upgrade pip >nul
python -m pip install -r requirements.txt pyinstaller
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias. Verifique se o Python esta no PATH.
    pause
    exit /b 1
)

:: 2. Limpa pastas de compilacoes anteriores para evitar conflitos de cache
echo.
echo [2/4] Limpando arquivos temporarios de builds anteriores...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist Calculadora.spec del /f /q Calculadora.spec

:: 3. Executa o PyInstaller empacotando temas e JSONs do CustomTkinter
echo.
echo [3/4] Compilando main.py, interface.py e logica.py em arquivo unico...
python -m PyInstaller --noconfirm --onefile --windowed --name "Calculadora" --collect-all customtkinter main.py
if %errorlevel% neq 0 (
    echo [ERRO] Ocorreu um problema durante a execucao do PyInstaller.
    pause
    exit /b 1
)

:: 4. Finalizacao e abertura automatica da pasta dist
echo.
echo [4/4] Concluido com sucesso!
echo ============================================================================
echo   Executavel gerado em: %cd%\dist\Calculadora.exe
echo ============================================================================
echo.
explorer dist
pause
