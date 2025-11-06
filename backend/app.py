"""
Flask后端应用 - 竞赛报名辅助系统完整API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import json
from datetime import datetime
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


@app.route('/api/health', methods=['GET'])
def health():
    """
    健康检查接口
    """
    return jsonify({
        'status': 'ok',
        'message': '服务运行正常'
    }), 200


# ==================== 赛事管理 API ====================

@app.route('/api/contests', methods=['POST'])
def create_contest():
    """
    创建赛事接口
    """
    connection = None
    try:
        data = request.get_json()
        basic_info = data.get('basicInfo', {})
        resource_config = data.get('resourceConfig', {})
        
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        # 开始事务
        connection.begin()
        
        # 1. 插入基础信息
        time_place = basic_info.get('timeAndPlace', {})
        incentives = basic_info.get('incentives', {})
        
        insert_contest = """
        INSERT INTO contests (
            name, type, start_date, end_date, 
            registration_start, registration_end, location, online_mode,
            first_prize, second_prize, third_prize, certificate, scholarship, rules
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_contest, (
            basic_info.get('name'),
            basic_info.get('type'),
            time_place.get('startDate'),
            time_place.get('endDate'),
            time_place.get('registrationStart'),
            time_place.get('registrationEnd'),
            time_place.get('location'),
            time_place.get('onlineMode', False),
            incentives.get('firstPrize'),
            incentives.get('secondPrize'),
            incentives.get('thirdPrize'),
            incentives.get('certificate', False),
            incentives.get('scholarship'),
            basic_info.get('rules')
        ))
        
        contest_id = cursor.lastrowid
        
        # 2. 插入预算信息
        budget = resource_config.get('budget', {})
        if budget.get('total'):
            cursor.execute(
                'INSERT INTO contest_budget (contest_id, total) VALUES (%s, %s)',
                (contest_id, budget.get('total'))
            )
            
            # 插入预算分类
            categories = budget.get('categories', [])
            for category in categories:
                cursor.execute(
                    'INSERT INTO contest_budget (contest_id, category_name, category_amount) VALUES (%s, %s, %s)',
                    (contest_id, category.get('name'), category.get('amount'))
                )
        
        # 3. 插入场地信息
        venues = resource_config.get('venue', [])
        for venue in venues:
            facilities_json = json.dumps(venue.get('facilities', []))
            cursor.execute(
                'INSERT INTO contest_venues (contest_id, name, capacity, address, facilities) VALUES (%s, %s, %s, %s, %s)',
                (contest_id, venue.get('name'), venue.get('capacity'), venue.get('address'), facilities_json)
            )
        
        # 4. 插入人员信息
        personnel = resource_config.get('personnel', {})
        all_personnel = []
        
        for organizer in personnel.get('organizers', []):
            all_personnel.append({'role': 'organizer', 'name': organizer.get('name'), 'contact': organizer.get('contact')})
        
        for judge in personnel.get('judges', []):
            all_personnel.append({'role': 'judge', 'name': judge.get('name'), 'contact': judge.get('contact')})
        
        for volunteer in personnel.get('volunteers', []):
            all_personnel.append({'role': 'volunteer', 'name': volunteer.get('name'), 'contact': volunteer.get('contact')})
        
        for person in all_personnel:
            cursor.execute(
                'INSERT INTO contest_personnel (contest_id, role, name, contact) VALUES (%s, %s, %s, %s)',
                (contest_id, person['role'], person['name'], person['contact'])
            )
        
        # 5. 插入设备信息
        equipment = resource_config.get('equipment', [])
        for equip in equipment:
            cursor.execute(
                'INSERT INTO contest_equipment (contest_id, name, quantity, status) VALUES (%s, %s, %s, %s)',
                (contest_id, equip.get('name'), equip.get('quantity', 1), equip.get('status', 'available'))
            )
        
        # 6. 插入物资信息
        materials = resource_config.get('materials', [])
        for material in materials:
            cursor.execute(
                'INSERT INTO contest_materials (contest_id, name, quantity, unit) VALUES (%s, %s, %s, %s)',
                (contest_id, material.get('name'), material.get('quantity'), material.get('unit'))
            )
        
        # 提交事务
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '赛事创建成功',
            'contestId': contest_id
        }), 201
        
    except Exception as e:
        if connection:
            connection.rollback()
        print(f"创建赛事错误: {e}")
        if connection:
            connection.close()
        return jsonify({
            'success': False,
            'message': f'创建赛事失败: {str(e)}'
        }), 500


@app.route('/api/contests', methods=['GET'])
def get_contests():
    """
    获取所有赛事列表
    """
    try:
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM contests ORDER BY created_at DESC')
        contests = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # 转换日期时间为字符串
        for contest in contests:
            for key, value in contest.items():
                if isinstance(value, datetime):
                    contest[key] = value.isoformat()
        
        return jsonify({
            'success': True,
            'data': contests
        }), 200
        
    except Exception as e:
        print(f"获取赛事列表错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取赛事列表失败: {str(e)}'
        }), 500


