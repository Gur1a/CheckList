import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

// 项目成员权限接口
interface IProjectPermissions {
  canEditProject: boolean;
  canDeleteProject: boolean;
  canManageMembers: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canManageBoards: boolean;
}

// 项目成员接口
interface IProjectMember {
  userId: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: IProjectPermissions;
  joinedAt: Date;
}

// 项目设置接口
interface IProjectSettings {
  allowInvites: boolean;
  allowGuestAccess: boolean;
  defaultTaskStatus: string;
  autoArchiveCompleted: boolean;
  enableTimeTracking: boolean;
}

// 项目统计接口
interface IProjectStats {
  totalTasks: number;
  completedTasks: number;
  totalMembers: number;
}

// 项目属性接口
interface ProjectAttributes {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isPrivate: boolean;
  isArchived: boolean;
  members: IProjectMember[];
  settings: IProjectSettings;
  stats: IProjectStats;
  createdBy: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 项目创建属性（可选的id和时间戳）
interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Project 模型类
class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public color!: string;
  public icon!: string;
  public isPrivate!: boolean;
  public isArchived!: boolean;
  public members!: IProjectMember[];
  public settings!: IProjectSettings;
  public stats!: IProjectStats;
  public createdBy!: number;
  public lastActivity!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 虚拟字段：完成率
  public get completionRate(): number {
    if (this.stats.totalTasks === 0) return 0;
    return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
  }

  // 实例方法：添加成员
  public async addMember(userId: number, role: string = 'member'): Promise<Project> {
    const existingMember = this.members.find((member: IProjectMember) => 
      member.userId === userId
    );
    
    if (existingMember) {
      throw new Error('用户已是项目成员');
    }

    const permissions = this.getDefaultPermissions(role);
    const newMembers = [...this.members, {
      userId,
      role: role as any,
      permissions,
      joinedAt: new Date()
    }];
    
    this.members = newMembers;
    this.stats = {
      ...this.stats,
      totalMembers: newMembers.length
    };
    return await this.save();
  }

  // 实例方法：移除成员
  public async removeMember(userId: number): Promise<Project> {
    this.members = this.members.filter((member: IProjectMember) => 
      member.userId !== userId
    );
    this.stats = {
      ...this.stats,
      totalMembers: this.members.length
    };
    return await this.save();
  }

  // 实例方法：获取默认权限
  public getDefaultPermissions(role: string): IProjectPermissions {
    const defaultPermissions: Record<string, IProjectPermissions> = {
      owner: {
        canEditProject: true,
        canDeleteProject: true,
        canManageMembers: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canManageBoards: true
      },
      admin: {
        canEditProject: true,
        canDeleteProject: false,
        canManageMembers: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canManageBoards: true
      },
      member: {
        canEditProject: false,
        canDeleteProject: false,
        canManageMembers: false,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: false,
        canManageBoards: false
      },
      viewer: {
        canEditProject: false,
        canDeleteProject: false,
        canManageMembers: false,
        canCreateTasks: false,
        canEditTasks: false,
        canDeleteTasks: false,
        canManageBoards: false
      }
    };

    return defaultPermissions[role] || defaultPermissions.viewer;
  }

  // 实例方法：检查权限
  public hasPermission(userId: number, permission: string): boolean {
    const member = this.members.find((m: IProjectMember) => m.userId === userId);
    if (!member) return false;
    
    return (member.permissions as any)[permission] || false;
  }

  // 实例方法：更新活动时间
  public async updateActivity(): Promise<Project> {
    this.lastActivity = new Date();
    return await this.save();
  }
}

// 初始化项目模型
const initProjectModel = (sequelize: Sequelize): typeof Project => {
  Project.init({
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
          msg: '项目名称长度必须在1-100个字符之间'
        }
      }
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: '项目描述最多500个字符'
        }
      }
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#007bff',
      validate: {
        is: {
          args: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          msg: '请输入有效的颜色值'
        }
      }
    },
    icon: {
      type: DataTypes.STRING(10),
      defaultValue: '📋'
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    members: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        allowInvites: true,
        allowGuestAccess: false,
        defaultTaskStatus: 'todo',
        autoArchiveCompleted: false,
        enableTimeTracking: false
      }
    },
    stats: {
      type: DataTypes.JSON,
      defaultValue: {
        totalTasks: 0,
        completedTasks: 0,
        totalMembers: 1
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
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
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
    tableName: 'projects',
    modelName: 'Project',
    timestamps: true,
    indexes: [
      {
        fields: ['createdBy']
      },
      {
        fields: ['isArchived']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      // 保存前设置默认权限
      beforeCreate: async (project: Project) => {
        const ownerMember: IProjectMember = {
          userId: project.createdBy,
          role: 'owner',
          permissions: {
            canEditProject: true,
            canDeleteProject: true,
            canManageMembers: true,
            canCreateTasks: true,
            canEditTasks: true,
            canDeleteTasks: true,
            canManageBoards: true
          },
          joinedAt: new Date()
        };
        project.members = [ownerMember];
        project.stats = {
          ...project.stats,
          totalMembers: 1
        };
      }
    }
  });

  return Project;
};

// 导出模型初始化函数和类型
export { Project, ProjectAttributes, ProjectCreationAttributes, IProjectPermissions, IProjectMember, IProjectSettings, IProjectStats, initProjectModel };
export default Project;