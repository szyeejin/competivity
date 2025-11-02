"""
数据库连接和初始化模块
"""
import pymysql
from pymysql import Error

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'syj17771493975',
    'port': 3305,
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

DATABASE_NAME = 'competition_system'


def get_connection():
    """
    获取数据库连接
    """
    try:
        connection = pymysql.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port'],
            database=DATABASE_NAME,
            charset=DB_CONFIG['charset'],
            cursorclass=DB_CONFIG['cursorclass']
        )
        return connection
    except Error as e:
        print(f"数据库连接错误: {e}")
        return None


def init_database():
    """
    初始化数据库和表结构
    """
    try:
        # 首先连接MySQL服务器（不指定数据库）
        connection = pymysql.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port'],
            charset=DB_CONFIG['charset']
        )
        cursor = connection.cursor()
        
        # 创建数据库（如果不存在）
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DATABASE_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"数据库 '{DATABASE_NAME}' 已创建或已存在")
        
        # 选择数据库
        cursor.execute(f"USE {DATABASE_NAME}")
        
        # 创建用户表
        create_users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            school VARCHAR(100) NOT NULL,
            student_id VARCHAR(50) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        cursor.execute(create_users_table)
        print("用户表已创建或已存在")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("数据库初始化完成！")
        return True
        
    except Error as e:
        print(f"数据库初始化错误: {e}")
        return False


if __name__ == '__main__':
    # 直接运行此文件可以初始化数据库
    init_database()