@app.route('/api/contests/<int:contest_id>', methods=['GET'])
def get_contest_detail(contest_id):
    """
    获取赛事详情
    """
    try:
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        # 获取基础信息
        cursor.execute('SELECT * FROM contests WHERE id = %s', (contest_id,))
        contest = cursor.fetchone()
        
        if not contest:
            cursor.close()
            connection.close()
            return jsonify({
                'success': False,
                'message': '赛事不存在'
            }), 404
        
        # 转换日期时间
        for key, value in contest.items():
            if isinstance(value, datetime):
                contest[key] = value.isoformat()
        
        # 获取预算信息
        cursor.execute('SELECT * FROM contest_budget WHERE contest_id = %s', (contest_id,))
        budget = cursor.fetchall()
        
        # 获取场地信息
        cursor.execute('SELECT * FROM contest_venues WHERE contest_id = %s', (contest_id,))
        venues = cursor.fetchall()
        
        # 解析场地设施JSON
        for venue in venues:
            if venue.get('facilities'):
                try:
                    venue['facilities'] = json.loads(venue['facilities'])
                except:
                    venue['facilities'] = []
        
        # 获取人员信息
        cursor.execute('SELECT * FROM contest_personnel WHERE contest_id = %s', (contest_id,))
        personnel = cursor.fetchall()
        
        # 获取设备信息
        cursor.execute('SELECT * FROM contest_equipment WHERE contest_id = %s', (contest_id,))
        equipment = cursor.fetchall()
        
        # 获取物资信息
        cursor.execute('SELECT * FROM contest_materials WHERE contest_id = %s', (contest_id,))
        materials = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': {
                **contest,
                'budget': budget,
                'venues': venues,
                'personnel': personnel,
                'equipment': equipment,
                'materials': materials
            }
        }), 200
        
    except Exception as e:
        print(f"获取赛事详情错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取赛事详情失败: {str(e)}'
        }), 500


# ==================== 审核管理 API ====================

@app.route('/api/contests/<int:contest_id>/review', methods=['POST'])
def review_contest(contest_id):
    """
    审核赛事接口
    """
    try:
        data = request.get_json()
        reviewer_name = data.get('reviewerName', '系统审核员')
        result = data.get('result')  # 'approved' or 'rejected'
        comment = data.get('comment', '')
        compliance_check = data.get('complianceCheck', True)
        budget_check = data.get('budgetCheck', True)
        resource_check = data.get('resourceCheck', True)
        
        if result not in ['approved', 'rejected']:
            return jsonify({
                'success': False,
                'message': '审核结果必须是 approved 或 rejected'
            }), 400
        
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        connection.begin()
        
        # 1. 更新赛事状态
        cursor.execute(
            'UPDATE contests SET status = %s WHERE id = %s',
            (result if result == 'approved' else 'rejected', contest_id)
        )
        
        # 2. 插入审核记录
        cursor.execute("""
            INSERT INTO contest_reviews 
            (contest_id, reviewer_name, review_result, review_comment, 
             compliance_check, budget_check, resource_check)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (contest_id, reviewer_name, result, comment, 
              compliance_check, budget_check, resource_check))
        
        # 3. 创建通知
        notification_title = f"赛事审核{'通过' if result == 'approved' else '驳回'}"
        notification_content = f"您的赛事已被{'通过' if result == 'approved' else '驳回'}。{comment}"
        
        cursor.execute("""
            INSERT INTO contest_notifications 
            (contest_id, notification_type, title, content)
            VALUES (%s, %s, %s, %s)
        """, (contest_id, 'review_result', notification_title, notification_content))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': f'赛事审核{"通过" if result == "approved" else "驳回"}成功'
        }), 200
        
    except Exception as e:
        if connection:
            connection.rollback()
            connection.close()
        print(f"审核赛事错误: {e}")
        return jsonify({
            'success': False,
            'message': f'审核赛事失败: {str(e)}'
        }), 500


@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    """
    获取审核记录列表
    """
    try:
        status = request.args.get('status', 'all')  # all, pending, approved, rejected
        
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        if status == 'all':
            cursor.execute("""
                SELECT r.*, c.name as contest_name 
                FROM contest_reviews r 
                LEFT JOIN contests c ON r.contest_id = c.id 
                ORDER BY r.review_time DESC
            """)
        else:
            cursor.execute("""
                SELECT r.*, c.name as contest_name 
                FROM contest_reviews r 
                LEFT JOIN contests c ON r.contest_id = c.id 
                WHERE r.review_result = %s 
                ORDER BY r.review_time DESC
            """, (status,))
        
        reviews = cursor.fetchall()
        
        # 转换日期时间
        for review in reviews:
            if isinstance(review.get('review_time'), datetime):
                review['review_time'] = review['review_time'].isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': reviews
        }), 200
        
    except Exception as e:
        print(f"获取审核记录错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取审核记录失败: {str(e)}'
        }), 500


@app.route('/api/reviews/stats', methods=['GET'])
def get_review_stats():
    """
    获取审核统计数据
    """
    try:
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        # 获取各状态的统计
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' OR status = 'draft' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' OR status = 'published' OR status = 'ongoing' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM contests
        """)
        
        stats = cursor.fetchone()
        
        # 获取有冲突的赛事数量
        cursor.execute("""
            SELECT COUNT(DISTINCT contest_id) as conflicts 
            FROM contest_conflicts 
            WHERE is_resolved = FALSE
        """)
        
        conflicts = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': {
                'total': stats['total'] or 0,
                'pending': stats['pending'] or 0,
                'approved': stats['approved'] or 0,
                'rejected': stats['rejected'] or 0,
                'conflicts': conflicts['conflicts'] or 0
            }
        }), 200
        
    except Exception as e:
        print(f"获取审核统计错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取审核统计失败: {str(e)}'
        }), 500


