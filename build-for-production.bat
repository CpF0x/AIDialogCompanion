@echo off
setlocal enabledelayedexpansion

:: 颜色代码
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RED=[91m"
set "RESET=[0m"

:: 标题
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                 生产环境构建脚本                %RESET%
echo %BLUE%======================================================%RESET%
echo.

:: 检查Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到Node.js。请安装Node.js。%RESET%
    echo %YELLOW%访问 https://nodejs.org/ 安装Node.js%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo %GREEN%✓ 已找到Node.js: %NODE_VERSION%%RESET%

:: 检查npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到npm。请重新安装Node.js。%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo %GREEN%✓ 已找到npm: %NPM_VERSION%%RESET%

:: 安装依赖
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                    安装依赖                    %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在安装Node.js依赖...%RESET%
call npm install

:: 构建前端
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                 构建前端应用                  %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在构建前端应用...%RESET%

set NODE_ENV=production
call npm run build

:: 成功消息
if %ERRORLEVEL% EQU 0 (
    echo.
    echo %BLUE%======================================================%RESET%
    echo %BLUE%                    构建完成                    %RESET%
    echo %BLUE%======================================================%RESET%
    echo.
    echo %GREEN%✓ 前端应用已成功构建%RESET%
    echo %GREEN%✓ 构建文件位于 ./client/dist 目录%RESET%
    echo %YELLOW%要在生产环境中运行应用:%RESET%
    echo %YELLOW%1. 设置必要的环境变量:%RESET%
    echo %YELLOW%   set NODE_ENV=production%RESET%
    echo %YELLOW%   set ARK_API_KEY=your_api_key_here%RESET%
    echo %YELLOW%2. 在一个终端中启动Python API服务:%RESET%
    echo %YELLOW%   python api_service.py%RESET%
    echo %YELLOW%3. 在另一个终端中启动Node.js应用:%RESET%
    echo %YELLOW%   set PYTHON_API_URL=http://localhost:5001%RESET%
    echo %YELLOW%   node server/index.js%RESET%
) else (
    echo.
    echo %BLUE%======================================================%RESET%
    echo %BLUE%                    构建失败                    %RESET%
    echo %BLUE%======================================================%RESET%
    echo.
    echo %RED%❌ 前端应用构建失败%RESET%
    echo %YELLOW%请检查上面的错误信息%RESET%
)

pause
endlocal