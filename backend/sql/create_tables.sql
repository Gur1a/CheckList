-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS todolist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE todolist;

-- 1. 创建用户表 (users)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(500) DEFAULT '',
  theme ENUM('light', 'dark', 'auto') DEFAULT 'auto',
  language ENUM('zh-CN', 'en-US') DEFAULT 'zh-CN',
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
  preferences JSON DEFAULT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  lastLoginAt DATETIME DEFAULT NULL,
  passwordResetToken VARCHAR(255) DEFAULT NULL,
  passwordResetExpires DATETIME DEFAULT NULL,
  emailVerificationToken VARCHAR(255) DEFAULT NULL,
  emailVerified BOOLEAN DEFAULT FALSE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 创建项目表 (projects)
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  color VARCHAR(7) DEFAULT '#007bff',
  icon VARCHAR(10) DEFAULT '📋',
  isPrivate BOOLEAN DEFAULT FALSE,
  isArchived BOOLEAN DEFAULT FALSE,
  members JSON DEFAULT NULL,
  settings JSON DEFAULT NULL,
  stats JSON DEFAULT NULL,
  createdBy INT NOT NULL,
  lastActivity DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_created_by (createdBy),
  INDEX idx_is_archived (isArchived),
  INDEX idx_created_at (createdAt),
  
  CONSTRAINT fk_projects_created_by FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 创建看板表 (boards)
CREATE TABLE IF NOT EXISTS boards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  project INT NOT NULL,
  `order` INT DEFAULT 0,
  color VARCHAR(7) DEFAULT '#6c757d',
  isDefault BOOLEAN DEFAULT FALSE,
  limits JSON DEFAULT NULL,
  settings JSON DEFAULT NULL,
  createdBy INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_order (project, `order`),
  INDEX idx_project_default (project, isDefault),
  INDEX idx_created_by (createdBy),
  INDEX idx_created_at (createdAt),
  
  CONSTRAINT fk_boards_project FOREIGN KEY (project) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_boards_created_by FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 创建任务表 (tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  status ENUM('todo', 'in_progress', 'done', 'archived') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  dueDate DATETIME DEFAULT NULL,
  reminder DATETIME DEFAULT NULL,
  startDate DATETIME DEFAULT NULL,
  estimatedHours DECIMAL(10,2) DEFAULT NULL,
  actualHours DECIMAL(10,2) DEFAULT 0,
  tags JSON DEFAULT NULL,
  assignee INT DEFAULT NULL,
  assignedBy INT DEFAULT NULL,
  project INT NOT NULL,
  board INT DEFAULT NULL,
  `order` INT DEFAULT 0,
  subtasks JSON DEFAULT NULL,
  attachments JSON DEFAULT NULL,
  comments JSON DEFAULT NULL,
  watchers JSON DEFAULT NULL,
  dependencies JSON DEFAULT NULL,
  customFields JSON DEFAULT NULL,
  isRecurring BOOLEAN DEFAULT FALSE,
  recurringPattern JSON DEFAULT NULL,
  createdBy INT NOT NULL,
  completedAt DATETIME DEFAULT NULL,
  archivedAt DATETIME DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_status (project, status),
  INDEX idx_assignee_status (assignee, status),
  INDEX idx_created_by (createdBy),
  INDEX idx_due_date (dueDate),
  INDEX idx_priority (priority),
  INDEX idx_board_order (board, `order`),
  INDEX idx_created_at (createdAt),
  
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_assigned_by FOREIGN KEY (assignedBy) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_project FOREIGN KEY (project) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_board FOREIGN KEY (board) REFERENCES boards(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_created_by FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 创建历史记录表 (histories)
CREATE TABLE IF NOT EXISTS histories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entityType ENUM('task', 'project', 'board', 'user') NOT NULL,
  entityId INT NOT NULL,
  entityModel ENUM('Task', 'Project', 'Board', 'User') NOT NULL,
  action ENUM('create', 'update', 'delete', 'move', 'assign', 'complete', 'archive', 'restore') NOT NULL,
  changes JSON DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  performedBy INT NOT NULL,
  project INT DEFAULT NULL,
  description VARCHAR(500) DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_entity_type_id_created (entityType, entityId, createdAt),
  INDEX idx_performed_by_created (performedBy, createdAt),
  INDEX idx_project_created (project, createdAt),
  INDEX idx_action_created (action, createdAt),
  INDEX idx_created_at (createdAt),
  
  CONSTRAINT fk_histories_performed_by FOREIGN KEY (performedBy) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_histories_project FOREIGN KEY (project) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建默认用户（可选）
-- INSERT INTO users (username, email, password, isActive) VALUES ('admin', 'admin@example.com', '$2a$12$example_hashed_password', TRUE);

-- 6. 创建标签表 (tags)
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) DEFAULT '#4CAF50',
  userId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tags_user_id (userId),
  UNIQUE INDEX tag_name_user_unique (name, userId),
  
  CONSTRAINT fk_tags_user_id FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 创建任务标签关联表 (task_tags)
CREATE TABLE IF NOT EXISTS task_tags (
  taskId INT NOT NULL,
  tagId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (taskId, tagId),
  INDEX idx_task_tags_task_id (taskId),
  INDEX idx_task_tags_tag_id (tagId),
  
  CONSTRAINT fk_task_tags_task_id FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_tags_tag_id FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;