# ==================== 冲突检测 API ====================

@app.route('/api/contests/<int:contest_id>/conflicts', methods=['GET'])
def get_conflicts(contest_id):
    """
    获取赛事冲突列表
    """
    try:
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        # 获取该赛事的所有冲突
        cursor.execute("""
            SELECT cf.*, c.name as conflict_with_name 
            FROM contest_conflicts cf 
            LEFT JOIN contests c ON cf.conflict_with_id = c.id 
            WHERE cf.contest_id = %s 
            ORDER BY cf.severity DESC, cf.detected_time DESC
        """, (contest_id,))
        
        conflicts = cursor.fetchall()
        
        # 转换日期时间
        for conflict in conflicts:
            for key, value in conflict.items():
                if isinstance(value, datetime):
                    conflict[key] = value.isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': conflicts
        }), 200
        
    except Exception as e:
        print(f"获取冲突列表错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取冲突列表失败: {str(e)}'
        }), 500


@app.route('/api/contests/<int:contest_id>/detect-conflicts', methods=['POST'])
def detect_conflicts(contest_id):
    """
    检测赛事冲突
    自动检测时间、场地、资源冲突
    """
    try:
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        # 获取当前赛事信息
        cursor.execute('SELECT * FROM contests WHERE id = %s', (contest_id,))
        current_contest = cursor.fetchone()
        
        if not current_contest:
            cursor.close()
            connection.close()
            return jsonify({
                'success': False,
                'message': '赛事不存在'
            }), 404
        
        detected_conflicts = []
        
        # 1. 检测时间冲突
        if current_contest['start_date'] and current_contest['end_date']:
            cursor.execute("""
                SELECT id, name, start_date, end_date 
                FROM contests 
                WHERE id != %s 
                AND status != 'rejected'
                AND start_date IS NOT NULL 
                AND end_date IS NOT NULL
                AND (
                    (start_date <= %s AND end_date >= %s) OR
                    (start_date <= %s AND end_date >= %s) OR
                    (start_date >= %s AND end_date <= %s)
                )
            """, (contest_id, 
                  current_contest['start_date'], current_contest['start_date'],
                  current_contest['end_date'], current_contest['end_date'],
                  current_contest['start_date'], current_contest['end_date']))
            
            time_conflicts = cursor.fetchall()
            
            for conflict in time_conflicts:
                detected_conflicts.append({
                    'type': 'time',
                    'with_id': conflict['id'],
                    'with_name': conflict['name'],
                    'description': f"与赛事《{conflict['name']}》时间冲突",
                    'severity': 'high'
                })
        
        # 2. 检测场地冲突
        cursor.execute("""
            SELECT name, address 
            FROM contest_venues 
            WHERE contest_id = %s
        """, (contest_id,))
        
        current_venues = cursor.fetchall()
        
        for venue in current_venues:
            cursor.execute("""
                SELECT DISTINCT c.id, c.name 
                FROM contest_venues v 
                JOIN contests c ON v.contest_id = c.id 
                WHERE c.id != %s 
                AND c.status != 'rejected'
                AND (v.name = %s OR v.address = %s)
                AND c.start_date IS NOT NULL 
                AND c.end_date IS NOT NULL
                AND (
                    (c.start_date <= %s AND c.end_date >= %s) OR
                    (c.start_date <= %s AND c.end_date >= %s)
                )
            """, (contest_id, venue['name'], venue['address'],
                  current_contest['start_date'], current_contest['start_date'],
                  current_contest['end_date'], current_contest['end_date']))
            
            venue_conflicts = cursor.fetchall()
            
            for conflict in venue_conflicts:
                detected_conflicts.append({
                    'type': 'venue',
                    'with_id': conflict['id'],
                    'with_name': conflict['name'],
                    'description': f"场地《{venue['name']}》与赛事《{conflict['name']}》冲突",
                    'severity': 'high'
                })
        
        # 3. 保存检测到的冲突
        connection.begin()
        
        # 先删除旧的未解决冲突
        cursor.execute("""
            DELETE FROM contest_conflicts 
            WHERE contest_id = %s AND is_resolved = FALSE
        """, (contest_id,))
        
        # 插入新检测到的冲突
        for conflict in detected_conflicts:
            cursor.execute("""
                INSERT INTO contest_conflicts 
                (contest_id, conflict_type, conflict_with_id, conflict_description, severity)
                VALUES (%s, %s, %s, %s, %s)
            """, (contest_id, conflict['type'], conflict['with_id'], 
                  conflict['description'], conflict['severity']))
            
            # 如果有冲突，创建通知
            cursor.execute("""
                INSERT INTO contest_notifications 
                (contest_id, notification_type, title, content)
                VALUES (%s, %s, %s, %s)
            """, (contest_id, 'conflict_alert', '检测到冲突', conflict['description']))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': f'冲突检测完成，发现 {len(detected_conflicts)} 个冲突',
            'data': {
                'total_conflicts': len(detected_conflicts),
                'conflicts': detected_conflicts
            }
        }), 200
        
    except Exception as e:
        if connection:
            connection.rollback()
            connection.close()
        print(f"检测冲突错误: {e}")
        return jsonify({
            'success': False,
            'message': f'检测冲突失败: {str(e)}'
        }), 500


