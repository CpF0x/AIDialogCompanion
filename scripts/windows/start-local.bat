@echo off
setlocal enabledelayedexpansion

:: ��ɫ����
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RED=[91m"
set "RESET=[0m"

:: ����
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%              AI����Ӧ�ñ��������ű�                %RESET%
echo %BLUE%======================================================%RESET%
echo.

:: ���Node.js
echo %GREEN%���ڼ���Ҫ������...%RESET%
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%����: δ�ҵ�Node.js�����Ȱ�װNode.js��%RESET%
    echo %YELLOW%����� https://nodejs.org/ ��װNode.js%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo %GREEN%? ���ҵ�Node.js: %NODE_VERSION%%RESET%

:: ���npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%����: δ�ҵ�npm�������°�װNode.js��%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo %GREEN%? ���ҵ�npm: %NPM_VERSION%%RESET%

:: ���Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%����: δ�ҵ�Python���밲װPython 3.7+��%RESET%
    echo %YELLOW%���� https://www.python.org/downloads/ ��װPython%RESET%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo %GREEN%? ���ҵ� %PYTHON_VERSION%%RESET%

:: ���pip
python -m pip --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%����: δ�ҵ�pip����ȷ��pip�Ѱ�װ��%RESET%
    echo %YELLOW%����Գ���: 'python -m ensurepip' ��װpip%RESET%
    pause
    exit /b 1
)

for /f "tokens=1,2" %%i in ('python -m pip --version ^| findstr /C:"pip"') do set PIP_VERSION=%%i %%j
echo %GREEN%? ���ҵ� %PIP_VERSION%%RESET%

:: ���API��Կ��������
echo %GREEN%���ڼ��API��Կ...%RESET%
set ENV_VAR_SET=true

if "%ARK_API_KEY%"=="" (
    if "%DEEPSEEK_API_KEY%"=="" (
        set ENV_VAR_SET=false
        echo %YELLOW%����: δ����API��Կ����������AI���칦�ܿ����޷�����������%RESET%
        echo %YELLOW%��ͨ�������������û�������:%RESET%
        echo %YELLOW%  set ARK_API_KEY=�����Կֵ%RESET%
        echo %YELLOW%  ��%RESET%
        echo %YELLOW%  set DEEPSEEK_API_KEY=�����Կֵ%RESET%
    )
)

if "%ENV_VAR_SET%"=="false" (
    echo %YELLOW%�����ñ�Ҫ�Ļ��������������������ܡ�%RESET%
    echo %YELLOW%������������Ӧ�ó��򣬵�AI���칦�ܿ��ܲ����á�%RESET%
    pause
)

:: ��װPython����
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                   ��װPython����                 %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%���ڰ�װPython����...%RESET%
python -m pip install flask flask-cors requests

:: ��װNode.js����
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                  ��װNode.js����                %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%���ڰ�װNode.js����...%RESET%
call npm install

:: ����Python API����
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                  ����Python API����              %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%�����´���������Python API����...%RESET%
start cmd /k "echo ����Python API����... & python api_service.py"

:: �ȴ�Python��������
echo %GREEN%�ȴ�Python API��������... (5��)%RESET%
timeout /t 5 /nobreak >nul

:: ����Python API URL��������
set PYTHON_API_URL=http://localhost:5001

:: ����Node.jsӦ��
echo.
echo %BLUE%======================================================%RESET%
echo %BLUE%                     ����Ӧ��                    %RESET%
echo %BLUE%======================================================%RESET%
echo.
echo %GREEN%����AI����Ӧ��...%RESET%
echo %YELLOW%����������з���: http://localhost:5000%RESET%
echo %YELLOW%��Ctrl+C��ֹӦ��%RESET%

:: ����Node.jsӦ��
call npm run dev

endlocal