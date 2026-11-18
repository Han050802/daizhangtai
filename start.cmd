@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "TASK_PYTHON=%~dp0runtime\python\python.exe"
if not exist "%TASK_PYTHON%" (
  where python.exe >nul 2>&1
  if errorlevel 1 (
    echo 请安装 Python 3.12 并将 python 加入 PATH。
    pause
    exit /b 1
  )
  set "TASK_PYTHON=python.exe"
)
"%TASK_PYTHON%" -X utf8 -B launcher.py %*
set "TASK_EXIT=%ERRORLEVEL%"
if not "%TASK_EXIT%"=="0" pause
exit /b %TASK_EXIT%
