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
if "%~1"=="" goto usage
"%TASK_PYTHON%" -X utf8 -B maintenance.py restore "%~f1" --data-dir "%~dp0data"
set "TASK_EXIT=%ERRORLEVEL%"
pause
exit /b %TASK_EXIT%
:usage
echo 请先双击“停止工作台.cmd”，再把工作台生成的数据备份ZIP拖到本文件恢复。
pause
exit /b 1
