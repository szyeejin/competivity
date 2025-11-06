@echo off
chcp 65001 > nul
echo ========================================
echo     导入报名审核测试数据
echo ========================================
echo.

set MYSQL_HOST=localhost
set MYSQL_PORT=3305
set MYSQL_USER=root
set MYSQL_PASSWORD=syj17771493975
set MYSQL_DATABASE=competition_system

echo 请确保 MySQL 路径正确...
echo.

echo 正在导入测试数据...
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < insert_test_data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo     ✅ 数据导入成功！
    echo ========================================
    echo.
    echo 测试数据包括：
    echo  - 10条报名申请（待审核、已通过、已驳回）
    echo  - 5个团队
    echo  - 团队成员信息
    echo.
) else (
    echo.
    echo ========================================
    echo     ❌ 数据导入失败！
    echo ========================================
    echo.
    echo 请检查：
    echo  1. MySQL是否在运行
    echo  2. MySQL路径是否正确
    echo  3. 数据库连接信息是否正确
    echo.
)

pause
