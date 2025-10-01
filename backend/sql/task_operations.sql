-- 任务相关数据库操作SQL

-- 1. 创建任务
INSERT INTO tasks (title, description, status, priority, dueDate, reminder, startDate, estimatedHours, actualHours, tags, assignee, assignedBy, project, board, `order`, subtasks, attachments, comments, watchers, dependencies, customFields, isRecurring, recurringPattern, createdBy, completedAt, archivedAt) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- 2. 获取项目中的所有任务
SELECT id, title, description, status, priority, dueDate, reminder, startDate, estimatedHours, actualHours, tags, assignee, assignedBy, project, board, `order`, subtasks, attachments, comments, watchers, dependencies, customFields, isRecurring, recurringPattern, createdBy, completedAt, archivedAt, createdAt, updatedAt 
FROM tasks 
WHERE project = ? 
ORDER BY `order` ASC, createdAt DESC;

-- 3. 获取用户分配的任务
SELECT id, title, description, status, priority, dueDate, reminder, startDate, estimatedHours, actualHours, tags, assignee, assignedBy, project, board, `order`, subtasks, attachments, comments, watchers, dependencies, customFields, isRecurring, recurringPattern, createdBy, completedAt, archivedAt, createdAt, updatedAt 
FROM tasks 
WHERE assignee = ? AND status != 'archived'
ORDER BY dueDate ASC, priority DESC;

-- 4. 获取单个任务详情
SELECT id, title, description, status, priority, dueDate, reminder, startDate, estimatedHours, actualHours, tags, assignee, assignedBy, project, board, `order`, subtasks, attachments, comments, watchers, dependencies, customFields, isRecurring, recurringPattern, createdBy, completedAt, archivedAt, createdAt, updatedAt 
FROM tasks 
WHERE id = ?;

-- 5. 更新任务信息
UPDATE tasks 
SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, reminder = ?, startDate = ?, estimatedHours = ?, tags = ?, assignee = ?, board = ?, `order` = ?, isRecurring = ?, recurringPattern = ? 
WHERE id = ?;

-- 6. 更新任务状态
UPDATE tasks 
SET status = ?, completedAt = CASE WHEN ? = 'done' THEN NOW() ELSE completedAt END 
WHERE id = ?;

-- 7. 更新实际工时
UPDATE tasks 
SET actualHours = ? 
WHERE id = ?;

-- 8. 添加子任务
UPDATE tasks 
SET subtasks = ? 
WHERE id = ?;

-- 9. 切换子任务完成状态
UPDATE tasks 
SET subtasks = ? 
WHERE id = ?;

-- 10. 添加评论
UPDATE tasks 
SET comments = ? 
WHERE id = ?;

-- 11. 添加观察者
UPDATE tasks 
SET watchers = ? 
WHERE id = ?;

-- 12. 移除观察者
UPDATE tasks 
SET watchers = ? 
WHERE id = ?;

-- 13. 归档任务
UPDATE tasks 
SET status = 'archived', archivedAt = NOW() 
WHERE id = ?;

-- 14. 删除任务（软删除）
UPDATE tasks 
SET status = 'archived', archivedAt = NOW() 
WHERE id = ?;

-- 15. 获取看板中的任务
SELECT id, title, description, status, priority, dueDate, reminder, startDate, estimatedHours, actualHours, tags, assignee, assignedBy, project, board, `order`, subtasks, attachments, comments, watchers, dependencies, customFields, isRecurring, recurringPattern, createdBy, completedAt, archivedAt, createdAt, updatedAt 
FROM tasks 
WHERE board = ? 
ORDER BY `order` ASC;

-- 16. 更新任务顺序
UPDATE tasks 
SET `order` = ?, board = ? 
WHERE id = ?;

-- 17. 按状态统计任务
SELECT status, COUNT(*) as count 
FROM tasks 
WHERE project = ? 
GROUP BY status;

-- 18. 按优先级统计任务
SELECT priority, COUNT(*) as count 
FROM tasks 
WHERE project = ? 
GROUP BY priority;

-- 19. 获取即将到期的任务
SELECT id, title, description, status, priority, dueDate, reminder, startDate, estimatedHours, actualHours, tags, assignee, assignedBy, project, board, `order`, subtasks, attachments, comments, watchers, dependencies, customFields, isRecurring, recurringPattern, createdBy, completedAt, archivedAt, createdAt, updatedAt 
FROM tasks 
WHERE assignee = ? AND dueDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) AND status != 'done' AND status != 'archived'
ORDER BY dueDate ASC;

-- 20. 获取逾期任务
SELECT id, title, description, status, priority, dueDate, reminder, startDate, estimatedHours, actualHours, tags, assignee, assignedBy, project, board, `order`, subtasks, attachments, comments, watchers, dependencies, customFields, isRecurring, recurringPattern, createdBy, completedAt, archivedAt, createdAt, updatedAt 
FROM tasks 
WHERE assignee = ? AND dueDate < NOW() AND status != 'done' AND status != 'archived'
ORDER BY dueDate ASC;