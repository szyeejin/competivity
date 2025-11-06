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
    
    // 1. 检查学生表数据
    console.log('📊 检查学生表数据：');
    const [students] = await connection.query('SELECT id, name, student_id, skills, achievements FROM students LIMIT 5');
    
    students.forEach(student => {
      console.log(`\n学生 ID: ${student.id}, 姓名: ${student.name}`);
      console.log(`  skills: ${student.skills}`);
      console.log(`  achievements: ${student.achievements}`);
      
      // 检查是否是有效的JSON
      try {
        if (student.skills) JSON.parse(student.skills);
        console.log('  ✅ skills 是有效的JSON');
      } catch (e) {
        console.log('  ❌ skills 不是有效的JSON');
      }
      
      try {
        if (student.achievements) JSON.parse(student.achievements);
        console.log('  ✅ achievements 是有效的JSON');
      } catch (e) {
        console.log('  ❌ achievements 不是有效的JSON');
      }
    });
    
    // 2. 修复学生数据
    console.log('\n\n🔧 修复学生数据...');
    const [allStudents] = await connection.query('SELECT * FROM students');
    
    for (const student of allStudents) {
      let needUpdate = false;
      let skills = student.skills;
      let achievements = student.achievements;
      
      // 修复 skills
      if (skills && typeof skills === 'string') {
        try {
          JSON.parse(skills);
        } catch (e) {
          // 不是JSON，转换为JSON数组
          const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
          skills = JSON.stringify(skillsArray);
          needUpdate = true;
          console.log(`  修复学生 ${student.name} 的 skills`);
        }
      } else if (!skills) {
        skills = '[]';
        needUpdate = true;
      }
      
      // 修复 achievements
      if (achievements && typeof achievements === 'string') {
        try {
          JSON.parse(achievements);
        } catch (e) {
          // 不是JSON，转换为JSON数组
          const achievementsArray = achievements.split(',').map(s => s.trim()).filter(s => s);
          achievements = JSON.stringify(achievementsArray);
          needUpdate = true;
          console.log(`  修复学生 ${student.name} 的 achievements`);
        }
      } else if (!achievements) {
        achievements = '[]';
        needUpdate = true;
      }
      
      if (needUpdate) {
        await connection.query(
          'UPDATE students SET skills = ?, achievements = ? WHERE id = ?',
          [skills, achievements, student.id]
        );
      }
    }
    
    console.log('✅ 学生数据修复完成！');
    
    // 3. 检查报名表数据
    console.log('\n📊 检查报名表数据：');
    const [registrations] = await connection.query('SELECT id, student_name, contest_id, status FROM contest_registrations LIMIT 5');
    console.log(`  找到 ${registrations.length} 条报名记录`);
    registrations.forEach(reg => {
      console.log(`  - ${reg.student_name}, 赛事ID: ${reg.contest_id}, 状态: ${reg.status}`);
    });
    
    // 4. 检查报名表是否存在 skills 字段
    const [regColumns] = await connection.query("SHOW COLUMNS FROM contest_registrations LIKE 'skills'");
    if (regColumns.length > 0) {
      console.log('\n🔧 修复报名表的 skills 字段...');
      const [allRegs] = await connection.query('SELECT * FROM contest_registrations WHERE skills IS NOT NULL');
      
      for (const reg of allRegs) {
        let skills = reg.skills;
        if (skills && typeof skills === 'string') {
          try {
            JSON.parse(skills);
          } catch (e) {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
            skills = JSON.stringify(skillsArray);
            await connection.query(
              'UPDATE contest_registrations SET skills = ? WHERE id = ?',
              [skills, reg.id]
            );
            console.log(`  修复报名 ${reg.id} 的 skills`);
          }
        }
      }
      console.log('✅ 报名数据修复完成！');
    }
    
    console.log('\n✅ 所有数据修复完成！');
    
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