@app.route('/api/conflicts/<int:conflict_id>/resolve', methods=['POST'])
def resolve_conflict(conflict_id):
    """
    解决冲突
    """
    try:
        data = request.get_json()
        resolution = data.get('resolution', '')
        
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE contest_conflicts 
            SET is_resolved = TRUE, resolution = %s, resolved_time = NOW()
            WHERE id = %s
        """, (resolution, conflict_id))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '冲突已标记为已解决'
        }), 200
        
    except Exception as e:
        print(f"解决冲突错误: {e}")
        return jsonify({
            'success': False,
            'message': f'解决冲突失败: {str(e)}'
        }), 500


# ==================== 通知管理 API ====================

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """
    获取通知列表
    """
    try:
        recipient = request.args.get('recipient')
        is_read = request.args.get('is_read')
        
        connection = get_connection()
        if not connection:
            return jsonify({
                'success': False,
                'message': '数据库连接失败'
            }), 500
        
        cursor = connection.cursor()
        
        query = "SELECT * FROM contest_notifications WHERE 1=1"
        params = []
        
        if recipient:
            query += " AND recipient = %s"
            params.append(recipient)
        
        if is_read is not None:
            query += " AND is_read = %s"
            params.append(bool(int(is_read)))
        
        query += " ORDER BY created_time DESC"
        
        cursor.execute(query, params)
        notifications = cursor.fetchall()
        
        # 转换日期时间
        for notification in notifications:
            if isinstance(notification.get('created_time'), datetime):
                notification['created_time'] = notification['created_time'].isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': notifications
        }), 200
        
    except Exception as e:
        print(f"获取通知错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取通知失败: {str(e)}'
        }), 500


# ==================== 学生管理API ====================

# 获取报名列表
@app.route('/api/registrations', methods=['GET'])
def get_registrations():
    """获取报名列表"""
    try:
        status = request.args.get('status', None)
        
        connection = get_connection()
        cursor = connection.cursor()
        
        if status:
            query = """
                SELECT r.*, c.name as contest_name
                FROM contest_registrations r
                LEFT JOIN contests c ON r.contest_id = c.id
                WHERE r.status = %s
                ORDER BY r.applied_at DESC
            """
            cursor.execute(query, (status,))
        else:
            query = """
                SELECT r.*, c.name as contest_name
                FROM contest_registrations r
                LEFT JOIN contests c ON r.contest_id = c.id
                ORDER BY r.applied_at DESC
            """
            cursor.execute(query)
        
        registrations = cursor.fetchall()
        
        # 处理JSON字段
        for reg in registrations:
            if reg.get('skills'):
                import json
                reg['skills'] = json.loads(reg['skills']) if isinstance(reg['skills'], str) else reg['skills']
            # 转换时间为字符串
            if reg.get('applied_at'):
                reg['applied_at'] = reg['applied_at'].isoformat() if hasattr(reg['applied_at'], 'isoformat') else str(reg['applied_at'])
            if reg.get('reviewed_at'):
                reg['reviewed_at'] = reg['reviewed_at'].isoformat() if hasattr(reg['reviewed_at'], 'isoformat') else str(reg['reviewed_at'])
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': registrations
        }), 200
        
    except Exception as e:
        print(f"获取报名列表错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取报名列表失败: {str(e)}'
        }), 500


# 审核报名（通过）
@app.route('/api/registrations/<int:registration_id>/approve', methods=['POST'])
def approve_registration(registration_id):
    """审核通过报名"""
    try:
        data = request.json or {}
        reviewer_name = data.get('reviewer_name', '管理员')
        
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE contest_registrations
            SET status = 'approved',
                reviewed_at = CURRENT_TIMESTAMP,
                reviewer_name = %s
            WHERE id = %s
        """, (reviewer_name, registration_id))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '审核通过'
        }), 200
        
    except Exception as e:
        print(f"审核通过错误: {e}")
        return jsonify({
            'success': False,
            'message': f'审核通过失败: {str(e)}'
        }), 500


