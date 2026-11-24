@echo off
echo ========================================
echo   MAYU DELIVERY GESTAO - INICIANDO
echo ========================================
echo.
echo Verificando dependencias...

REM Verificar se Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se PostgreSQL esta acessivel
echo Verificando conexao com banco de dados...
psql --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo AVISO: psql nao encontrado no PATH. Certifique-se de que o PostgreSQL esta instalado e em execucao.
)

echo.
echo Instalando dependencias do projeto...
call npm install

echo.
echo Iniciando servidor backend e frontend...
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Pressione CTRL+C para parar todos os servicos
echo ========================================
echo.

call npm run dev

pause