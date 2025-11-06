-- 修复专家表结构
-- 删除旧表并重新创建

USE competition_system;

-- 删除评审管理相关的表（按依赖顺序）
DROP TABLE IF EXISTS judge_assignments;
DROP TABLE IF EXISTS contest_results;
DROP TABLE IF EXISTS experts;

-- 重新创建专家表（完整结构）
CREATE TABLE experts (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专家库表';

-- 重新创建评审分配表
CREATE TABLE judge_assignments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评审分配表';

-- 重新创建结果表
CREATE TABLE contest_results (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='竞赛结果表';

SELECT '✅ 表结构修复完成！' as message;