# 审核报名（驳回）
@app.route('/api/registrations/<int:registration_id>/reject', methods=['POST'])
def reject_registration(registration_id):
    """驳回报名"""
    try:
        data = request.json
        reject_reason = data.get('reason', '')
        reviewer_name = data.get('reviewer_name', '管理员')
        
        if not reject_reason:
            return jsonify({
                'success': False,
                'message': '请填写驳回原因'
            }), 400
        
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE contest_registrations
            SET status = 'rejected',
                reject_reason = %s,
                reviewed_at = CURRENT_TIMESTAMP,
                reviewer_name = %s
            WHERE id = %s
        """, (reject_reason, reviewer_name, registration_id))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '已驳回'
        }), 200
        
    except Exception as e:
        print(f"驳回报名错误: {e}")
        return jsonify({
            'success': False,
            'message': f'驳回报名失败: {str(e)}'
        }), 500


# 批量审核通过
@app.route('/api/registrations/batch-approve', methods=['POST'])
def batch_approve_registrations():
    """批量审核通过"""
    try:
        data = request.json
        ids = data.get('ids', [])
        reviewer_name = data.get('reviewer_name', '管理员')
        
        if not ids:
            return jsonify({
                'success': False,
                'message': '请选择要审核的报名'
            }), 400
        
        connection = get_connection()
        cursor = connection.cursor()
        
        placeholders = ','.join(['%s'] * len(ids))
        cursor.execute(f"""
            UPDATE contest_registrations
            SET status = 'approved',
                reviewed_at = CURRENT_TIMESTAMP,
                reviewer_name = %s
            WHERE id IN ({placeholders})
        """, [reviewer_name] + ids)
        
        connection.commit()
        affected_rows = cursor.rowcount
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': f'已批量审核通过 {affected_rows} 个报名'
        }), 200
        
    except Exception as e:
        print(f"批量审核错误: {e}")
        return jsonify({
            'success': False,
            'message': f'批量审核失败: {str(e)}'
        }), 500


# 获取团队列表
@app.route('/api/teams', methods=['GET'])
def get_teams():
    """获取团队列表"""
    try:
        contest_id = request.args.get('contest_id', None)
        
        connection = get_connection()
        cursor = connection.cursor()
        
        if contest_id:
            cursor.execute("""
                SELECT t.*, c.name as contest_name
                FROM contest_teams t
                LEFT JOIN contests c ON t.contest_id = c.id
                WHERE t.contest_id = %s AND t.status != 'disbanded'
                ORDER BY t.created_at DESC
            """, (contest_id,))
        else:
            cursor.execute("""
                SELECT t.*, c.name as contest_name
                FROM contest_teams t
                LEFT JOIN contests c ON t.contest_id = c.id
                WHERE t.status != 'disbanded'
                ORDER BY t.created_at DESC
            """)
        
        teams = cursor.fetchall()
        
        # 获取每个团队的成员
        for team in teams:
            cursor.execute("""
                SELECT * FROM team_members
                WHERE team_id = %s
            """, (team['id'],))
            members = cursor.fetchall()
            team['members'] = members
            
            # 处理JSON字段
            import json
            if team.get('skills'):
                team['skills'] = json.loads(team['skills']) if isinstance(team['skills'], str) else team['skills']
            if team.get('achievements'):
                team['achievements'] = json.loads(team['achievements']) if isinstance(team['achievements'], str) else team['achievements']
            
            # 转换时间
            if team.get('created_at'):
                team['created_at'] = team['created_at'].isoformat() if hasattr(team['created_at'], 'isoformat') else str(team['created_at'])
            if team.get('updated_at'):
                team['updated_at'] = team['updated_at'].isoformat() if hasattr(team['updated_at'], 'isoformat') else str(team['updated_at'])
            
            for member in members:
                if member.get('joined_at'):
                    member['joined_at'] = member['joined_at'].isoformat() if hasattr(member['joined_at'], 'isoformat') else str(member['joined_at'])
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': teams
        }), 200
        
    except Exception as e:
        print(f"获取团队列表错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取团队列表失败: {str(e)}'
        }), 500


# 移除团队成员
@app.route('/api/teams/<int:team_id>/members/<int:member_id>', methods=['DELETE'])
def remove_team_member(team_id, member_id):
    """移除团队成员"""
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        # 删除成员
        cursor.execute("DELETE FROM team_members WHERE id = %s AND team_id = %s", (member_id, team_id))
        
        # 更新团队成员数量
        cursor.execute("UPDATE contest_teams SET member_count = member_count - 1 WHERE id = %s", (team_id,))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '成员已移除'
        }), 200
        
    except Exception as e:
        print(f"移除成员错误: {e}")
        return jsonify({
            'success': False,
            'message': f'移除成员失败: {str(e)}'
        }), 500


# 解散团队
@app.route('/api/teams/<int:team_id>', methods=['DELETE'])
def disband_team(team_id):
    """解散团队"""
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        # 标记为已解散
        cursor.execute("UPDATE contest_teams SET status = 'disbanded' WHERE id = %s", (team_id,))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '团队已解散'
        }), 200
        
    except Exception as e:
        print(f"解散团队错误: {e}")
        return jsonify({
            'success': False,
            'message': f'解散团队失败: {str(e)}'
        }), 500


# 获取学生列表
@app.route('/api/students', methods=['GET'])
def get_students():
    """获取学生列表"""
    try:
        grade = request.args.get('grade', None)
        major = request.args.get('major', None)
        
        connection = get_connection()
        cursor = connection.cursor()
        
        query = "SELECT * FROM students WHERE 1=1"
        params = []
        
        if grade:
            query += " AND grade = %s"
            params.append(grade)
        
        if major:
            query += " AND major = %s"
            params.append(major)
        
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, params)
        students = cursor.fetchall()
        
        # 为每个学生获取报名和团队信息
        for student in students:
            # 获取报名记录
            cursor.execute("""
                SELECT r.id, r.contest_id, c.name as name, r.status
                FROM contest_registrations r
                LEFT JOIN contests c ON r.contest_id = c.id
                WHERE r.student_id = %s
            """, (student['student_id'],))
            student['registeredContests'] = cursor.fetchall()
            
            # 获取团队信息
            cursor.execute("""
                SELECT tm.team_id, t.name, tm.role
                FROM team_members tm
                LEFT JOIN contest_teams t ON tm.team_id = t.id
                WHERE tm.student_id = %s AND t.status != 'disbanded'
            """, (student['student_id'],))
            student['teams'] = cursor.fetchall()
            
            # 处理JSON字段
            import json
            if student.get('skills'):
                student['skills'] = json.loads(student['skills']) if isinstance(student['skills'], str) else student['skills']
            if student.get('achievements'):
                student['achievements'] = json.loads(student['achievements']) if isinstance(student['achievements'], str) else student['achievements']
            
            # 转换时间
            if student.get('created_at'):
                student['created_at'] = student['created_at'].isoformat() if hasattr(student['created_at'], 'isoformat') else str(student['created_at'])
            if student.get('updated_at'):
                student['updated_at'] = student['updated_at'].isoformat() if hasattr(student['updated_at'], 'isoformat') else str(student['updated_at'])
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': students
        }), 200
        
    except Exception as e:
        print(f"获取学生列表错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取学生列表失败: {str(e)}'
        }), 500


# 获取学生详情
@app.route('/api/students/<student_id>', methods=['GET'])
def get_student_detail(student_id):
    """获取学生详情"""
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("SELECT * FROM students WHERE student_id = %s", (student_id,))
        student = cursor.fetchone()
        
        if not student:
            return jsonify({
                'success': False,
                'message': '学生不存在'
            }), 404
        
        # 获取报名记录
        cursor.execute("""
            SELECT r.*, c.name as contest_name
            FROM contest_registrations r
            LEFT JOIN contests c ON r.contest_id = c.id
            WHERE r.student_id = %s
        """, (student_id,))
        student['registeredContests'] = cursor.fetchall()
        
        # 获取团队信息
        cursor.execute("""
            SELECT tm.*, t.name as team_name
            FROM team_members tm
            LEFT JOIN contest_teams t ON tm.team_id = t.id
            WHERE tm.student_id = %s AND t.status != 'disbanded'
        """, (student_id,))
        student['teams'] = cursor.fetchall()
        
        # 处理JSON字段
        import json
        if student.get('skills'):
            student['skills'] = json.loads(student['skills']) if isinstance(student['skills'], str) else student['skills']
        if student.get('achievements'):
            student['achievements'] = json.loads(student['achievements']) if isinstance(student['achievements'], str) else student['achievements']
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': student
        }), 200
        
    except Exception as e:
        print(f"获取学生详情错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取学生详情失败: {str(e)}'
        }), 500


# ==================== 评审管理API ====================

# 获取专家列表
@app.route('/api/experts', methods=['GET'])
def get_experts():
    """获取专家列表"""
    try:
        field = request.args.get('field', None)
        status = request.args.get('status', 'active')
        
        connection = get_connection()
        cursor = connection.cursor()
        
        query = "SELECT * FROM experts WHERE status = %s"
        params = [status]
        
        if field:
            query += " AND field = %s"
            params.append(field)
        
        query += " ORDER BY rating DESC, review_count DESC"
        
        cursor.execute(query, params)
        experts = cursor.fetchall()
        
        # 处理JSON字段
        import json
        for expert in experts:
            if expert.get('expertise'):
                expert['expertise'] = json.loads(expert['expertise']) if isinstance(expert['expertise'], str) else expert['expertise']
            if expert.get('created_at'):
                expert['created_at'] = expert['created_at'].isoformat() if hasattr(expert['created_at'], 'isoformat') else str(expert['created_at'])
            if expert.get('updated_at'):
                expert['updated_at'] = expert['updated_at'].isoformat() if hasattr(expert['updated_at'], 'isoformat') else str(expert['updated_at'])
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': experts
        }), 200
        
    except Exception as e:
        print(f"获取专家列表错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取专家列表失败: {str(e)}'
        }), 500


# 添加专家
@app.route('/api/experts', methods=['POST'])
def add_expert():
    """添加专家"""
    try:
        data = request.json
        
        connection = get_connection()
        cursor = connection.cursor()
        
        import json
        cursor.execute("""
            INSERT INTO experts (name, title, organization, field, email, phone, expertise, experience, bio)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get('name'),
            data.get('title'),
            data.get('organization'),
            data.get('field'),
            data.get('email'),
            data.get('phone'),
            json.dumps(data.get('expertise', [])),
            data.get('experience', 0),
            data.get('bio', '')
        ))
        
        connection.commit()
        expert_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '专家添加成功',
            'data': {'id': expert_id}
        }), 201
        
    except Exception as e:
        print(f"添加专家错误: {e}")
        return jsonify({
            'success': False,
            'message': f'添加专家失败: {str(e)}'
        }), 500


