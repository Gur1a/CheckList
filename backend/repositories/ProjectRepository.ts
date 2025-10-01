import { Project, ProjectAttributes, ProjectCreationAttributes } from '../models/Project';
import { Op, Sequelize } from 'sequelize';

export class ProjectRepository {
  /**
   * 创建项目
   * @param projectData 项目数据
   * @returns 创建的项目
   */
  async create(projectData: ProjectCreationAttributes): Promise<Project> {
    return await Project.create(projectData);
  }

  /**
   * 根据ID查找项目
   * @param id 项目ID
   * @returns 项目对象或null
   */
  async findById(id: number): Promise<Project | null> {
    // 检查ID是否有效
    if (isNaN(id) || !Number.isInteger(id)) {
      return null;
    }
    return await Project.findByPk(id);
  }

  /**
   * 根据条件查找项目列表
   * @param filters 过滤条件
   * @param options 分页选项
   * @returns 项目列表和总数
   */
  async findAndCountAll(
    filters: any = {},
    options: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ rows: Project[]; count: number }> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const where: any = {};

    // 处理ID过滤
    if (filters.id !== undefined && !isNaN(filters.id) && Number.isInteger(filters.id)) {
      console.log('filters.id', filters.id);
      where.id = filters.id;
    }

    // 处理归档状态过滤
    if (filters.isArchived !== undefined) {
      where.isArchived = filters.isArchived;
    }

    // 处理私有项目过滤
    if (filters.isPrivate !== undefined) {
      where.isPrivate = filters.isPrivate;
    }

    // 处理创建人过滤
    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    // 处理成员过滤 - 使用MySQL的JSON_CONTAINS函数
    if (filters.memberId) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        Sequelize.where(
          Sequelize.fn('JSON_CONTAINS', Sequelize.col('members'), JSON.stringify([{ userId: filters.memberId }])),
          1
        )
      );
    }

    // 处理搜索关键词
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    return await Project.findAndCountAll({
      where,
      offset,
      limit,
      order: [
        ['lastActivity', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
  }

  /**
   * 更新项目
   * @param id 项目ID
   * @param updateData 更新数据
   * @returns 更新后的项目
   */
  async update(id: number, updateData: Partial<ProjectAttributes>): Promise<Project | null> {
    const project = await this.findById(id);
    if (!project) return null;

    return await project.update(updateData);
  }

  /**
   * 删除项目
   * @param id 项目ID
   * @returns 删除结果
   */
  async delete(id: number): Promise<boolean> {
    const project = await this.findById(id);
    if (!project) return false;

    await project.destroy();
    return true;
  }

  /**
   * 添加项目成员
   * @param projectId 项目ID
   * @param userId 用户ID
   * @param role 角色
   * @returns 更新后的项目
   */
  async addMember(projectId: number, userId: number, role: string = 'member'): Promise<Project | null> {
    const project = await this.findById(projectId);
    if (!project) return null;

    try {
      return await project.addMember(userId, role);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 移除项目成员
   * @param projectId 项目ID
   * @param userId 用户ID
   * @returns 更新后的项目
   */
  async removeMember(projectId: number, userId: number): Promise<Project | null> {
    const project = await this.findById(projectId);
    if (!project) return null;

    return await project.removeMember(userId);
  }

  /**
   * 检查用户是否是项目成员
   * @param projectId 项目ID
   * @param userId 用户ID
   * @returns 是否是成员
   */
  async isMember(projectId: number, userId: number): Promise<boolean> {
    const project = await this.findById(projectId);
    if (!project) return false;

    return project.members.some(member => member.userId === userId);
  }

  /**
   * 检查用户是否有特定权限
   * @param projectId 项目ID
   * @param userId 用户ID
   * @param permission 权限名称
   * @returns 是否有权限
   */
  async hasPermission(projectId: number, userId: number, permission: string): Promise<boolean> {
    const project = await this.findById(projectId);
    if (!project) return false;

    return project.hasPermission(userId, permission);
  }

}