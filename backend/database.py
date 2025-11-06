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
    初始化数据库和所有表结构
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
        print(f"✅ 数据库 '{DATABASE_NAME}' 已创建或已存在")
        
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表'
        """
        cursor.execute(create_users_table)
        print("✅ 用户表已创建")
        
        # 创建赛事表
        create_contests_table = """
        CREATE TABLE IF NOT EXISTS contests (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL COMMENT '赛事名称',
            type VARCHAR(50) NOT NULL COMMENT '赛事类型',
            start_date DATETIME COMMENT '赛事开始时间',
            end_date DATETIME COMMENT '赛事结束时间',
            registration_start DATETIME COMMENT '报名开始时间',
            registration_end DATETIME COMMENT '报名截止时间',
            location VARCHAR(500) COMMENT '赛事地点',
            online_mode BOOLEAN DEFAULT FALSE COMMENT '是否线上赛事',
            first_prize VARCHAR(255) COMMENT '一等奖',
            second_prize VARCHAR(255) COMMENT '二等奖',
            third_prize VARCHAR(255) COMMENT '三等奖',
            certificate BOOLEAN DEFAULT FALSE COMMENT '是否颁发证书',
            scholarship VARCHAR(255) COMMENT '其他奖励',
            rules TEXT COMMENT '赛事规则',
            status ENUM('draft', 'published', 'ongoing', 'completed', 'archived') DEFAULT 'draft' COMMENT '赛事状态',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_name (name),
            INDEX idx_type (type),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事表'
        """
        cursor.execute(create_contests_table)
        print("✅ 赛事表已创建")
        
        # 创建预算表
        create_budget_table = """
        CREATE TABLE IF NOT EXISTS contest_budget (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            total DECIMAL(10, 2) DEFAULT 0 COMMENT '总预算',
            category_name VARCHAR(100) COMMENT '预算分类名称',
            category_amount DECIMAL(10, 2) COMMENT '分类金额',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事预算表'
        """
        cursor.execute(create_budget_table)
        print("✅ 预算表已创建")
        
        # 创建场地表
        create_venue_table = """
        CREATE TABLE IF NOT EXISTS contest_venues (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            name VARCHAR(255) NOT NULL COMMENT '场地名称',
            capacity INT COMMENT '容纳人数',
            address VARCHAR(500) COMMENT '详细地址',
            facilities JSON COMMENT '设施标签',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事场地表'
        """
        cursor.execute(create_venue_table)
        print("✅ 场地表已创建")
        
        # 创建人员表
        create_personnel_table = """
        CREATE TABLE IF NOT EXISTS contest_personnel (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            role VARCHAR(50) NOT NULL COMMENT '角色类型: organizer/judge/volunteer',
            name VARCHAR(100) NOT NULL COMMENT '姓名',
            contact VARCHAR(100) COMMENT '联系方式',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事人员表'
        """
        cursor.execute(create_personnel_table)
        print("✅ 人员表已创建")
        
        # 创建设备表
        create_equipment_table = """
        CREATE TABLE IF NOT EXISTS contest_equipment (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            name VARCHAR(255) NOT NULL COMMENT '设备名称',
            quantity INT DEFAULT 1 COMMENT '数量',
            status ENUM('available', 'reserved', 'maintenance') DEFAULT 'available' COMMENT '状态',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事设备表'
        """
        cursor.execute(create_equipment_table)
        print("✅ 设备表已创建")
        
        # 创建物资表
        create_materials_table = """
        CREATE TABLE IF NOT EXISTS contest_materials (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            name VARCHAR(255) NOT NULL COMMENT '物资名称',
            quantity VARCHAR(50) COMMENT '数量',
            unit VARCHAR(20) COMMENT '单位',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事物资表'
        """
        cursor.execute(create_materials_table)
        print("✅ 物资表已创建")
        
        # 创建审核记录表
        create_reviews_table = """
        CREATE TABLE IF NOT EXISTS contest_reviews (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            reviewer_name VARCHAR(100) COMMENT '审核员姓名',
            review_result ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核结果',
            review_comment TEXT COMMENT '审核意见',
            review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '审核时间',
            compliance_check BOOLEAN DEFAULT TRUE COMMENT '合规性检查',
            budget_check BOOLEAN DEFAULT TRUE COMMENT '预算检查',
            resource_check BOOLEAN DEFAULT TRUE COMMENT '资源检查',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id),
            INDEX idx_review_result (review_result),
            INDEX idx_review_time (review_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审核记录表'
        """
        cursor.execute(create_reviews_table)
        print("✅ 审核记录表已创建")
        
        # 创建冲突检测表
        create_conflicts_table = """
        CREATE TABLE IF NOT EXISTS contest_conflicts (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            conflict_type ENUM('time', 'venue', 'resource', 'personnel') NOT NULL COMMENT '冲突类型',
            conflict_with_id INT COMMENT '冲突的赛事ID',
            conflict_description TEXT COMMENT '冲突描述',
            severity ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '严重程度',
            is_resolved BOOLEAN DEFAULT FALSE COMMENT '是否已解决',
            resolution TEXT COMMENT '解决方案',
            detected_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '检测时间',
            resolved_time TIMESTAMP NULL COMMENT '解决时间',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id),
            INDEX idx_conflict_type (conflict_type),
            INDEX idx_is_resolved (is_resolved)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='冲突检测表'
        """
        cursor.execute(create_conflicts_table)
        print("✅ 冲突检测表已创建")
        
        # 创建通知表
        create_notifications_table = """
        CREATE TABLE IF NOT EXISTS contest_notifications (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            notification_type ENUM('status_change', 'conflict_alert', 'review_result', 'system') DEFAULT 'system' COMMENT '通知类型',
            title VARCHAR(255) NOT NULL COMMENT '通知标题',
            content TEXT COMMENT '通知内容',
            recipient VARCHAR(100) COMMENT '接收人',
            is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
            created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id),
            INDEX idx_recipient (recipient),
            INDEX idx_is_read (is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表'
        """
        cursor.execute(create_notifications_table)
        print("✅ 通知表已创建")
        
        # 创建学生报名表
        create_registrations_table = """
        CREATE TABLE IF NOT EXISTS contest_registrations (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            student_name VARCHAR(100) NOT NULL COMMENT '学生姓名',
            student_id VARCHAR(50) NOT NULL COMMENT '学号',
            email VARCHAR(100) NOT NULL COMMENT '邮箱',
            phone VARCHAR(20) COMMENT '手机号',
            major VARCHAR(100) COMMENT '专业',
            grade VARCHAR(20) COMMENT '年级',
            class_name VARCHAR(50) COMMENT '班级',
            team_name VARCHAR(100) COMMENT '团队名称',
            team_role VARCHAR(50) COMMENT '团队角色',
            skills JSON COMMENT '技能列表',
            experience TEXT COMMENT '竞赛经验',
            motivation TEXT COMMENT '参赛动机',
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态',
            reject_reason TEXT COMMENT '驳回原因',
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
            reviewed_at TIMESTAMP NULL COMMENT '审核时间',
            reviewer_name VARCHAR(100) COMMENT '审核人',
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id),
            INDEX idx_student_id (student_id),
            INDEX idx_status (status),
            INDEX idx_applied_at (applied_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报名申请表'
        """
        cursor.execute(create_registrations_table)
        print("✅ 报名申请表已创建")
        
        # 创建团队表
        create_teams_table = """
        CREATE TABLE IF NOT EXISTS contest_teams (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL,
            name VARCHAR(100) NOT NULL COMMENT '团队名称',
            captain_name VARCHAR(100) NOT NULL COMMENT '队长姓名',
            captain_student_id VARCHAR(50) NOT NULL COMMENT '队长学号',
            captain_major VARCHAR(100) COMMENT '队长专业',
            max_members INT DEFAULT 5 COMMENT '最大成员数',
            member_count INT DEFAULT 1 COMMENT '当前成员数',
            status ENUM('recruiting', 'active', 'disbanded') DEFAULT 'recruiting' COMMENT '团队状态',
            skills JSON COMMENT '团队技能',
            achievements JSON COMMENT '团队成就',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id),
            INDEX idx_captain_student_id (captain_student_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队表'
        """
        cursor.execute(create_teams_table)
        print("✅ 团队表已创建")
        
        # 创建团队成员表
        create_team_members_table = """
        CREATE TABLE IF NOT EXISTS team_members (
            id INT PRIMARY KEY AUTO_INCREMENT,
            team_id INT NOT NULL,
            student_name VARCHAR(100) NOT NULL COMMENT '学生姓名',
            student_id VARCHAR(50) NOT NULL COMMENT '学号',
            major VARCHAR(100) COMMENT '专业',
            role VARCHAR(50) DEFAULT '队员' COMMENT '角色',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
            FOREIGN KEY (team_id) REFERENCES contest_teams(id) ON DELETE CASCADE,
            INDEX idx_team_id (team_id),
            INDEX idx_student_id (student_id),
            UNIQUE KEY uk_team_student (team_id, student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队成员表'
        """
        cursor.execute(create_team_members_table)
        print("✅ 团队成员表已创建")
        
        # 创建学生信息扩展表
        create_students_table = """
        CREATE TABLE IF NOT EXISTS students (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id VARCHAR(50) NOT NULL UNIQUE COMMENT '学号',
            name VARCHAR(100) NOT NULL COMMENT '姓名',
            email VARCHAR(100) NOT NULL COMMENT '邮箱',
            phone VARCHAR(20) COMMENT '手机号',
            major VARCHAR(100) COMMENT '专业',
            grade VARCHAR(20) COMMENT '年级',
            class_name VARCHAR(50) COMMENT '班级',
            gpa DECIMAL(3, 2) COMMENT 'GPA成绩',
            skills JSON COMMENT '技能列表',
            achievements JSON COMMENT '获奖成就',
            avatar VARCHAR(255) DEFAULT '👨‍🎓' COMMENT '头像',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_student_id (student_id),
            INDEX idx_name (name),
            INDEX idx_grade (grade),
            INDEX idx_major (major)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生信息表'
        """
        cursor.execute(create_students_table)
        print("✅ 学生信息表已创建")
        
        # 创建专家库表
        create_experts_table = """
        CREATE TABLE IF NOT EXISTS experts (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL COMMENT '专家姓名',
            title VARCHAR(100) COMMENT '职称',
            organization VARCHAR(200) COMMENT '所属单位',
            field VARCHAR(100) COMMENT '专业领域',
            email VARCHAR(100) COMMENT '邮箱',
            phone VARCHAR(20) COMMENT '手机号',
            expertise JSON COMMENT '擅长领域列表',
            experience INT DEFAULT 0 COMMENT '评审经验（年）',
            rating DECIMAL(3, 2) DEFAULT 5.0 COMMENT '评分（满分5分）',
            review_count INT DEFAULT 0 COMMENT '评审次数',
            status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
            bio TEXT COMMENT '个人简介',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_name (name),
            INDEX idx_field (field),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专家库表'
        """
        cursor.execute(create_experts_table)
        print("✅ 专家库表已创建")
        
        # 创建评审分配表
        create_judge_assignments_table = """
        CREATE TABLE IF NOT EXISTS judge_assignments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL COMMENT '赛事ID',
            expert_id INT NOT NULL COMMENT '专家ID',
            role ENUM('primary', 'secondary', 'reviewer') DEFAULT 'primary' COMMENT '评审角色',
            assigned_date DATE COMMENT '分配日期',
            status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending' COMMENT '状态',
            score DECIMAL(5, 2) COMMENT '给出的分数',
            comments TEXT COMMENT '评审意见',
            submitted_at TIMESTAMP NULL COMMENT '提交时间',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id),
            INDEX idx_expert_id (expert_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评审分配表'
        """
        cursor.execute(create_judge_assignments_table)
        print("✅ 评审分配表已创建")
        
        # 创建结果公示表
        create_results_table = """
        CREATE TABLE IF NOT EXISTS contest_results (
            id INT PRIMARY KEY AUTO_INCREMENT,
            contest_id INT NOT NULL COMMENT '赛事ID',
            team_name VARCHAR(100) COMMENT '团队名称',
            student_name VARCHAR(100) COMMENT '学生姓名',
            student_id VARCHAR(50) COMMENT '学号',
            award_level ENUM('first', 'second', 'third', 'excellence', 'participation') COMMENT '奖项等级',
            final_score DECIMAL(5, 2) COMMENT '最终得分',
            ranking INT COMMENT '排名',
            certificate_number VARCHAR(100) COMMENT '证书编号',
            remarks TEXT COMMENT '备注',
            is_published BOOLEAN DEFAULT FALSE COMMENT '是否已公示',
            published_at TIMESTAMP NULL COMMENT '公示时间',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            INDEX idx_contest_id (contest_id),
            INDEX idx_award_level (award_level),
            INDEX idx_is_published (is_published)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞赛结果表'
        """
        cursor.execute(create_results_table)
        print("✅ 竞赛结果表已创建")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("✅ 数据库初始化完成！")
        return True
        
    except Error as e:
        print(f"❌ 数据库初始化错误: {e}")
        return False


if __name__ == '__main__':
    # 直接运行此文件可以初始化数据库
    init_database()
