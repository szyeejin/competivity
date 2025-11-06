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
    
    console.log('📋 检查 contest_registrations 表结构：\n');
    const [columns] = await connection.query('SHOW COLUMNS FROM contest_registrations');
    
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type}`);
    });
    
    // 检查是否有created_at字段
    const hasCreatedAt = columns.some(col => col.Field === 'created_at');
    
    if (!hasCreatedAt) {
      console.log('\n⚠️  缺少 created_at 字段，正在添加...');
      await connection.query(`
        ALTER TABLE contest_registrations 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ 字段已添加！');
    } else {
      console.log('\n✅ created_at 字段已存在');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
