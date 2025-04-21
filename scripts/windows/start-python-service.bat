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
echo %BLUE%          DeepSeek Python API服务启动脚本            %RESET%
echo %BLUE%======================================================%RESET%
echo.

:: 检查Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到Python。请安装Python 3.7+。%RESET%
    echo %YELLOW%访问 https://www.python.org/downloads/ 安装Python%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo %GREEN%✓ 已找到 %PYTHON_VERSION%%RESET%

:: 检查pip
python -m pip --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%错误: 未找到pip。请确保pip已安装。%RESET%
    echo %YELLOW%你可以尝试: 'python -m ensurepip' 或安装pip%RESET%
    pause
    exit /b 1
)

for /f "tokens=1,2" %%i in ('python -m pip --version ^| findstr /C:"pip"') do set PIP_VERSION=%%i %%j
echo %GREEN%✓ 已找到 %PIP_VERSION%%RESET%

:: 检查API密钥环境变量
echo %GREEN%正在检查API密钥...%RESET%
set API_KEY_SET=false

if defined ARK_API_KEY (
    echo %GREEN%✓ 已设置ARK_API_KEY环境变量%RESET%
    set API_KEY_SET=true
) else if defined DEEPSEEK_API_KEY (
    echo %GREEN%✓ 已设置DEEPSEEK_API_KEY环境变量%RESET%
    set API_KEY_SET=true
) else (
    echo %YELLOW%⚠️ 未设置API密钥环境变量。AI聊天功能无法正常工作。%RESET%
    echo %YELLOW%请通过以下命令设置环境变量:%RESET%
    echo %YELLOW%  set ARK_API_KEY=你的密钥值%RESET%
    echo %YELLOW%  或%RESET%
    echo %YELLOW%  set DEEPSEEK_API_KEY=你的密钥值%RESET%
    
    set /p CONTINUE="是否要继续启动服务? [y/N] "
    if /i not "!CONTINUE!"=="y" (
        exit /b 1
    )
)

:: 安装Python依赖
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                   安装Python依赖                 %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在安装Flask依赖...%RESET%
python -m pip install flask flask-cors requests

:: 启动Python API服务
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                 启动Python API服务               %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%正在启动Python API服务...%RESET%
echo %YELLOW%服务将在 http://localhost:5001 上运行%RESET%
echo %YELLOW%在另一个终端窗口运行 'npm run dev' 来启动前端应用%RESET%
echo %YELLOW%按Ctrl+C终止服务%RESET%

:: 设置端口环境变量
set PYTHON_API_PORT=5001

:: 启动Python服务
python api_service.py

endlocal