# 获取评审分配列表
@app.route('/api/judge-assignments', methods=['GET'])
def get_judge_assignments():
    """获取评审分配列表"""
    try:
        contest_id = request.args.get('contest_id', None)
        status = request.args.get('status', None)
        
        connection = get_connection()
        cursor = connection.cursor()
        
        query = """
            SELECT 
                ja.*,
                e.name as expert_name,
                e.title as expert_title,
                e.organization as expert_organization,
                c.name as contest_name
            FROM judge_assignments ja
            LEFT JOIN experts e ON ja.expert_id = e.id
            LEFT JOIN contests c ON ja.contest_id = c.id
            WHERE 1=1
        """
        params = []
        
        if contest_id:
            query += " AND ja.contest_id = %s"
            params.append(contest_id)
        
        if status:
            query += " AND ja.status = %s"
            params.append(status)
        
        query += " ORDER BY ja.created_at DESC"
        
        cursor.execute(query, params)
        assignments = cursor.fetchall()
        
        # 转换时间
        for assignment in assignments:
            if assignment.get('assigned_date'):
                assignment['assigned_date'] = str(assignment['assigned_date'])
            if assignment.get('submitted_at'):
                assignment['submitted_at'] = assignment['submitted_at'].isoformat() if hasattr(assignment['submitted_at'], 'isoformat') else str(assignment['submitted_at'])
            if assignment.get('created_at'):
                assignment['created_at'] = assignment['created_at'].isoformat() if hasattr(assignment['created_at'], 'isoformat') else str(assignment['created_at'])
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': assignments
        }), 200
        
    except Exception as e:
        print(f"获取评审分配错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取评审分配失败: {str(e)}'
        }), 500


