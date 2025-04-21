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

:: 检查并设置API密钥环境变量 (DeepSeek或Ark)
echo.
echo %GREEN%正在检查API密钥环境变量...%RESET%
if defined ARK_API_KEY (
    echo %GREEN%✓ 已设置ARK_API_KEY环境变量。%RESET%
) else if defined DEEPSEEK_API_KEY (
    echo %GREEN%✓ 已设置DEEPSEEK_API_KEY环境变量。%RESET%
) else (
    echo %YELLOW%警告: 未找到 ARK_API_KEY 或 DEEPSEEK_API_KEY 环境变量。%RESET%
    echo %YELLOW%你需要至少设置其中一个才能使用AI模型。%RESET%
    set /p API_KEY_INPUT="%YELLOW%请输入你的 DeepSeek API 密钥 (或按 Enter 跳过): %RESET%"
    if defined API_KEY_INPUT (
        set DEEPSEEK_API_KEY=!API_KEY_INPUT!
        echo %GREEN%✓ 已临时设置DEEPSEEK_API_KEY环境变量。%RESET%
    ) else (
        echo %RED%警告: 未提供API密钥，AI功能可能无法使用。%RESET%
    )
)

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
:: 等待浏览器启动
ping 127.0.0.1 -n 3 > nul
call npm run dev

endlocal 