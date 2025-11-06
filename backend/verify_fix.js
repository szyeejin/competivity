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
    
    // 检查表结构
    console.log('📋 检查 students 表结构：');
    const [columns] = await connection.query('SHOW COLUMNS FROM students');
    columns.forEach(col => {
      if (col.Field === 'skills' || col.Field === 'achievements') {
        console.log(`  ${col.Field}: ${col.Type}`);
      }
    });
    
    // 直接查询看看数据
    console.log('\n📊 查询修复后的数据：');
    const [students] = await connection.query('SELECT id, name, skills, achievements FROM students LIMIT 3');
    
    students.forEach(student => {
      console.log(`\n学生: ${student.name}`);
      console.log(`  skills (原始): ${student.skills}`);
      console.log(`  skills (类型): ${typeof student.skills}`);
      
      // 尝试解析
      try {
        const parsed = JSON.parse(student.skills);
        console.log(`  ✅ skills 解析成功: ${JSON.stringify(parsed)}`);
      } catch (e) {
        console.log(`  ❌ skills 解析失败: ${e.message}`);
      }
    });
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
