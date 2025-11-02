"""
Flask后端应用 - 提供注册和登录API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
from database import get_connection, init_database

app = Flask(__name__)
# 启用CORS，允许前端跨域请求
CORS(app)


@app.route('/api/register', methods=['POST'])
def register():
    """
    用户注册接口
    """
    try:
        data = request.get_json()
        
        # 获取表单数据
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        school = data.get('school')
        student_id = data.get('studentId')
        phone = data.get('phone')
        
        # 验证必填字段
        if not all([username, email, password, school, student_id, phone]):
            return jsonify({
                'success': False,
                'message': '所有字段都是必填的'
            }), 400
        
        # 连接数据库
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        # 检查邮箱是否已存在
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({
                'success': False,
                'message': '该邮箱已被注册'
            }), 400
        
        # 加密密码
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # 插入用户数据
        insert_query = """
        INSERT INTO users (username, email, password, school, student_id, phone)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (username, email, hashed_password, school, student_id, phone))
        connection.commit()
        
        user_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '注册成功',
            'data': {
                'userId': user_id,
                'username': username,
                'email': email
            }
        }), 201
        
    except Exception as e:
        print(f"注册错误: {e}")
        return jsonify({
            'success': False,
            'message': f'注册失败: {str(e)}'
        }), 500


@app.route('/api/login', methods=['POST'])
def login():
    """
    用户登录接口
    """
    try:
        data = request.get_json()
        
        # 获取表单数据
        email = data.get('email')
        password = data.get('password')
        
        # 验证必填字段
        if not email or not password:
            return jsonify({
                'success': False,
                'message': '邮箱和密码不能为空'
            }), 400
        
        # 连接数据库
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        # 查询用户
        cursor.execute("SELECT id, username, email, password, school, student_id, phone FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        # 验证用户是否存在
        if not user:
            return jsonify({
                'success': False,
                'message': '邮箱或密码错误'
            }), 401
        
        # 验证密码
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({
                'success': False,
                'message': '邮箱或密码错误'
            }), 401
        
        # 登录成功，返回用户信息（不包含密码）
        return jsonify({
            'success': True,
            'message': '登录成功',
            'data': {
                'userId': user['id'],
                'username': user['username'],
                'email': user['email'],
                'school': user['school'],
                'studentId': user['student_id'],
                'phone': user['phone']
            }
        }), 200
        
    except Exception as e:
        print(f"登录错误: {e}")
        return jsonify({
            'success': False,
            'message': f'登录失败: {str(e)}'
        }), 500


@app.route('/api/test', methods=['GET'])
def test():
    """
    测试接口
    """
    return jsonify({
        'success': True,
        'message': 'API服务正常运行'
    }), 200


if __name__ == '__main__':
    # 启动前先初始化数据库
    print("正在初始化数据库...")
    init_database()
    
    # 启动Flask应用
    print("启动Flask服务器...")
    app.run(host='0.0.0.0', port=5000, debug=True)
