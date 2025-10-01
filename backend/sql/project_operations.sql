-- 项目相关数据库操作SQL

-- 1. 创建项目
INSERT INTO projects (name, description, color, icon, isPrivate, isArchived, members, settings, stats, createdBy, lastActivity) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- 2. 获取用户创建的所有项目
SELECT id, name, description, color, icon, isPrivate, isArchived, members, settings, stats, createdBy, lastActivity, createdAt, updatedAt 
FROM projects 
WHERE createdBy = ? 
ORDER BY createdAt DESC;

-- 3. 获取单个项目详情
SELECT id, name, description, color, icon, isPrivate, isArchived, members, settings, stats, createdBy, lastActivity, createdAt, updatedAt 
FROM projects 
WHERE id = ? AND createdBy = ?;

-- 4. 更新项目信息
UPDATE projects 
SET name = ?, description = ?, color = ?, icon = ?, isPrivate = ?, settings = ? 
WHERE id = ? AND createdBy = ?;

-- 5. 归档项目
UPDATE projects 
SET isArchived = TRUE 
WHERE id = ? AND createdBy = ?;

-- 6. 删除项目（软删除）
UPDATE projects 
SET isArchived = TRUE 
WHERE id = ? AND createdBy = ?;

-- 7. 添加项目成员
UPDATE projects 
SET members = ? 
WHERE id = ? AND createdBy = ?;

-- 8. 获取用户参与的所有项目（包括作为成员的项目）
SELECT p.id, p.name, p.description, p.color, p.icon, p.isPrivate, p.isArchived, p.members, p.settings, p.stats, p.createdBy, p.lastActivity, p.createdAt, p.updatedAt 
FROM projects p 
WHERE p.createdBy = ? 
   OR (p.isPrivate = FALSE AND JSON_CONTAINS(JSON_EXTRACT(p.members, '$[*].userId'), ?))
ORDER BY p.lastActivity DESC;

-- 9. 更新项目活动时间
UPDATE projects 
SET lastActivity = NOW() 
WHERE id = ?;

-- 10. 获取项目统计信息
SELECT stats FROM projects WHERE id = ?;

-- 11. 更新项目统计信息
UPDATE projects 
SET stats = ? 
WHERE id = ?;