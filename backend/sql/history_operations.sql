-- 历史记录相关数据库操作SQL

-- 1. 创建历史记录
INSERT INTO histories (entityType, entityId, entityModel, action, changes, metadata, performedBy, project, description) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- 2. 获取实体的历史记录
SELECT id, entityType, entityId, entityModel, action, changes, metadata, performedBy, project, description, createdAt, updatedAt 
FROM histories 
WHERE entityType = ? AND entityId = ? 
ORDER BY createdAt DESC 
LIMIT ? OFFSET ?;

-- 3. 获取项目的历史记录
SELECT id, entityType, entityId, entityModel, action, changes, metadata, performedBy, project, description, createdAt, updatedAt 
FROM histories 
WHERE project = ? 
ORDER BY createdAt DESC 
LIMIT ? OFFSET ?;

-- 4. 获取用户活动历史
SELECT id, entityType, entityId, entityModel, action, changes, metadata, performedBy, project, description, createdAt, updatedAt 
FROM histories 
WHERE performedBy = ? 
ORDER BY createdAt DESC 
LIMIT ? OFFSET ?;

-- 5. 获取特定操作类型的历史记录
SELECT id, entityType, entityId, entityModel, action, changes, metadata, performedBy, project, description, createdAt, updatedAt 
FROM histories 
WHERE action = ? 
ORDER BY createdAt DESC 
LIMIT ? OFFSET ?;

-- 6. 获取指定时间范围内的历史记录
SELECT id, entityType, entityId, entityModel, action, changes, metadata, performedBy, project, description, createdAt, updatedAt 
FROM histories 
WHERE createdAt BETWEEN ? AND ? 
ORDER BY createdAt DESC 
LIMIT ? OFFSET ?;

-- 7. 获取项目活动报告
SELECT 
  action,
  entityType,
  COUNT(*) as totalCount,
  COUNT(DISTINCT performedBy) as userCount,
  MAX(createdAt) as lastActivity
FROM histories 
WHERE project = ? 
GROUP BY action, entityType
ORDER BY totalCount DESC;

-- 8. 获取用户活动统计
SELECT 
  action,
  entityType,
  COUNT(*) as totalCount,
  MAX(createdAt) as lastActivity
FROM histories 
WHERE performedBy = ? 
GROUP BY action, entityType
ORDER BY totalCount DESC;

-- 9. 删除历史记录（通常不建议删除）
DELETE FROM histories WHERE id = ?;

-- 10. 清理过期历史记录
DELETE FROM histories WHERE createdAt < DATE_SUB(NOW(), INTERVAL ? DAY);