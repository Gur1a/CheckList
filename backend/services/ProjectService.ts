import initializeModels from '../models/index';
import { AppError } from '../middleware/errorHandler';
import { log } from '../middleware/logger';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectAttributes, ProjectCreationAttributes } from '../models/Project';

export class ProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    /**
     * 创建新项目
     * @param projectData 项目数据
     * @param userId 创建者ID
     * @returns 创建的项目
     */
    async createProject(projectData: Omit<ProjectCreationAttributes, 'createdBy'>, userId: number) {
        try {
        // 设置创建者
        const dataWithCreator: ProjectCreationAttributes = {
            ...projectData,
            createdBy: userId
        };

        // 创建项目
        const project = await this.projectRepository.create(dataWithCreator);
        
        log.info(`用户 ${userId} 创建了项目 ${project.id}: ${project.name}`);
        return project;
        } catch (error) {
        log.error('创建项目失败', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('创建项目失败', 500, 'PROJECT_CREATE_FAILED');
        }
    }

    /**
     * 获取项目列表
     * @param filters 过滤条件
     * @param options 分页选项
     * @returns 项目列表和分页信息
     */
    async getProjects(
        filters: any = {}, 
        options: { page: number; limit: number } = { page: 1, limit: 20 }
    ) {
        try {
            const result = await this.projectRepository.findAndCountAll(filters, options);
            
            return {
                items: result.rows,
                totalItems: result.count,
                totalPages: Math.ceil(result.count / options.limit),
                currentPage: options.page,
                hasNextPage: options.page < Math.ceil(result.count / options.limit),
                hasPrevPage: options.page > 1
            };
        } catch (error) {
            log.error('获取项目列表失败', error);
            throw new AppError('获取项目列表失败', 500, 'PROJECT_LIST_FAILED');
        }
    }

    /**
     * 获取单个项目
     * @param projectId 项目ID
     * @param userId 用户ID（用于权限检查）
     * @returns 项目详情
     */
    async getProjectById(projectId: number, userId: number) {
        try {
        const project = await this.projectRepository.findById(projectId);
        
        if (!project) {
            throw new AppError('项目不存在', 404, 'PROJECT_NOT_FOUND');
        }
        
        // 检查用户是否有权限访问该项目
        const isMember = await this.projectRepository.isMember(projectId, userId);
        if (project.isPrivate && !isMember) {
            throw new AppError('您没有权限访问此项目', 403, 'PROJECT_ACCESS_DENIED');
        }
        
        return project;
        } catch (error) {
        log.error('获取项目失败', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('获取项目失败', 500, 'PROJECT_GET_FAILED');
        }
    }

    /**
     * 更新项目
     * @param projectId 项目ID
     * @param updateData 更新数据
     * @param userId 更新者ID
     * @returns 更新后的项目
     */
    async updateProject(projectId: number, updateData: Partial<ProjectAttributes>, userId: number) {
        try {
        // 检查项目是否存在
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new AppError('项目不存在', 404, 'PROJECT_NOT_FOUND');
        }
        
        // 检查用户是否有权限编辑项目
        const canEdit = await this.projectRepository.hasPermission(projectId, userId, 'canEditProject');
        if (!canEdit) {
            throw new AppError('您没有权限编辑此项目', 403, 'PROJECT_EDIT_DENIED');
        }
        
        // 更新项目
        const updatedProject = await this.projectRepository.update(projectId, updateData);
        
        // 更新活动时间
        if (updatedProject) {
            await updatedProject.updateActivity();
        }
        
        log.info(`用户 ${userId} 更新了项目 ${projectId}: ${project.name}`);
        return updatedProject;
        } catch (error) {
        log.error('更新项目失败', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('更新项目失败', 500, 'PROJECT_UPDATE_FAILED');
        }
    }

    /**
     * 删除项目
     * @param projectId 项目ID
     * @param userId 删除者ID
     * @returns 删除结果
     */
    async deleteProject(projectId: number, userId: number) {
        try {
        // 检查项目是否存在
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new AppError('项目不存在', 404, 'PROJECT_NOT_FOUND');
        }
        
        // 检查用户是否有权限删除项目
        const canDelete = await this.projectRepository.hasPermission(projectId, userId, 'canDeleteProject');
        if (!canDelete) {
            throw new AppError('您没有权限删除此项目', 403, 'PROJECT_DELETE_DENIED');
        }
        
        // 删除项目
        const result = await this.projectRepository.delete(projectId);
        
        log.info(`用户 ${userId} 删除了项目 ${projectId}: ${project.name}`);
        return result;
        } catch (error) {
        log.error('删除项目失败', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('删除项目失败', 500, 'PROJECT_DELETE_FAILED');
        }
    }

    /**
   * 添加项目成员
   * @param projectId 项目ID
   * @param userId 要添加的用户ID
   * @param role 角色
   * @param currentUserId 当前用户ID
   * @returns 更新后的项目
   */
    async addProjectMember(projectId: number, userId: number, role: string, currentUserId: number) {
        try {
        // 检查项目是否存在
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new AppError('项目不存在', 404, 'PROJECT_NOT_FOUND');
        }
        
        // 检查当前用户是否有权限管理成员
        const canManageMembers = await this.projectRepository.hasPermission(projectId, currentUserId, 'canManageMembers');
        if (!canManageMembers) {
            throw new AppError('您没有权限管理项目成员', 403, 'PROJECT_MANAGE_MEMBERS_DENIED');
        }
        
        // 添加成员
        const updatedProject = await this.projectRepository.addMember(projectId, userId, role);
        
        // 更新活动时间
        if (updatedProject) {
            await updatedProject.updateActivity();
        }
        
        log.info(`用户 ${currentUserId} 添加了用户 ${userId} 到项目 ${projectId} 作为 ${role}`);
        return updatedProject;
        } catch (error: any) {
        log.error('添加项目成员失败', error);
        if (error instanceof AppError) {
            throw error;
        }
        // 处理自定义错误
        if (error.message === '用户已是项目成员') {
            throw new AppError('用户已是项目成员', 400, 'USER_ALREADY_MEMBER');
        }
        throw new AppError('添加项目成员失败', 500, 'PROJECT_ADD_MEMBER_FAILED');
        }
    }

    /**
     * 移除项目成员
     * @param projectId 项目ID
     * @param userId 要移除的用户ID
     * @param currentUserId 当前用户ID
     * @returns 更新后的项目
     */
    async removeProjectMember(projectId: number, userId: number, currentUserId: number) {
        try {
        // 检查项目是否存在
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new AppError('项目不存在', 404, 'PROJECT_NOT_FOUND');
        }
        
        // 检查当前用户是否有权限管理成员
        const canManageMembers = await this.projectRepository.hasPermission(projectId, currentUserId, 'canManageMembers');
        if (!canManageMembers) {
            throw new AppError('您没有权限管理项目成员', 403, 'PROJECT_MANAGE_MEMBERS_DENIED');
        }
        
        // 不允许移除所有者
        const ownerMember = project.members.find(member => member.role === 'owner');
        if (ownerMember && ownerMember.userId === userId) {
            throw new AppError('无法移除项目所有者', 400, 'CANNOT_REMOVE_OWNER');
        }
        
        // 移除成员
        const updatedProject = await this.projectRepository.removeMember(projectId, userId);
        
        // 更新活动时间
        if (updatedProject) {
            await updatedProject.updateActivity();
        }
        
        log.info(`用户 ${currentUserId} 从项目 ${projectId} 中移除了用户 ${userId}`);
        return updatedProject;
        } catch (error) {
        log.error('移除项目成员失败', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('移除项目成员失败', 500, 'PROJECT_REMOVE_MEMBER_FAILED');
        }
    }

    /**
     * 检查用户是否是项目成员
     * @param projectId 项目ID
     * @param userId 用户ID
     * @returns 是否是成员
     */
    async isProjectMember(projectId: number, userId: number) {
        try {
        return await this.projectRepository.isMember(projectId, userId);
        } catch (error) {
        log.error('检查项目成员失败', error);
        throw new AppError('检查项目成员失败', 500, 'PROJECT_CHECK_MEMBER_FAILED');
        }
    }

    /**
     * 获取用户可访问的项目列表
     * @param userId 用户ID
     * @param options 分页选项
     * @returns 用户可访问的项目列表
     */
    async getUserProjects(userId: number, options: { page: number; limit: number } = { page: 1, limit: 20 }) {
        try {
            const filters = {
                memberId: userId,
                isArchived: false
            };
            
            return await this.getProjects(filters, options);
        } catch (error) {
            log.error('获取用户项目失败', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('获取用户项目失败', 500, 'USER_PROJECTS_FAILED');
        }
    }

    /**
     * 归档项目
     * @param projectId 项目ID
     * @param userId 用户ID
     * @returns 更新后的项目
     */
    async archiveProject(projectId: number, userId: number) {
        try {
        return await this.updateProject(projectId, { isArchived: true }, userId);
        } catch (error) {
        log.error('归档项目失败', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('归档项目失败', 500, 'PROJECT_ARCHIVE_FAILED');
        }
    }

    /**
     * 取消归档项目
     * @param projectId 项目ID
     * @param userId 用户ID
     * @returns 更新后的项目
     */
    async unarchiveProject(projectId: number, userId: number) {
        try {
        return await this.updateProject(projectId, { isArchived: false }, userId);
        } catch (error) {
        log.error('取消归档项目失败', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('取消归档项目失败', 500, 'PROJECT_UNARCHIVE_FAILED');
        }
    }
}