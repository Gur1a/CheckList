-- 看板相关数据库操作SQL

-- 1. 创建看板
INSERT INTO boards (name, description, project, `order`, color, isDefault, limits, settings, createdBy) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- 2. 获取项目中的所有看板
SELECT id, name, description, project, `order`, color, isDefault, limits, settings, createdBy, createdAt, updatedAt 
FROM boards 
WHERE project = ? 
ORDER BY `order` ASC;

-- 3. 获取单个看板详情
SELECT id, name, description, project, `order`, color, isDefault, limits, settings, createdBy, createdAt, updatedAt 
FROM boards 
WHERE id = ?;

-- 4. 更新看板信息
UPDATE boards 
SET name = ?, description = ?, color = ?, limits = ?, settings = ? 
WHERE id = ?;

-- 5. 更新看板顺序
UPDATE boards 
SET `order` = ? 
WHERE id = ?;

-- 6. 设置默认看板
UPDATE boards 
SET isDefault = CASE WHEN id = ? THEN TRUE ELSE FALSE END 
WHERE project = ?;

-- 7. 删除看板
DELETE FROM boards WHERE id = ?;

-- 8. 获取默认看板
SELECT id, name, description, project, `order`, color, isDefault, limits, settings, createdBy, createdAt, updatedAt 
FROM boards 
WHERE project = ? AND isDefault = TRUE;

-- 9. 获取项目看板统计信息
SELECT 
  b.id, 
  b.name, 
  b.isDefault,
  COUNT(t.id) as taskCount,
  SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) as todoCount,
  SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as inProgressCount,
  SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as doneCount
FROM boards b
LEFT JOIN tasks t ON b.id = t.board AND t.status != 'archived'
WHERE b.project = ?
GROUP BY b.id, b.name, b.isDefault
ORDER BY b.`order` ASC;