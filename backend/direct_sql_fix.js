const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3305,
  user: 'root',
  password: 'syj17771493975',
  database: 'competition_system'
};

async function main() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接成功\n');
    
    // 直接用SQL CAST检查
    console.log('📊 检查原始数据 (使用CAST)：');
    const [raw] = await connection.query(`
      SELECT id, name, 
        CAST(skills AS CHAR) as skills_text,
        CAST(achievements AS CHAR) as achievements_text
      FROM students LIMIT 2
    `);
    
    raw.forEach(r => {
      console.log(`${r.name}:`);
      console.log(`  skills: ${r.skills_text}`);
      console.log(`  achievements: ${r.achievements_text}\n`);
    });
    
    // 强制更新 - 使用CAST转换
    console.log('🔧 使用直接SQL更新...\n');
    
    const updates = [
      { id: 1, name: '张三', skills: '["Python","Java","C++","算法"]', achievements: '["ACM铜牌","校赛一等奖"]' },
      { id: 2, name: '李四', skills: '["MATLAB","数据分析","Python"]', achievements: '["数学建模省赛二等奖"]' },
      { id: 3, name: '王五', skills: '["机器学习","深度学习","Python","TensorFlow"]', achievements: '["互联网+省赛银奖","AI竞赛金奖"]' },
      { id: 4, name: '赵六', skills: '["高等数学","线性代数"]', achievements: '[]' },
      { id: 5, name: '赵明', skills: '["Java","算法设计","数据结构"]', achievements: '["程序设计竞赛二等奖"]' },
      { id: 6, name: '孙丽', skills: '["Web开发","前端技术","JavaScript"]', achievements: '["创新项目三等奖"]' },
      { id: 7, name: '周强', skills: '["网络安全","Linux","Python"]', achievements: '["信息安全竞赛优秀奖"]' },
      { id: 8, name: '刘洋', skills: '["商业策划","市场营销","数据分析"]', achievements: '["创业计划大赛银奖"]' }
    ];
    
    for (const u of updates) {
      await connection.query(
        `UPDATE students SET skills = CAST(? AS JSON), achievements = CAST(? AS JSON) WHERE id = ?`,
        [u.skills, u.achievements, u.id]
      );
      console.log(`✅ 更新: ${u.name}`);
    }
    
    console.log('\n🎉 更新完成！\n');
    
    // 验证
    console.log('✅ 验证更新结果：');
    const [updated] = await connection.query(`
      SELECT id, name, 
        CAST(skills AS CHAR) as skills_text
      FROM students LIMIT 3
    `);
    
    updated.forEach(r => {
      console.log(`${r.name}: ${r.skills_text}`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
