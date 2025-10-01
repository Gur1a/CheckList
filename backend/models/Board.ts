import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

// 看板限制接口
interface IBoardLimits {
  wipLimit: number;
  maxTasks: number;
}

// 看板设置接口
interface IBoardSettings {
  autoArchive: boolean;
  allowTaskCreation: boolean;
  showTaskCount: boolean;
}

// 看板统计接口
interface IBoardStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  archived: number;
}

// 看板属性接口
interface BoardAttributes {
  id: number;
  name: string;
  description?: string;
  project: number;
  order: number;
  color: string;
  isDefault: boolean;
  limits: IBoardLimits;
  settings: IBoardSettings;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

// 看板创建属性（可选的id和时间戳）
interface BoardCreationAttributes extends Optional<BoardAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Board 模型类
class Board extends Model<BoardAttributes, BoardCreationAttributes> implements BoardAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public project!: number;
  public order!: number;
  public color!: string;
  public isDefault!: boolean;
  public limits!: IBoardLimits;
  public settings!: IBoardSettings;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 实例方法：检查WIP限制
  public async checkWipLimit(): Promise<boolean> {
    if (this.limits.wipLimit === 0) return true; // 无限制
    
    // 这里需要和Task模型关联查询
    // 暂时返回true，后续实现关联查询
    return true;
  }

  // 实例方法：检查最大任务数限制
  public async checkMaxTasksLimit(): Promise<boolean> {
    if (this.limits.maxTasks === 0) return true; // 无限制
    
    // 这里需要和Task模型关联查询
    // 暂时返回true，后续实现关联查询
    return true;
  }

  // 实例方法：获取看板统计信息
  public async getStats(): Promise<IBoardStats> {
    // 这里需要和Task模型关联查询
    // 暂时返回默认值，后续实现关联查询
    return {
      total: 0,
      todo: 0,
      in_progress: 0,
      done: 0,
      archived: 0
    };
  }
}

// 初始化看板模型
const initBoardModel = (sequelize: Sequelize): typeof Board => {
  Board.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: '看板名称长度必须在1-100个字符之间'
        }
      }
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: '看板描述最多500个字符'
        }
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
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#6c757d',
      validate: {
        is: {
          args: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          msg: '请输入有效的颜色值'
        }
      }
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    limits: {
      type: DataTypes.JSON,
      defaultValue: {
        wipLimit: 0, // 0表示无限制
        maxTasks: 0  // 0表示无限制
      }
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        autoArchive: false,
        allowTaskCreation: true,
        showTaskCount: true
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
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
    tableName: 'boards',
    modelName: 'Board',
    timestamps: true,
    indexes: [
      {
        fields: ['project', 'order']
      },
      {
        fields: ['project', 'isDefault']
      },
      {
        fields: ['createdBy']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Board;
};

// 导出模型初始化函数和类型
export { Board, BoardAttributes, BoardCreationAttributes, IBoardLimits, IBoardSettings, IBoardStats, initBoardModel };
export default Board;