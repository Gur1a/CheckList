import initializeModels from '../models/index';
import { Op } from 'sequelize';

export class UserRepository {
  // 根据邮箱或用户名查找用户
  async findByEmailOrUsername(email: string, username: string) {
    const { User } = await initializeModels();
    
    return await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });
  }

  // 根据邮箱查找用户
  async findByEmail(email: string) {
    const { User } = await initializeModels();
    
    return await User.findOne({
      where: { email }
    });
  }

  // 根据ID查找用户
  async findById(id: number) {
    const { User } = await initializeModels();
    
    return await User.findByPk(id);
  }

  // 创建用户
  async create(userData: { username: string; email: string; password: string }) {
    const { User } = await initializeModels();
    
    return await User.create(userData);
  }
}