# 分配评审
@app.route('/api/judge-assignments', methods=['POST'])
def assign_judge():
    """分配评审"""
    try:
        data = request.json
        
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            INSERT INTO judge_assignments (contest_id, expert_id, role, assigned_date, status)
            VALUES (%s, %s, %s, CURDATE(), 'pending')
        """, (
            data.get('contest_id'),
            data.get('expert_id'),
            data.get('role', 'primary')
        ))
        
        connection.commit()
        assignment_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '评审分配成功',
            'data': {'id': assignment_id}
        }), 201
        
    except Exception as e:
        print(f"分配评审错误: {e}")
        return jsonify({
            'success': False,
            'message': f'分配评审失败: {str(e)}'
        }), 500


# 获取竞赛结果列表
@app.route('/api/contest-results', methods=['GET'])
def get_contest_results():
    """获取竞赛结果列表"""
    try:
        contest_id = request.args.get('contest_id', None)
        is_published = request.args.get('is_published', None)
        
        connection = get_connection()
        cursor = connection.cursor()
        
        query = """
            SELECT 
                cr.*,
                c.name as contest_name
            FROM contest_results cr
            LEFT JOIN contests c ON cr.contest_id = c.id
            WHERE 1=1
        """
        params = []
        
        if contest_id:
            query += " AND cr.contest_id = %s"
            params.append(contest_id)
        
        if is_published is not None:
            query += " AND cr.is_published = %s"
            params.append(1 if is_published == 'true' else 0)
        
        query += " ORDER BY cr.ranking ASC, cr.final_score DESC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        # 转换时间
        for result in results:
            if result.get('published_at'):
                result['published_at'] = result['published_at'].isoformat() if hasattr(result['published_at'], 'isoformat') else str(result['published_at'])
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat() if hasattr(result['created_at'], 'isoformat') else str(result['created_at'])
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': results
        }), 200
        
    except Exception as e:
        print(f"获取竞赛结果错误: {e}")
        return jsonify({
            'success': False,
            'message': f'获取竞赛结果失败: {str(e)}'
        }), 500


# 发布结果
@app.route('/api/contest-results/<int:result_id>/publish', methods=['POST'])
def publish_result(result_id):
    """发布竞赛结果"""
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE contest_results
            SET is_published = TRUE,
                published_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (result_id,))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': '结果已发布'
        }), 200
        
    except Exception as e:
        print(f"发布结果错误: {e}")
        return jsonify({
            'success': False,
            'message': f'发布结果失败: {str(e)}'
        }), 500


# 批量发布结果
@app.route('/api/contest-results/batch-publish', methods=['POST'])
def batch_publish_results():
    """批量发布结果"""
    try:
        data = request.json
        contest_id = data.get('contest_id')
        
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE contest_results
            SET is_published = TRUE,
                published_at = CURRENT_TIMESTAMP
            WHERE contest_id = %s AND is_published = FALSE
        """, (contest_id,))
        
        connection.commit()
        affected_rows = cursor.rowcount
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': f'已发布 {affected_rows} 个结果'
        }), 200
        
    except Exception as e:
        print(f"批量发布错误: {e}")
        return jsonify({
            'success': False,
            'message': f'批量发布失败: {str(e)}'
        }), 500


