import { Model, Sequelize, Optional, DataTypes } from 'sequelize';

// 标签属性接口
export interface TagAttributes {
  id: number;
  name: string;
  color?: string;
  userId: number; // 所属用户ID
  createdAt: Date;
  updatedAt: Date;
}

// 标签创建属性（可选的id和时间戳）
export interface TagCreationAttributes extends Optional<TagAttributes, 'id' | 'createdAt' | 'updatedAt' | 'color'> {}

// Tag 模型类
export class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  public id!: number;
  public name!: string;
  public color?: string;
  public userId!: number; // 所属用户ID
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化标签模型
export const initTagModel = (sequelize: Sequelize): typeof Tag => {
  Tag.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: { name: 'tag_name_user_unique', msg: '标签名在当前用户下已存在' },
      validate: {
        len: [1, 50],
        notEmpty: true,
      },
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '#4CAF50', // 默认绿色
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
    tableName: 'tags',
    indexes: [
      { unique: true, fields: ['name', 'userId'], name: 'tag_name_user_unique' },
      { fields: ['userId'], name: 'idx_tags_user_id' },
    ],
  });

  return Tag;
}