@echo off
chcp 65001 >nul
echo.
echo ================================================
echo    竞赛报名辅助系统 - Flask 后端启动脚本
echo ================================================
echo.

echo [1/3] 检查 Python 环境...
python --version
if errorlevel 1 (
    echo ❌ 未检测到 Python，请先安装 Python 3.7+
    pause
    exit /b 1
)

echo.
echo [2/3] 检查依赖...
python -c "import flask, flask_cors, pymysql, bcrypt" 2>nul
if errorlevel 1 (
    echo ⚠️  检测到缺少依赖，正在安装...
    pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
    if errorlevel 1 (
        echo ❌ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 所有依赖已安装
)

echo.
echo [3/3] 启动 Flask 服务器...
echo.
python app.py

pause
