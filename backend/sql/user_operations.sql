-- 用户认证相关数据库操作SQL

-- 1. 用户注册 - 插入新用户
INSERT INTO users (username, email, password, avatar, theme, language, timezone, preferences, isActive) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- 2. 用户登录 - 根据邮箱查找用户
SELECT id, username, email, password, avatar, theme, language, timezone, preferences, isActive, lastLoginAt, createdAt, updatedAt 
FROM users 
WHERE email = ?;

-- 3. 更新最后登录时间
UPDATE users 
SET lastLoginAt = NOW() 
WHERE id = ?;

-- 4. 验证用户是否存在
SELECT id, username, email, avatar, theme, language, timezone, preferences, isActive, lastLoginAt, createdAt, updatedAt 
FROM users 
WHERE id = ? AND isActive = TRUE;

-- 5. 检查邮箱是否已存在
SELECT id FROM users WHERE email = ?;

-- 6. 检查用户名是否已存在
SELECT id FROM users WHERE username = ?;

-- 7. 更新用户信息
UPDATE users 
SET username = ?, email = ?, avatar = ?, theme = ?, language = ?, timezone = ?, preferences = ? 
WHERE id = ?;

-- 8. 更新用户密码
UPDATE users 
SET password = ? 
WHERE id = ?;

-- 9. 禁用用户账户
UPDATE users 
SET isActive = FALSE 
WHERE id = ?;

-- 10. 删除用户（软删除）
UPDATE users 
SET isActive = FALSE, email = CONCAT('deleted_', id, '_', email) 
WHERE id = ?;

-- 11. 获取用户列表（分页）
SELECT id, username, email, avatar, theme, language, timezone, preferences, isActive, lastLoginAt, createdAt, updatedAt 
FROM users 
WHERE isActive = TRUE 
ORDER BY createdAt DESC 
LIMIT ? OFFSET ?;

-- 12. 获取用户总数
SELECT COUNT(*) as total 
FROM users 
WHERE isActive = TRUE;

-- 13. 根据用户名搜索用户
SELECT id, username, email, avatar, theme, language, timezone, preferences, isActive, lastLoginAt, createdAt, updatedAt 
FROM users 
WHERE username LIKE ? AND isActive = TRUE 
ORDER BY createdAt DESC 
LIMIT ? OFFSET ?;