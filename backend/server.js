const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL 连接配置
const dbConfig = {
  host: 'localhost',
  port: 3305,
  user: 'root',
  password: 'syj17771493975',
  database: 'competition_system'
};

// 创建数据库连接池
let pool;

// 初始化数据库连接
async function initDatabase() {
  try {
    // 先连接不指定数据库，用于创建数据库
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // 创建数据库（如果不存在）
    await connection.query(`CREATE DATABASE IF NOT EXISTS competition_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ 数据库已创建或已存在');
    await connection.end();

    // 创建连接池
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 创建表结构
    await createTables();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

// 创建表结构
async function createTables() {
  const createContestsTable = `
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事表';
  `;

  const createBudgetTable = `
    CREATE TABLE IF NOT EXISTS contest_budget (
      id INT PRIMARY KEY AUTO_INCREMENT,
      contest_id INT NOT NULL,
      total DECIMAL(10, 2) DEFAULT 0 COMMENT '总预算',
      category_name VARCHAR(100) COMMENT '预算分类名称',
      category_amount DECIMAL(10, 2) COMMENT '分类金额',
      FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
      INDEX idx_contest_id (contest_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事预算表';
  `;

  const createVenueTable = `
    CREATE TABLE IF NOT EXISTS contest_venues (
      id INT PRIMARY KEY AUTO_INCREMENT,
      contest_id INT NOT NULL,
      name VARCHAR(255) NOT NULL COMMENT '场地名称',
      capacity INT COMMENT '容纳人数',
      address VARCHAR(500) COMMENT '详细地址',
      facilities JSON COMMENT '设施标签',
      FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
      INDEX idx_contest_id (contest_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事场地表';
  `;

  const createPersonnelTable = `
    CREATE TABLE IF NOT EXISTS contest_personnel (
      id INT PRIMARY KEY AUTO_INCREMENT,
      contest_id INT NOT NULL,
      role VARCHAR(50) NOT NULL COMMENT '角色类型: organizer/judge/volunteer',
      name VARCHAR(100) NOT NULL COMMENT '姓名',
      contact VARCHAR(100) COMMENT '联系方式',
      FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
      INDEX idx_contest_id (contest_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事人员表';
  `;

  const createEquipmentTable = `
    CREATE TABLE IF NOT EXISTS contest_equipment (
      id INT PRIMARY KEY AUTO_INCREMENT,
      contest_id INT NOT NULL,
      name VARCHAR(255) NOT NULL COMMENT '设备名称',
      quantity INT DEFAULT 1 COMMENT '数量',
      status ENUM('available', 'reserved', 'maintenance') DEFAULT 'available' COMMENT '状态',
      FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
      INDEX idx_contest_id (contest_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事设备表';
  `;

  const createMaterialsTable = `
    CREATE TABLE IF NOT EXISTS contest_materials (
      id INT PRIMARY KEY AUTO_INCREMENT,
      contest_id INT NOT NULL,
      name VARCHAR(255) NOT NULL COMMENT '物资名称',
      quantity VARCHAR(50) COMMENT '数量',
      unit VARCHAR(20) COMMENT '单位',
      FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
      INDEX idx_contest_id (contest_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事物资表';
  `;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL COMMENT '用户名',
      email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
      password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
      school VARCHAR(100) COMMENT '学校',
      student_id VARCHAR(50) COMMENT '学号',
      phone VARCHAR(20) COMMENT '手机号',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
  `;

  const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id VARCHAR(50) NOT NULL UNIQUE COMMENT '学号',
      name VARCHAR(100) NOT NULL COMMENT '姓名',
      email VARCHAR(100) COMMENT '邮箱',
      phone VARCHAR(20) COMMENT '手机号',
      major VARCHAR(100) COMMENT '专业',
      grade VARCHAR(20) COMMENT '年级',
      class_name VARCHAR(100) COMMENT '班级',
      gpa DECIMAL(3, 2) DEFAULT 0 COMMENT '绩点',
      skills JSON COMMENT '技能列表',
      achievements JSON COMMENT '成就列表',
      avatar VARCHAR(50) COMMENT '头像',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_student_id (student_id),
      INDEX idx_name (name),
      INDEX idx_grade (grade),
      INDEX idx_major (major)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生表';
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createContestsTable);
    await pool.query(createBudgetTable);
    await pool.query(createVenueTable);
    await pool.query(createPersonnelTable);
    await pool.query(createEquipmentTable);
    await pool.query(createMaterialsTable);
    await pool.query(createStudentsTable);
    console.log('✅ 数据表已创建');
  } catch (error) {
    console.error('❌ 创建表失败:', error);
    throw error;
  }
}

// ==================== API 路由 ====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// ==================== 用户认证 API ====================

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, school, student_id, phone } = req.body;

    // 检查邮箱是否已存在
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 简单的密码加密（实际项目应使用 bcrypt）
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // 插入用户数据
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, school, student_id, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, school || '', student_id || '', phone || '']
    );

    res.json({
      success: true,
      message: '注册成功',
      data: {
        id: result.insertId,
        username,
        email
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查询用户
    const [users] = await pool.query(
      'SELECT id, username, email, password, school, student_id, phone FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    const user = users[0];

    // 验证密码
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    if (user.password !== hashedPassword) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user;

    res.json({
      success: true,
      message: '登录成功',
      data: userInfo
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 创建赛事
app.post('/api/contests', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { basicInfo, resourceConfig } = req.body;
    
    // 1. 插入基础信息
    const [contestResult] = await connection.query(
      `INSERT INTO contests (
        name, type, start_date, end_date, 
        registration_start, registration_end, location, online_mode,
        first_prize, second_prize, third_prize, certificate, scholarship, rules
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        basicInfo.name,
        basicInfo.type,
        basicInfo.timeAndPlace.startDate || null,
        basicInfo.timeAndPlace.endDate || null,
        basicInfo.timeAndPlace.registrationStart || null,
        basicInfo.timeAndPlace.registrationEnd || null,
        basicInfo.timeAndPlace.location || null,
        basicInfo.timeAndPlace.onlineMode || false,
        basicInfo.incentives.firstPrize || null,
        basicInfo.incentives.secondPrize || null,
        basicInfo.incentives.thirdPrize || null,
        basicInfo.incentives.certificate || false,
        basicInfo.incentives.scholarship || null,
        basicInfo.rules || null
      ]
    );
    
    const contestId = contestResult.insertId;
    
    // 2. 插入预算信息
    if (resourceConfig.budget.total) {
      await connection.query(
        'INSERT INTO contest_budget (contest_id, total) VALUES (?, ?)',
        [contestId, resourceConfig.budget.total]
      );
      
      // 插入预算分类
      if (resourceConfig.budget.categories && resourceConfig.budget.categories.length > 0) {
        for (const category of resourceConfig.budget.categories) {
          await connection.query(
            'INSERT INTO contest_budget (contest_id, category_name, category_amount) VALUES (?, ?, ?)',
            [contestId, category.name, category.amount]
          );
        }
      }
    }
    
    // 3. 插入场地信息
    if (resourceConfig.venue && resourceConfig.venue.length > 0) {
      for (const venue of resourceConfig.venue) {
        await connection.query(
          'INSERT INTO contest_venues (contest_id, name, capacity, address, facilities) VALUES (?, ?, ?, ?, ?)',
          [contestId, venue.name, venue.capacity, venue.address, JSON.stringify(venue.facilities || [])]
        );
      }
    }
    
    // 4. 插入人员信息
    if (resourceConfig.personnel) {
      const personnel = [
        ...resourceConfig.personnel.organizers.map(p => ({ ...p, role: 'organizer' })),
        ...resourceConfig.personnel.judges.map(p => ({ ...p, role: 'judge' })),
        ...resourceConfig.personnel.volunteers.map(p => ({ ...p, role: 'volunteer' }))
      ];
      
      for (const person of personnel) {
        await connection.query(
          'INSERT INTO contest_personnel (contest_id, role, name, contact) VALUES (?, ?, ?, ?)',
          [contestId, person.role, person.name, person.contact]
        );
      }
    }
    
    // 5. 插入设备信息
    if (resourceConfig.equipment && resourceConfig.equipment.length > 0) {
      for (const equip of resourceConfig.equipment) {
        await connection.query(
          'INSERT INTO contest_equipment (contest_id, name, quantity, status) VALUES (?, ?, ?, ?)',
          [contestId, equip.name, equip.quantity, equip.status]
        );
      }
    }
    
    // 6. 插入物资信息
    if (resourceConfig.materials && resourceConfig.materials.length > 0) {
      for (const material of resourceConfig.materials) {
        await connection.query(
          'INSERT INTO contest_materials (contest_id, name, quantity, unit) VALUES (?, ?, ?, ?)',
          [contestId, material.name, material.quantity, material.unit]
        );
      }
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: '赛事创建成功',
      contestId: contestId
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('创建赛事失败:', error);
    res.status(500).json({
      success: false,
      message: '创建赛事失败',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// 获取所有赛事
app.get('/api/contests', async (req, res) => {
  try {
    const [contests] = await pool.query(
      'SELECT * FROM contests ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: contests
    });
  } catch (error) {
    console.error('获取赛事列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取赛事列表失败',
      error: error.message
    });
  }
});

// 获取单个赛事详情
app.get('/api/contests/:id', async (req, res) => {
  try {
    const contestId = req.params.id;
    
    // 获取基础信息
    const [contests] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    if (contests.length === 0) {
      return res.status(404).json({
        success: false,
        message: '赛事不存在'
      });
    }
    
    const contest = contests[0];
    
    // 获取预算信息
    const [budget] = await pool.query('SELECT * FROM contest_budget WHERE contest_id = ?', [contestId]);
    
    // 获取场地信息
    const [venues] = await pool.query('SELECT * FROM contest_venues WHERE contest_id = ?', [contestId]);
    
    // 获取人员信息
    const [personnel] = await pool.query('SELECT * FROM contest_personnel WHERE contest_id = ?', [contestId]);
    
    // 获取设备信息
    const [equipment] = await pool.query('SELECT * FROM contest_equipment WHERE contest_id = ?', [contestId]);
    
    // 获取物资信息
    const [materials] = await pool.query('SELECT * FROM contest_materials WHERE contest_id = ?', [contestId]);
    
    res.json({
      success: true,
      data: {
        ...contest,
        budget,
        venues,
        personnel,
        equipment,
        materials
      }
    });
  } catch (error) {
    console.error('获取赛事详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取赛事详情失败',
      error: error.message
    });
  }
});

// ==================== 学生管理 API ====================

// 获取学生列表
app.get('/api/students', async (req, res) => {
  try {
    const { grade, major } = req.query;
    
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];
    
    if (grade) {
      query += ' AND grade = ?';
      params.push(grade);
    }
    
    if (major) {
      query += ' AND major = ?';
      params.push(major);
    }
    
    query += ' ORDER BY student_id ASC';
    
    const [students] = await pool.query(query, params);
    
    // 处理 JSON 字段和数据类型转换
    const processedStudents = students.map(student => {
      // 安全处理JSON字段
      let skills = [];
      let achievements = [];
      
      if (student.skills) {
        if (typeof student.skills === 'string') {
          try {
            skills = JSON.parse(student.skills);
          } catch (e) {
            skills = [];
          }
        } else if (Array.isArray(student.skills)) {
          skills = student.skills;
        } else if (typeof student.skills === 'object') {
          // Buffer 或其他对象，转为字符串再解析
          try {
            skills = JSON.parse(student.skills.toString());
          } catch (e) {
            skills = [];
          }
        }
      }
      
      if (student.achievements) {
        if (typeof student.achievements === 'string') {
          try {
            achievements = JSON.parse(student.achievements);
          } catch (e) {
            achievements = [];
          }
        } else if (Array.isArray(student.achievements)) {
          achievements = student.achievements;
        } else if (typeof student.achievements === 'object') {
          try {
            achievements = JSON.parse(student.achievements.toString());
          } catch (e) {
            achievements = [];
          }
        }
      }
      
      return {
        ...student,
        id: student.id,
        gpa: parseFloat(student.gpa) || 0,
        skills,
        achievements,
        registeredContests: [],
        teams: [],
        class: student.class_name
      };
    });
    
    res.json({
      success: true,
      data: processedStudents
    });
  } catch (error) {
    console.error('获取学生列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学生列表失败',
      error: error.message
    });
  }
});

// 获取单个学生详情
app.get('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    const [students] = await pool.query('SELECT * FROM students WHERE id = ?', [studentId]);
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }
    
    const student = students[0];
    
    // 安全处理JSON字段
    let skills = [];
    let achievements = [];
    
    if (student.skills) {
      if (typeof student.skills === 'string') {
        try { skills = JSON.parse(student.skills); } catch (e) { skills = []; }
      } else if (Array.isArray(student.skills)) {
        skills = student.skills;
      } else if (typeof student.skills === 'object') {
        try { skills = JSON.parse(student.skills.toString()); } catch (e) { skills = []; }
      }
    }
    
    if (student.achievements) {
      if (typeof student.achievements === 'string') {
        try { achievements = JSON.parse(student.achievements); } catch (e) { achievements = []; }
      } else if (Array.isArray(student.achievements)) {
        achievements = student.achievements;
      } else if (typeof student.achievements === 'object') {
        try { achievements = JSON.parse(student.achievements.toString()); } catch (e) { achievements = []; }
      }
    }
    
    res.json({
      success: true,
      data: {
        ...student,
        gpa: parseFloat(student.gpa) || 0,
        skills,
        achievements,
        registeredContests: [],
        teams: [],
        class: student.class_name
      }
    });
  } catch (error) {
    console.error('获取学生详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学生详情失败',
      error: error.message
    });
  }
});

// ==================== 报名审核管理 API ====================

// 获取报名列表
app.get('/api/registrations', async (req, res) => {
  try {
    const { status, contest_id } = req.query;

    // 关联查询，获取赛事名称
    let query = `
      SELECT 
        cr.*,
        c.name as contest_name
      FROM contest_registrations cr
      LEFT JOIN contests c ON cr.contest_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND cr.status = ?';
      params.push(status);
    }

    if (contest_id) {
      query += ' AND cr.contest_id = ?';
      params.push(contest_id);
    }

    query += ' ORDER BY cr.created_at DESC';

    const [registrations] = await pool.query(query, params);

    // 处理 JSON 字段
    const processedRegistrations = registrations.map(reg => {
      let skills = [];
      if (reg.skills) {
        if (typeof reg.skills === 'string') {
          try { skills = JSON.parse(reg.skills); } catch (e) { skills = []; }
        } else if (Array.isArray(reg.skills)) {
          skills = reg.skills;
        } else if (typeof reg.skills === 'object') {
          try { skills = JSON.parse(reg.skills.toString()); } catch (e) { skills = []; }
        }
      }
      return { ...reg, skills };
    });

    res.json({
      success: true,
      data: processedRegistrations
    });
  } catch (error) {
    console.error('获取报名列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取报名列表失败',
      error: error.message
    });
  }
});

// 审核通过
app.post('/api/registrations/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_name } = req.body;

    await pool.query(
      'UPDATE contest_registrations SET status = ?, reviewer_name = ?, review_time = NOW() WHERE id = ?',
      ['approved', reviewer_name || '管理员', id]
    );

    res.json({
      success: true,
      message: '审核通过'
    });
  } catch (error) {
    console.error('审核失败:', error);
    res.status(500).json({
      success: false,
      message: '审核失败',
      error: error.message
    });
  }
});

// 审核驳回
app.post('/api/registrations/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_name, reject_reason } = req.body;

    await pool.query(
      'UPDATE contest_registrations SET status = ?, reviewer_name = ?, review_time = NOW(), reject_reason = ? WHERE id = ?',
      ['rejected', reviewer_name || '管理员', reject_reason, id]
    );

    res.json({
      success: true,
      message: '已驳回'
    });
  } catch (error) {
    console.error('驳回失败:', error);
    res.status(500).json({
      success: false,
      message: '驳回失败',
      error: error.message
    });
  }
});

// 批量审核通过
app.post('/api/registrations/batch-approve', async (req, res) => {
  try {
    const { ids, reviewer_name } = req.body;

    await pool.query(
      'UPDATE contest_registrations SET status = ?, reviewer_name = ?, review_time = NOW() WHERE id IN (?)',
      ['approved', reviewer_name || '管理员', ids]
    );

    res.json({
      success: true,
      message: `已批量通过 ${ids.length} 个申请`
    });
  } catch (error) {
    console.error('批量审核失败:', error);
    res.status(500).json({
      success: false,
      message: '批量审核失败',
      error: error.message
    });
  }
});

// ==================== 团队管理 API ====================

// 获取团队列表
app.get('/api/teams', async (req, res) => {
  try {
    const { contest_id, status } = req.query;

    // 关联查询，获取赛事名称
    let query = `
      SELECT 
        ct.*,
        c.name as contest_name
      FROM contest_teams ct
      LEFT JOIN contests c ON ct.contest_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (contest_id) {
      query += ' AND ct.contest_id = ?';
      params.push(contest_id);
    }

    if (status) {
      query += ' AND ct.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ct.created_at DESC';

    const [teams] = await pool.query(query, params);

    // 处理 JSON 字段
    const processedTeams = teams.map(team => {
      let skills = [];
      let achievements = [];
      
      if (team.skills) {
        if (typeof team.skills === 'string') {
          try { skills = JSON.parse(team.skills); } catch (e) { skills = []; }
        } else if (Array.isArray(team.skills)) {
          skills = team.skills;
        } else if (typeof team.skills === 'object') {
          try { skills = JSON.parse(team.skills.toString()); } catch (e) { skills = []; }
        }
      }
      
      if (team.achievements) {
        if (typeof team.achievements === 'string') {
          try { achievements = JSON.parse(team.achievements); } catch (e) { achievements = []; }
        } else if (Array.isArray(team.achievements)) {
          achievements = team.achievements;
        } else if (typeof team.achievements === 'object') {
          try { achievements = JSON.parse(team.achievements.toString()); } catch (e) { achievements = []; }
        }
      }
      
      return { ...team, skills, achievements };
    });

    res.json({
      success: true,
      data: processedTeams
    });
  } catch (error) {
    console.error('获取团队列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取团队列表失败',
      error: error.message
    });
  }
});

// 获取团队详情（包括成员）
app.get('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [teams] = await pool.query('SELECT * FROM contest_teams WHERE id = ?', [id]);

    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: '团队不存在'
      });
    }

    const team = teams[0];

    // 获取团队成员
    const [members] = await pool.query('SELECT * FROM team_members WHERE team_id = ?', [id]);

    // 安全处理JSON字段
    let skills = [];
    let achievements = [];
    
    if (team.skills) {
      if (typeof team.skills === 'string') {
        try { skills = JSON.parse(team.skills); } catch (e) { skills = []; }
      } else if (Array.isArray(team.skills)) {
        skills = team.skills;
      } else if (typeof team.skills === 'object') {
        try { skills = JSON.parse(team.skills.toString()); } catch (e) { skills = []; }
      }
    }
    
    if (team.achievements) {
      if (typeof team.achievements === 'string') {
        try { achievements = JSON.parse(team.achievements); } catch (e) { achievements = []; }
      } else if (Array.isArray(team.achievements)) {
        achievements = team.achievements;
      } else if (typeof team.achievements === 'object') {
        try { achievements = JSON.parse(team.achievements.toString()); } catch (e) { achievements = []; }
      }
    }

    res.json({
      success: true,
      data: {
        ...team,
        skills,
        achievements,
        members: members
      }
    });
  } catch (error) {
    console.error('获取团队详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取团队详情失败',
      error: error.message
    });
  }
});

// 删除团队
app.delete('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 先删除团队成员
    await pool.query('DELETE FROM team_members WHERE team_id = ?', [id]);

    // 再删除团队
    await pool.query('DELETE FROM contest_teams WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '团队已删除'
    });
  } catch (error) {
    console.error('删除团队失败:', error);
    res.status(500).json({
      success: false,
      message: '删除团队失败',
      error: error.message
    });
  }
});

// 移除团队成员
app.delete('/api/teams/:teamId/members/:memberId', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    await pool.query('DELETE FROM team_members WHERE id = ? AND team_id = ?', [memberId, teamId]);

    // 更新团队成员数量
    await pool.query(
      'UPDATE contest_teams SET member_count = member_count - 1 WHERE id = ?',
      [teamId]
    );

    res.json({
      success: true,
      message: '成员已移除'
    });
  } catch (error) {
    console.error('移除成员失败:', error);
    res.status(500).json({
      success: false,
      message: '移除成员失败',
      error: error.message
    });
  }
});

// ==================== 专家管理 API ====================

// 获取专家列表
app.get('/api/experts', async (req, res) => {
  try {
    const [experts] = await pool.query('SELECT * FROM experts ORDER BY created_at DESC');
    
    res.json({
      success: true,
      data: experts
    });
  } catch (error) {
    console.error('获取专家列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取专家列表失败',
      error: error.message
    });
  }
});

// 添加专家
app.post('/api/experts', async (req, res) => {
  try {
    const { name, field, phone, email, level, title } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO experts (name, field, phone, email, level, title) VALUES (?, ?, ?, ?, ?, ?)',
      [name, field, phone, email, level || 'senior', title || '']
    );
    
    res.json({
      success: true,
      message: '专家添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('添加专家失败:', error);
    res.status(500).json({
      success: false,
      message: '添加专家失败',
      error: error.message
    });
  }
});

// 获取评审分配列表
app.get('/api/judge-assignments', async (req, res) => {
  try {
    const { contest_id } = req.query;
    
    let query = `
      SELECT 
        ja.*,
        c.name as contest_name,
        e.name as expert_name
      FROM judge_assignments ja
      LEFT JOIN contests c ON ja.contest_id = c.id
      LEFT JOIN experts e ON ja.expert_id = e.id
      WHERE 1=1
    `;
    const params = [];
    
    if (contest_id) {
      query += ' AND ja.contest_id = ?';
      params.push(contest_id);
    }
    
    query += ' ORDER BY ja.created_at DESC';
    
    const [assignments] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('获取评审分配列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取评审分配列表失败',
      error: error.message
    });
  }
});

// 分配评审
app.post('/api/judge-assignments', async (req, res) => {
  try {
    const { contest_id, expert_id, role } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO judge_assignments (contest_id, expert_id, role, status) VALUES (?, ?, ?, ?)',
      [contest_id, expert_id, role || 'judge', 'assigned']
    );
    
    res.json({
      success: true,
      message: '评审分配成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('分配评审失败:', error);
    res.status(500).json({
      success: false,
      message: '分配评审失败',
      error: error.message
    });
  }
});

// 获取比赛结果列表
app.get('/api/contest-results', async (req, res) => {
  try {
    const { contest_id } = req.query;
    
    let query = `
      SELECT 
        cr.*,
        c.name as contest_name
      FROM contest_results cr
      LEFT JOIN contests c ON cr.contest_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (contest_id) {
      query += ' AND cr.contest_id = ?';
      params.push(contest_id);
    }
    
    query += ' ORDER BY cr.rank ASC';
    
    const [results] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('获取比赛结果失败:', error);
    res.status(500).json({
      success: false,
      message: '获取比赛结果失败',
      error: error.message
    });
  }
});

// 发布单个结果
app.post('/api/contest-results/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE contest_results SET is_published = 1 WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: '结果已发布'
    });
  } catch (error) {
    console.error('发布结果失败:', error);
    res.status(500).json({
      success: false,
      message: '发布结果失败',
      error: error.message
    });
  }
});

// 批量发布结果
app.post('/api/contest-results/batch-publish', async (req, res) => {
  try {
    const { ids } = req.body;
    
    await pool.query(
      'UPDATE contest_results SET is_published = 1 WHERE id IN (?)',
      [ids]
    );
    
    res.json({
      success: true,
      message: `已批量发布 ${ids.length} 个结果`
    });
  } catch (error) {
    console.error('批量发布失败:', error);
    res.status(500).json({
      success: false,
      message: '批量发布失败',
      error: error.message
    });
  }
});

// 启动服务器
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 数据库端口: ${dbConfig.port}`);
  });
});
