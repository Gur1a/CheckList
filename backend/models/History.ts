import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

// 历史记录变更接口
interface IHistoryChange {
  old: any;
  new: any;
}

// 历史记录元数据接口
interface IHistoryMetadata {
  ip?: string;
  userAgent?: string;
  source: 'web' | 'mobile' | 'api';
}

// 历史记录选项接口
interface IHistoryOptions {
  limit?: number;
  page?: number;
  startDate?: Date;
  endDate?: Date;
  actions?: string[];
  entityTypes?: string[];
}

// 历史记录活动报告接口
interface IActivityReport {
  action: string;
  entityType: string;
  totalCount: number;
  users: Array<{
    user: string;
    count: number;
    lastActivity: Date;
  }>;
}

// 历史记录属性接口
interface HistoryAttributes {
  id: number;
  entityType: 'task' | 'project' | 'board' | 'user';
  entityId: number;
  entityModel: 'Task' | 'Project' | 'Board' | 'User';
  action: 'create' | 'update' | 'delete' | 'move' | 'assign' | 'complete' | 'archive' | 'restore';
  changes: Record<string, IHistoryChange>;
  metadata: IHistoryMetadata;
  performedBy: number;
  project?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 历史记录创建属性（可选的id和时间戳）
interface HistoryCreationAttributes extends Optional<HistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// History 模型类
class History extends Model<HistoryAttributes, HistoryCreationAttributes> implements HistoryAttributes {
  public id!: number;
  public entityType!: 'task' | 'project' | 'board' | 'user';
  public entityId!: number;
  public entityModel!: 'Task' | 'Project' | 'Board' | 'User';
  public action!: 'create' | 'update' | 'delete' | 'move' | 'assign' | 'complete' | 'archive' | 'restore';
  public changes!: Record<string, IHistoryChange>;
  public metadata!: IHistoryMetadata;
  public performedBy!: number;
  public project?: number;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 虚拟字段：变更摘要
  public get changeSummary(): string {
    const changeCount = this.changes ? Object.keys(this.changes).length : 0;
    const actionMap: Record<string, string> = {
      create: '创建',
      update: '更新',
      delete: '删除',
      move: '移动',
      assign: '分配',
      complete: '完成',
      archive: '归档',
      restore: '恢复'
    };
    
    const actionText = actionMap[this.action] || this.action;
    return `${actionText}了${this.entityType}${changeCount > 0 ? `（${changeCount}个字段变更）` : ''}`;
  }
}

// 初始化历史记录模型
const initHistoryModel = (sequelize: Sequelize): typeof History => {
  History.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    entityType: {
      type: DataTypes.ENUM('task', 'project', 'board', 'user'),
      allowNull: false
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    entityModel: {
      type: DataTypes.ENUM('Task', 'Project', 'Board', 'User'),
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM('create', 'update', 'delete', 'move', 'assign', 'complete', 'archive', 'restore'),
      allowNull: false
    },
    changes: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {
        source: 'web'
      }
    },
    performedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    project: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: '描述最多500个字符'
        }
      }
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
    tableName: 'histories',
    modelName: 'History',
    timestamps: true,
    indexes: [
      {
        fields: ['entityType', 'entityId', 'createdAt']
      },
      {
        fields: ['performedBy', 'createdAt']
      },
      {
        fields: ['project', 'createdAt']
      },
      {
        fields: ['action', 'createdAt']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // 静态方法：记录历史
  (History as any).recordHistory = async function(options: {
    entityType: string;
    entityId: number;
    action: string;
    changes?: Record<string, any>;
    performedBy: number;
    project?: number;
    description?: string;
    metadata?: Partial<IHistoryMetadata>;
  }) {
    const {
      entityType,
      entityId,
      action,
      changes = {},
      performedBy,
      project,
      description,
      metadata = {}
    } = options;

    const entityModelMap: Record<string, string> = {
      task: 'Task',
      project: 'Project',
      board: 'Board',
      user: 'User'
    };

    const history = await this.create({
      entityType,
      entityId,
      entityModel: entityModelMap[entityType],
      action,
      changes,
      performedBy,
      project,
      description,
      metadata: {
        source: 'web',
        ...metadata
      }
    });

    return history;
  };

  // 静态方法：获取实体历史
  (History as any).getEntityHistory = function(
    entityType: string, 
    entityId: number, 
    options: IHistoryOptions = {}
  ) {
    const { limit = 50, page = 1, startDate, endDate } = options;
    
    const whereClause: any = { entityType, entityId };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    return this.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          association: 'performedByUser',
          attributes: ['username', 'avatar']
        }
      ]
    });
  };

  // 静态方法：获取项目历史
  (History as any).getProjectHistory = function(
    projectId: number, 
    options: IHistoryOptions = {}
  ) {
    const { limit = 100, page = 1, actions, entityTypes } = options;
    
    const whereClause: any = { project: projectId };
    
    if (actions && actions.length > 0) {
      whereClause.action = actions;
    }
    
    if (entityTypes && entityTypes.length > 0) {
      whereClause.entityType = entityTypes;
    }

    return this.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          association: 'performedByUser',
          attributes: ['username', 'avatar']
        }
      ]
    });
  };

  // 静态方法：获取用户活动历史
  (History as any).getUserActivity = function(
    userId: number, 
    options: IHistoryOptions = {}
  ) {
    const { limit = 50, page = 1, startDate, endDate } = options;
    
    const whereClause: any = { performedBy: userId };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    return this.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          association: 'projectInfo',
          attributes: ['name', 'color']
        }
      ]
    });
  };

  return History;
};

// 导出模型初始化函数和类型
export { History, HistoryAttributes, HistoryCreationAttributes, IHistoryChange, IHistoryMetadata, IHistoryOptions, IActivityReport, initHistoryModel };
export default History;