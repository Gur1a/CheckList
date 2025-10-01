import { Model, Sequelize, DataTypes } from 'sequelize';

// TaskTag 模型类
export class TaskTag extends Model {
  public taskId!: number;
  public tagId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化TaskTag模型
export const initTaskTagModel = (sequelize: Sequelize): typeof TaskTag => {
  TaskTag.init({
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'tasks',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'tags',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    tableName: 'task_tags',
    indexes: [
      { fields: ['taskId'], name: 'idx_task_tags_task_id' },
      { fields: ['tagId'], name: 'idx_task_tags_tag_id' },
    ],
  });

  return TaskTag;
}