if __name__ == '__main__':
    # 启动前先初始化数据库
    print("="*50)
    print("正在初始化数据库...")
    print("="*50)
    init_database()
    
    print("\n" + "="*50)
    print("🚀 启动Flask服务器...")
    print("📡 服务地址: http://localhost:5000")
    print("📊 API文档: ")
    print("\n【用户管理】")
    print("   - POST   /api/register                      - 用户注册")
    print("   - POST   /api/login                         - 用户登录")
    print("\n【赛事管理】")
    print("   - POST   /api/contests                      - 创建赛事")
    print("   - GET    /api/contests                      - 获取赛事列表")
    print("   - GET    /api/contests/<id>                 - 获取赛事详情")
    print("\n【审核管理】")
    print("   - POST   /api/contests/<id>/review          - 审核赛事")
    print("   - GET    /api/reviews                       - 获取审核记录")
    print("   - GET    /api/reviews/stats                 - 获取审核统计")
    print("\n【冲突检测】")
    print("   - GET    /api/contests/<id>/conflicts       - 获取冲突列表")
    print("   - POST   /api/contests/<id>/detect-conflicts- 检测冲突")
    print("   - POST   /api/conflicts/<id>/resolve        - 解决冲突")
    print("\n【通知管理】")
    print("   - GET    /api/notifications                 - 获取通知列表")
    print("\n【学生管理】")
    print("   - GET    /api/registrations                 - 获取报名列表")
    print("   - POST   /api/registrations/<id>/approve    - 审核通过")
    print("   - POST   /api/registrations/<id>/reject     - 驳回报名")
    print("   - POST   /api/registrations/batch-approve   - 批量审核")
    print("   - GET    /api/teams                         - 获取团队列表")
    print("   - DELETE /api/teams/<id>                    - 解散团队")
    print("   - DELETE /api/teams/<id>/members/<mid>      - 移除成员")
    print("   - GET    /api/students                      - 获取学生列表")
    print("   - GET    /api/students/<id>                 - 获取学生详情")
    print("\n【评审管理】")
    print("   - GET    /api/experts                       - 获取专家列表")
    print("   - POST   /api/experts                       - 添加专家")
    print("   - GET    /api/judge-assignments             - 获取评审分配")
    print("   - POST   /api/judge-assignments             - 分配评审")
    print("   - GET    /api/contest-results               - 获取竞赛结果")
    print("   - POST   /api/contest-results/<id>/publish  - 发布结果")
    print("   - POST   /api/contest-results/batch-publish - 批量发布")
    print("\n【系统】")
    print("   - GET    /api/health                        - 健康检查")
    print("   - GET    /api/test                          - 测试接口")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
