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
echo %BLUE%              AI聊天应用本地启动脚本                %RESET%
echo %BLUE%======================================================%RESET%
echo.

:: 检查Node.js
echo %GREEN%正在检查必要的依赖...%RESET%
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到Node.js。请先安装Node.js。%RESET%
    echo %YELLOW%请访问 https://nodejs.org/ 安装Node.js%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo %GREEN%? 已找到Node.js: %NODE_VERSION%%RESET%

:: 检查npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到npm。请重新安装Node.js。%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo %GREEN%? 已找到npm: %NPM_VERSION%%RESET%

:: 检查Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到Python。请安装Python 3.7+。%RESET%
    echo %YELLOW%访问 https://www.python.org/downloads/ 安装Python%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo %GREEN%? 已找到 %PYTHON_VERSION%%RESET%

:: 检查pip
python -m pip --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到pip。请确保pip已安装。%RESET%
    echo %YELLOW%你可以尝试: 'python -m ensurepip' 或安装pip%RESET%
    pause
    exit /b 1
)

for /f "tokens=1,2" %%i in ('python -m pip --version ^| findstr /C:"pip"') do set PIP_VERSION=%%i %%j
echo %GREEN%? 已找到 %PIP_VERSION%%RESET%

:: 检查API密钥环境变量
echo %GREEN%正在检查API密钥...%RESET%
set ENV_VAR_SET=true

if "%ARK_API_KEY%"=="" (
    if "%DEEPSEEK_API_KEY%"=="" (
        set ENV_VAR_SET=false
        echo %YELLOW%警告: 未设置API密钥环境变量。AI聊天功能可能无法正常工作。%RESET%
        echo %YELLOW%请通过以下命令设置环境变量:%RESET%
        echo %YELLOW%  set ARK_API_KEY=你的密钥值%RESET%
        echo %YELLOW%  或%RESET%
        echo %YELLOW%  set DEEPSEEK_API_KEY=你的密钥值%RESET%
    )
)

if "%ENV_VAR_SET%"=="false" (
    echo %YELLOW%请设置必要的环境变量以启用完整功能。%RESET%
    echo %YELLOW%即将继续启动应用程序，但AI聊天功能可能不可用。%RESET%
    pause
)

:: 安装Python依赖
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                   安装Python依赖                 %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在安装Python依赖...%RESET%
python -m pip install flask flask-cors requests

:: 安装Node.js依赖
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                  安装Node.js依赖                %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在安装Node.js依赖...%RESET%
call npm install

:: 启动Python API服务
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                  启动Python API服务              %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在新窗口中启动Python API服务...%RESET%
start cmd /k "echo 启动Python API服务... & python api_service.py"

:: 等待Python服务启动
echo %GREEN%等待Python API服务启动... (5秒)%RESET%
timeout /t 5 /nobreak >nul

:: 设置Python API URL环境变量
set PYTHON_API_URL=http://localhost:5001

:: 启动Node.js应用
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                     启动应用                    %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%启动AI聊天应用...%RESET%
echo %YELLOW%请在浏览器中访问: http://localhost:5000%RESET%
echo %YELLOW%按Ctrl+C终止应用%RESET%

:: 运行Node.js应用
call npm run dev

endlocal