import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { ProjectService } from '../services/ProjectService';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  /**
   * 创建新项目
   * POST /api/projects
   */
  createProject = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const projectData = req.body;
    const result = await this.projectService.createProject(projectData, userId);
    
    res.status(201).json({
      success: true,
      message: '创建项目成功',
      data: result
    });
  });

  /**
   * 获取项目列表
   * GET /api/projects
   */
  getProjects = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      console.log('用户未认证ID', userId);
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const {  } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const filters = {
      createdBy: userId
    }
    
    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await this.projectService.getProjects(filters, options);
    
    res.json({
      success: true,
      message: '获取项目列表成功',
      data: result
    });
  });

  /**
   * 获取单个项目详情
   * GET /api/projects/:id
   */
  getProjectById = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const result = await this.projectService.getProjectById(parseInt(id), userId);
    
    res.json({
      success: true,
      message: '获取项目详情成功',
      data: result
    });
  });

  /**
   * 更新项目
   * PUT /api/projects/:id
   */
  updateProject = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;
    console.log('用户ID', userId);
    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const updateData = req.body;
    const result = await this.projectService.updateProject(parseInt(id), updateData, userId);
    
    res.json({
      success: true,
      message: '更新项目成功',
      data: result
    });
  });

  /**
   * 删除项目
   * DELETE /api/projects/:id
   */
  deleteProject = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const result = await this.projectService.deleteProject(parseInt(id), userId);
    
    if (!result) {
      throw new AppError('项目不存在', 404, 'PROJECT_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: '删除项目成功'
    });
  });

  /**
   * 添加项目成员
   * POST /api/projects/:id/members
   */
  addProjectMember = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const { memberId, role } = req.body;
    
    const result = await this.projectService.addProjectMember(parseInt(id), memberId, role, userId);
    
    res.status(201).json({
      success: true,
      message: '添加项目成员成功',
      data: result
    });
  });

  /**
   * 移除项目成员
   * DELETE /api/projects/:id/members/:memberId
   */
  removeProjectMember = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const { id, memberId } = req.params;
    
    const result = await this.projectService.removeProjectMember(parseInt(id), parseInt(memberId), userId);
    
    res.json({
      success: true,
      message: '移除项目成员成功',
      data: result
    });
  });

  /**
   * 获取当前用户的项目列表
   * GET /api/projects/users/:userId
   */
  getUserProjects = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 获取URL参数中的用户ID（虽然当前用户ID可能与这个相同）
    const targetUserId = parseInt(req.params.userId);

    // 检查用户是否有权限查看其他用户的项目
    if (targetUserId !== userId) {
      // 在实际应用中，这里可能需要更复杂的权限检查
      // 例如，管理员可以查看所有用户的项目
      throw new AppError('您没有权限查看此用户的项目', 403, 'PERMISSION_DENIED');
    }

    const { page = 1, limit = 20, ...filters } = req.query;
    
    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    // 转换filters中的数字类型参数
    if (filters.search !== undefined) {
      filters.search = filters.search as string;
    }
    filters.createdBy = userId;

    const result = await this.projectService.getProjects(filters, options);
    
    res.json({
      success: true,
      message: '获取用户项目列表成功',
      data: result
    });
  });

  /**
   * 归档项目
   * PUT /api/projects/:id/archive
   */
  archiveProject = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const result = await this.projectService.archiveProject(parseInt(id), userId);
    
    res.json({
      success: true,
      message: '归档项目成功',
      data: result
    });
  });

  /**
   * 取消归档项目
   * PUT /api/projects/:id/unarchive
   */
  unarchiveProject = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const result = await this.projectService.unarchiveProject(parseInt(id), userId);
    
    res.json({
      success: true,
      message: '取消归档项目成功',
      data: result
    });
  });

  search = catchAsync(async (req: Request, res: Response) => {
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const { query, page = 1, limit = 20 } = req.query;
    
    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await this.projectService.getProjects({search: query as string}, options);
    
    res.json({
      success: true,
      message: '搜索项目成功',
      data: result
    });
  });
}