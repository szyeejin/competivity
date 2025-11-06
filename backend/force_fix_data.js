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
    console.log('✅ 数据库连接成功\n');
    
    // 先改字段类型为TEXT，这样可以存储任何字符串
    console.log('🔧 修改字段类型为TEXT...');
    await connection.query('ALTER TABLE students MODIFY COLUMN skills TEXT');
    await connection.query('ALTER TABLE students MODIFY COLUMN achievements TEXT');
    console.log('✅ 字段类型已修改为TEXT\n');
    
    // 获取所有学生
    const [students] = await connection.query('SELECT * FROM students');
    console.log(`📊 找到 ${students.length} 个学生\n`);
    
    // 修复每个学生的数据
    for (const student of students) {
      let skills = student.skills;
      let achievements = student.achievements;
      
      // 修复 skills
      if (skills) {
        if (typeof skills === 'string' && !skills.startsWith('[')) {
          const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
          skills = JSON.stringify(skillsArray);
        } else if (typeof skills === 'object') {
          // 如果是对象（Buffer），转为字符串再处理
          const skillsStr = skills.toString();
          if (!skillsStr.startsWith('[')) {
            const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(s => s);
            skills = JSON.stringify(skillsArray);
          } else {
            skills = skillsStr;
          }
        }
      } else {
        skills = '[]';
      }
      
      // 修复 achievements
      if (achievements) {
        if (typeof achievements === 'string' && !achievements.startsWith('[')) {
          const achievementsArray = achievements.split(',').map(s => s.trim()).filter(s => s);
          achievements = JSON.stringify(achievementsArray);
        } else if (typeof achievements === 'object') {
          const achievementsStr = achievements.toString();
          if (!achievementsStr.startsWith('[')) {
            const achievementsArray = achievementsStr.split(',').map(s => s.trim()).filter(s => s);
            achievements = JSON.stringify(achievementsArray);
          } else {
            achievements = achievementsStr;
          }
        }
      } else {
        achievements = '[]';
      }
      
      // 更新
      await connection.query(
        'UPDATE students SET skills = ?, achievements = ? WHERE id = ?',
        [skills, achievements, student.id]
      );
      console.log(`✅ 修复学生: ${student.name}`);
      console.log(`   skills: ${skills}`);
      console.log(`   achievements: ${achievements}\n`);
    }
    
    // 改回JSON类型
    console.log('🔧 修改字段类型回JSON...');
    await connection.query('ALTER TABLE students MODIFY COLUMN skills JSON');
    await connection.query('ALTER TABLE students MODIFY COLUMN achievements JSON');
    console.log('✅ 字段类型已改回JSON\n');
    
    // 修复报名表
    console.log('🔧 修复报名表...');
    await connection.query('ALTER TABLE contest_registrations MODIFY COLUMN skills TEXT');
    
    const [regs] = await connection.query('SELECT * FROM contest_registrations WHERE skills IS NOT NULL');
    for (const reg of regs) {
      let skills = reg.skills;
      if (skills) {
        if (typeof skills === 'string' && !skills.startsWith('[')) {
          const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
          skills = JSON.stringify(skillsArray);
        } else if (typeof skills === 'object') {
          const skillsStr = skills.toString();
          if (!skillsStr.startsWith('[')) {
            const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(s => s);
            skills = JSON.stringify(skillsArray);
          } else {
            skills = skillsStr;
          }
        }
        
        await connection.query(
          'UPDATE contest_registrations SET skills = ? WHERE id = ?',
          [skills, reg.id]
        );
        console.log(`✅ 修复报名: ${reg.student_name}`);
      }
    }
    
    await connection.query('ALTER TABLE contest_registrations MODIFY COLUMN skills JSON');
    console.log('✅ 报名表修复完成\n');
    
    console.log('🎉 所有数据修复完成！');
    
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
