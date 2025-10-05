import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import { TaskPriority, TaskStatus, Project } from '../types/shared';

// 子任务接口
interface ISubtask {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// 附件接口
interface IAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedBy: number;
  uploadedAt: Date;
}

// 评论接口
interface IComment {
  id?: number;
  content: string;
  author: number;
  createdAt: Date;
  updatedAt: Date;
}

// 依赖关系接口
interface IDependency {
  taskId: number;
  type: 'blocks' | 'blocked_by' | 'related';
}

// 自定义字段接口
interface ICustomField {
  name: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
}

// 循环模式接口
interface IRecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
}

// 任务属性接口
interface TaskAttributes {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  color?: string;
  dueDate?: Date;
  reminder?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours: number;
  assignee?: number;
  assignedBy?: number;
  project?: number;
  board?: number;
  order: number;
  subtasks: ISubtask[];
  attachments: IAttachment[];
  comments: IComment[];
  watchers: number[];
  dependencies: IDependency[];
  customFields: ICustomField[];
  isRecurring: boolean;
  recurringPattern?: IRecurringPattern;
  createdBy: number;
  completedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 任务创建属性（可选的id和时间戳）
interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Task 模型类
class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public status!: TaskStatus;
  public priority!: TaskPriority;
  public color?: string;
  public dueDate?: Date;
  public reminder?: Date;
  public startDate?: Date;
  public estimatedHours?: number;
  public actualHours!: number;
  public assignee?: number;
  public assignedBy?: number;
  public project?: number;
  public board?: number;
  public tags?: string[]; // 展示用标签名
  public projectInfo: Project;
  public order!: number;
  public subtasks!: ISubtask[];
  public attachments!: IAttachment[];
  public comments!: IComment[];
  public watchers!: number[];
  public dependencies!: IDependency[];
  public customFields!: ICustomField[];
  public isRecurring!: boolean;
  public recurringPattern?: IRecurringPattern;
  public createdBy!: number;
  public completedAt?: Date;
  public archivedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 虚拟字段：是否过期
  public get isOverdue(): boolean {
    if (!this.dueDate || this.status === TaskStatus.DONE || this.status === TaskStatus.ARCHIVED) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  // 虚拟字段：子任务完成率
  public get subtaskCompletionRate(): number {
    if (this.subtasks.length === 0) return 100;
    const completedCount = this.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedCount / this.subtasks.length) * 100);
  }

  // 虚拟字段：剩余天数
  public get daysRemaining(): number | null {
    if (!this.dueDate) return null;
    const diff = this.dueDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // 实例方法：添加评论
  public async addComment(content: string, authorId: number): Promise<Task> {
    const newComments = [...this.comments, {
      content,
      author: authorId,
      createdAt: new Date(),
      updatedAt: new Date()
    }];
    this.comments = newComments;
    return await this.save();
  }

  // 实例方法：添加子任务
  public async addSubtask(title: string): Promise<Task> {
    const newSubtasks = [...this.subtasks, {
      title,
      completed: false,
      createdAt: new Date()
    }];
    this.subtasks = newSubtasks;
    return await this.save();
  }

  // 实例方法：切换子任务状态
  public async toggleSubtask(subtaskId: number): Promise<Task> {
    const subtaskIndex = this.subtasks.findIndex(subtask => subtask.id === subtaskId);
    if (subtaskIndex !== -1) {
      this.subtasks[subtaskIndex].completed = !this.subtasks[subtaskIndex].completed;
      return await this.save();
    }
    throw new Error('子任务不存在');
  }

  // 实例方法：添加观察者
  public async addWatcher(userId: number): Promise<Task> {
    if (!this.watchers.includes(userId)) {
      this.watchers = [...this.watchers, userId];
      return await this.save();
    }
    return this;
  }

  // 实例方法：移除观察者
  public async removeWatcher(userId: number): Promise<Task> {
    this.watchers = this.watchers.filter(watcher => watcher !== userId);
    return await this.save();
  }

  // 实例方法：检查用户是否可以访问任务
  public async canUserAccess(userId: number): Promise<boolean> {
    // 这里需要和Project模型关联查询
    // 暂时返回true，后续实现关联查询
    return true;
  }
}

// 初始化任务模型
const initTaskModel = (sequelize: Sequelize): typeof Task => {
  Task.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: {
          args: [1, 200],
          msg: '任务标题长度必须在1-200个字符之间'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: '任务描述最多2000个字符'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'done', 'archived'),
      defaultValue: TaskStatus.TODO
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent', 'none'),
      defaultValue: TaskPriority.MEDIUM
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#4772fa'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reminder: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    actualHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    assignee: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    project: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    board: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'boards',
        key: 'id'
      }
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    subtasks: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    comments: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    watchers: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    dependencies: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    customFields: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurringPattern: {
      type: DataTypes.JSON,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'tasks',
    modelName: 'Task',
    timestamps: true,
    indexes: [
      {
        fields: ['project', 'status']
      },
      {
        fields: ['assignee', 'status']
      },
      {
        fields: ['createdBy']
      },
      {
        fields: ['dueDate']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['board', 'order']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      // 状态变更时更新时间戳
      beforeSave: async (task: Task) => {
        if (task.changed('status')) {
          if (task.status === TaskStatus.DONE && !task.completedAt) {
            task.completedAt = new Date();
          } else if (task.status === TaskStatus.ARCHIVED && !task.archivedAt) {
            task.archivedAt = new Date();
          }
        }
      },
      // 创建任务时设置默认颜色
      beforeCreate: async (task: Task) => {
        if (!task.color) {
          const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', '#FB5607', '#8338EC', '#3A86FF'];
          task.color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
        }
      }
    }
  });

  return Task;
};

// 导出模型初始化函数和类型
export { Task, TaskAttributes, TaskCreationAttributes, ISubtask, IAttachment, IComment, IDependency, ICustomField, IRecurringPattern, initTaskModel };
export default Task;