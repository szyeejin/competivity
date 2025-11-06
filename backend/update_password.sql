-- 更新用户密码
-- 邮箱: 666666@qq.com
-- 新密码: 123456

UPDATE users 
SET password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
WHERE email = '666666@qq.com';

-- 查看更新结果
SELECT id, username, email, '密码已更新' as status 
FROM users 
WHERE email = '666666@qq.com';
