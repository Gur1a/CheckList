import { Sequelize } from 'sequelize';
import { initializeDatabase } from '../config/database';
import { initUserModel } from './User';
import { initProjectModel } from './Project';
import { initTaskModel } from './Task';
import { initBoardModel } from './Board';
import { initHistoryModel } from './History';
import { initTagModel } from './Tag';
import { initTaskTagModel } from './TaskTag';

let sequelize: Sequelize;

const initializeModels = async () => {
  // 初始化数据库连接
  sequelize = await initializeDatabase();

  // 初始化所有模型
  const User = initUserModel(sequelize);
  const Project = initProjectModel(sequelize);
  const Task = initTaskModel(sequelize);
  const Board = initBoardModel(sequelize);
  const History = initHistoryModel(sequelize);
  const Tag = initTagModel(sequelize);
  const TaskTag = initTaskTagModel(sequelize);

  // 设置模型关联关系
  // 用户和项目的关联
  User.hasMany(Project, { foreignKey: 'createdBy', as: 'createdProjects' });
  Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  
  // 任务的关联
  Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Task.belongsTo(User, { foreignKey: 'assignee', as: 'assignedUser' });
  Task.belongsTo(Project, { foreignKey: 'project', as: 'projectInfo' });
  Task.belongsTo(Board, { foreignKey: 'board', as: 'boardInfo' });
  
  // 项目和任务的关联
  Project.hasMany(Task, { foreignKey: 'project', as: 'tasks' });
  
  // 看板的关联
  Board.belongsTo(Project, { foreignKey: 'project', as: 'projectInfo' });
  Board.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Board.hasMany(Task, { foreignKey: 'board', as: 'tasks' });
  
  // 项目和看板的关联
  Project.hasMany(Board, { foreignKey: 'project', as: 'boards' });
  
  // 历史记录的关联
  History.belongsTo(User, { foreignKey: 'performedBy', as: 'performedByUser' });
  History.belongsTo(Project, { foreignKey: 'project', as: 'projectInfo' });
  
  // 用户和历史记录的关联
  User.hasMany(History, { foreignKey: 'performedBy', as: 'activities' });
  Project.hasMany(History, { foreignKey: 'project', as: 'histories' });

  // 用户和标签的关联
  User.hasMany(Tag, { foreignKey: 'userId', as: 'tags' });
  Tag.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // 任务和标签的多对多关联
  Task.belongsToMany(Tag, {
    through: TaskTag,
    foreignKey: 'taskId',
    as: 'tags'
  });
  Tag.belongsToMany(Task, {
    through: TaskTag,
    foreignKey: 'tagId',
    as: 'tasks'
  });

  return {
    User,
    Project,
    Task,
    Board,
    History,
    Tag,
    TaskTag,
    sequelize
  };
};

export default initializeModels;