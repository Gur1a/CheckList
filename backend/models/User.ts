import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database';

// 用户偏好设置接口
interface IUserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  defaultView: 'list' | 'board' | 'calendar';
  workingHours: {
    start: string;
    end: string;
  };
}

// 用户属性接口
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  timezone: string;
  preferences: IUserPreferences;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerified: boolean;
  defaultProjectId?: number; // 默认项目ID
  createdAt: Date;
  updatedAt: Date;
}

// 用户创建属性（可选的id和时间戳）
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'passwordResetToken' | 'passwordResetExpires' | 'emailVerificationToken' | 'defaultProjectId'> {}

// User 模型类
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public avatar!: string;
  public theme!: 'light' | 'dark' | 'auto';
  public language!: 'zh-CN' | 'en-US';
  public timezone!: string;
  public preferences!: IUserPreferences;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;
  public emailVerificationToken?: string;
  public emailVerified!: boolean;
  public defaultProjectId?: number; // 默认项目ID
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 实例方法：比较密码
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  }

  // 实例方法：更新最后登录时间
  public async updateLastLogin(): Promise<User> {
    this.lastLoginAt = new Date();
    return await this.save();
  }

  // 实例方法：获取用户公开信息
  public getPublicProfile(): object {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      theme: this.theme,
      language: this.language,
      preferences: this.preferences,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
      defaultProjectId: this.defaultProjectId
    };
  }
}

// 初始化用户模型
const initUserModel = (sequelize: Sequelize): typeof User => {
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [3, 20],
          msg: '用户名长度必须在3-20个字符之间'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: '请输入有效的邮箱地址'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [6, 255],
          msg: '密码至少6个字符'
        }
      }
    },
    avatar: {
      type: DataTypes.STRING(500),
      defaultValue: ''
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark', 'auto'),
      defaultValue: 'auto'
    },
    language: {
      type: DataTypes.ENUM('zh-CN', 'en-US'),
      defaultValue: 'zh-CN'
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'Asia/Shanghai'
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        notifications: {
          email: true,
          push: true,
          desktop: true
        },
        defaultView: 'list',
        workingHours: {
          start: '09:00',
          end: '18:00'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    defaultProjectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      },
      onDelete: 'SET NULL'
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
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['username']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      // 保存前加密密码
      beforeSave: async (user: User) => {
        if (user.changed('password')) {
          try {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          } catch (error) {
            throw error;
          }
        }
      }
    }
  });

  return User;
};

// 导出模型初始化函数和类型
export { User, UserAttributes, UserCreationAttributes, IUserPreferences, initUserModel };
export default User;