const mysql = require('mysql2/promise');
const crypto = require('crypto');

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
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查 users 表数据
    console.log('\n📊 检查 users 表数据：');
    const [users] = await connection.query('SELECT id, username, email, created_at FROM users');
    console.log(`   找到 ${users.length} 个用户`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}`);
    });
    
    // 2. 检查是否存在 666666@qq.com 用户
    const [targetUsers] = await connection.query(
      'SELECT id, username, email FROM users WHERE email = ?',
      ['666666@qq.com']
    );
    
    if (targetUsers.length === 0) {
      console.log('\n⚠️  用户 666666@qq.com 不存在，正在创建...');
      
      // 创建用户
      const hashedPassword = crypto.createHash('sha256').update('123456').digest('hex');
      await connection.query(
        'INSERT INTO users (username, email, password, school, student_id, phone) VALUES (?, ?, ?, ?, ?, ?)',
        ['测试用户', '666666@qq.com', hashedPassword, '测试学校', '666666', '13800138000']
      );
      console.log('✅ 用户创建成功！');
    } else {
      console.log(`\n✅ 找到用户: ${targetUsers[0].username} (${targetUsers[0].email})`);
      
      // 更新密码
      console.log('🔄 正在更新密码为 123456...');
      const hashedPassword = crypto.createHash('sha256').update('123456').digest('hex');
      await connection.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, '666666@qq.com']
      );
      console.log('✅ 密码更新成功！');
    }
    
    // 3. 验证密码是否正确
    console.log('\n🔐 验证登录...');
    const testPassword = crypto.createHash('sha256').update('123456').digest('hex');
    const [loginCheck] = await connection.query(
      'SELECT id, username, email FROM users WHERE email = ? AND password = ?',
      ['666666@qq.com', testPassword]
    );
    
    if (loginCheck.length > 0) {
      console.log('✅ 密码验证成功！可以使用以下信息登录：');
      console.log('   邮箱: 666666@qq.com');
      console.log('   密码: 123456');
    } else {
      console.log('❌ 密码验证失败');
    }
    
    // 4. 检查其他表的数据
    console.log('\n📊 检查其他表的数据：');
    
    const [contests] = await connection.query('SELECT COUNT(*) as count FROM contests');
    console.log(`   赛事数量: ${contests[0].count}`);
    
    const [students] = await connection.query('SELECT COUNT(*) as count FROM students');
    console.log(`   学生数量: ${students[0].count}`);
    
    const [registrations] = await connection.query('SELECT COUNT(*) as count FROM contest_registrations');
    console.log(`   报名数量: ${registrations[0].count}`);
    
    const [teams] = await connection.query('SELECT COUNT(*) as count FROM contest_teams');
    console.log(`   团队数量: ${teams[0].count}`);
    
    // 检查专家表是否存在
    try {
      const [experts] = await connection.query('SELECT COUNT(*) as count FROM experts');
      console.log(`   专家数量: ${experts[0].count}`);
    } catch (error) {
      console.log('   ⚠️  experts 表不存在，需要创建');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 数据库连接已关闭');
    }
  }
}

main();
