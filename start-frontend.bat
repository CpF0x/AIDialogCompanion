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
echo %BLUE%            DeepSeek Web前端启动脚本              %RESET%
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

:: 检查Python API服务是否运行
echo %GREEN%正在检查Python API服务...%RESET%
where curl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    curl -s http://localhost:5001/health >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo %GREEN%✓ Python API服务正在运行%RESET%
    ) else (
        echo %YELLOW%⚠️ 无法连接到Python API服务%RESET%
        echo %YELLOW%请先在另一个终端窗口运行 'start-python-service.bat'%RESET%
        
        set /p CONTINUE="是否继续启动前端? [y/N] "
        if /i not "!CONTINUE!"=="y" (
            exit /b 1
        )
    )
) else (
    echo %YELLOW%⚠️ 未找到curl，无法检查Python API服务%RESET%
    echo %YELLOW%请确保Python API服务已在另一个终端窗口中运行%RESET%
)

:: 设置Python API URL环境变量
set PYTHON_API_URL=http://localhost:5001

:: 安装依赖
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                 安装Node.js依赖                %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在安装Node.js依赖...%RESET%
call npm install

:: 启动前端应用
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                  启动前端应用                  %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在启动前端应用...%RESET%
echo %YELLOW%请在浏览器中访问: http://localhost:5000%RESET%
echo %YELLOW%按Ctrl+C终止应用%RESET%

:: 启动应用
call npm run dev

endlocal