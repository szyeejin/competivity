const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

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

  try {
    await pool.query(createContestsTable);
    await pool.query(createBudgetTable);
    await pool.query(createVenueTable);
    await pool.query(createPersonnelTable);
    await pool.query(createEquipmentTable);
    await pool.query(createMaterialsTable);
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

// 启动服务器
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 数据库端口: ${dbConfig.port}`);
  });
});
