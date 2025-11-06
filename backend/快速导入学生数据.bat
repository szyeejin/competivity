@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    学生数据快速导入工具
echo ========================================
echo.

echo 📋 步骤 1: 导入学生数据到数据库...
echo.

REM 获取MySQL密码（从server.js中读取）
set MYSQL_USER=root
set MYSQL_PASSWORD=syj17771493975
set MYSQL_DB=competition_system
set MYSQL_PORT=3305

REM 执行SQL脚本
mysql -h localhost -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DB% < insert_more_students.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 学生数据导入成功！
    echo.
    echo 📊 数据统计：
    echo    - 新增学生：30名
    echo    - 总学生数：38名（原8名 + 新增30名）
    echo    - 涵盖专业：20+个
    echo    - 年级分布：大一到研二
    echo.
    echo 🚀 后续步骤：
    echo    1. 重启后端服务器（如果还未启动）
    echo    2. 刷新前端页面
    echo    3. 进入"学生管理" - "学生列表"查看数据
    echo.
) else (
    echo.
    echo ❌ 数据导入失败！
    echo.
    echo 🔍 可能的原因：
    echo    1. MySQL服务未启动
    echo    2. 数据库连接配置错误
    echo    3. SQL文件不存在或格式错误
    echo.
    echo 💡 解决方案：
    echo    1. 确保MySQL服务正在运行
    echo    2. 检查数据库连接配置
    echo    3. 手动执行SQL脚本
    echo.
)

echo.
pause
