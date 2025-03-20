@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 颜色设置
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RED=[91m"
set "RESET=[0m"

:: 标题
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%            AI对话助手应用启动脚本                %RESET%
echo %BLUE%======================================================%RESET%
echo.

:: 确保在正确的目录中
cd /d %~dp0

:: 检查Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到Node.js，请安装Node.js。%RESET%
    echo %YELLOW%请访问 https://nodejs.org/ 安装Node.js%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo %GREEN%✓ 已找到Node.js: %NODE_VERSION%%RESET%

:: 检查npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到npm，请重新安装Node.js。%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo %GREEN%✓ 已找到npm: %NPM_VERSION%%RESET%

:: 安装依赖
echo.
echo %GREEN%正在检查Node.js依赖...%RESET%
call npm install

:: 启动应用
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                  启动应用                      %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在启动应用...%RESET%
echo %YELLOW%请在浏览器访问: http://localhost:5000%RESET%
echo %YELLOW%按Ctrl+C终止应用%RESET%

:: 启动应用
start http://localhost:5000
call npm run dev

endlocal 