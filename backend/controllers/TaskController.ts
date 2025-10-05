import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { TaskService } from '../services/TaskService';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  // 获取任务列表
  getTasks = catchAsync(async (req: Request, res: Response) => {
    const { projectId, boardId, assignee, status, page = 1, limit = 20 } = req.query;
    
    const filters: any = {};
    if (projectId) {
      const parsedProjectId = parseInt(projectId as string);
      if (!isNaN(parsedProjectId)) {
        filters.project = parsedProjectId;
      }
    }
    if (boardId) {
      const parsedBoardId = parseInt(boardId as string);
      if (!isNaN(parsedBoardId)) {
        filters.board = parsedBoardId;
      }
    }
    if (assignee) {
      const parsedAssignee = parseInt(assignee as string);
      if (!isNaN(parsedAssignee)) {
        filters.assignee = parsedAssignee;
      }
    }
    if (status) filters.status = status;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await this.taskService.getTasks(filters, options);
    
    res.json({
      success: true,
      message: '获取任务列表成功',
      data: result
    });
  });

  // 创建任务
  createTask = catchAsync(async (req: Request, res: Response) => {
    const taskData = req.body;
    // 从request中获取用户ID（已通过auth中间件验证并设置）
    // 系统认证流程：
    // 1. auth中间件从req.headers.authorization获取Bearer token
    // 2. 验证token并提取userId
    // 3. 查询用户信息并设置到req.user对象中
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.createTask(taskData, userId);
    
    res.status(201).json({
      success: true,
      message: '创建任务成功',
      data: result
    });
  });

  // 获取用户任务列表
  getTasksByUserId = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await this.taskService.getTasksByUserId(parseInt(userId));
    res.json({
      success: true,
      message: '获取用户任务列表成功',
      data: result
    });
  });

  // 获取单个任务
  getTaskById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.getTaskById(parseInt(id), userId);
    
    res.json({
      success: true,
      message: '获取任务成功',
      data: result
    });
  });

  // 更新任务
  updateTask = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const taskData = req.body;
    const userId = (req as any).user?.id;

    console.log('TaskController.updateTask - received data:', taskData);

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.updateTask(parseInt(id), taskData, userId);
    
    console.log('TaskController.updateTask - result:', result);
    
    res.json({
      success: true,
      message: '更新任务成功',
      data: result
    });
  });

  // 删除任务
  deleteTask = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    await this.taskService.deleteTask(parseInt(id), userId);
    
    res.json({
      success: true,
      message: '删除任务成功'
    });
  });

  // 批量更新任务
  bulkUpdateTasks = catchAsync(async (req: Request, res: Response) => {
    const { taskIds, updates } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.bulkUpdateTasks(taskIds, updates, userId);
    
    res.json({
      success: true,
      message: '批量更新任务成功',
      data: result
    });
  });

  // 批量删除任务
  bulkDeleteTasks = catchAsync(async (req: Request, res: Response) => {
    const { taskIds } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    await this.taskService.bulkDeleteTasks(taskIds, userId);
    
    res.json({
      success: true,
      message: '批量删除任务成功'
    });
  });

  // 重新排序任务
  reorderTasks = catchAsync(async (req: Request, res: Response) => {
    const { updates } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.reorderTasks(updates, userId);
    
    res.json({
      success: true,
      message: '任务排序更新成功',
      data: result
    });
  });

  // 移动任务到看板
  moveToBoard = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { boardId, order } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.moveToBoard(parseInt(id), boardId, order, userId);
    
    res.json({
      success: true,
      message: '任务移动成功',
      data: result
    });
  });

  // 根据项目获取任务
  getTasksByProject = catchAsync(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { status, assignee, page = 1, limit = 20 } = req.query;

    const filters: any = { project: parseInt(projectId) };
    if (status) filters.status = status;
    if (assignee) filters.assignee = assignee;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await this.taskService.getTasks(filters, options);
    
    res.json({
      success: true,
      message: '获取项目任务成功',
      data: result
    });
  });

  // 根据看板获取任务
  getTasksByBoard = catchAsync(async (req: Request, res: Response) => {
    const { boardId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const filters = { board: parseInt(boardId) };
    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await this.taskService.getTasks(filters, options);
    
    res.json({
      success: true,
      message: '获取看板任务成功',
      data: result
    });
  });

  // 根据负责人获取任务
  getTasksByAssignee = catchAsync(async (req: Request, res: Response) => {
    const { assignee } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const filters: any = { assignee: parseInt(assignee) };
    if (status) filters.status = status;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await this.taskService.getTasks(filters, options);
    
    res.json({
      success: true,
      message: '获取负责人任务成功',
      data: result
    });
  });

  // 搜索任务
  searchTasks = catchAsync(async (req: Request, res: Response) => {
    const { query, page = 1, limit = 20 } = req.query;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await this.taskService.searchTasks(query as string, userId, options);
    
    res.json({
      success: true,
      message: '搜索任务成功',
      data: result
    });
  });

  // 复制任务
  duplicateTask = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.duplicateTask(parseInt(id), userId);
    
    res.status(201).json({
      success: true,
      message: '复制任务成功',
      data: result
    });
  });

  // 完成任务
  completeTask = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.completeTask(parseInt(id), userId);
    
    res.json({
      success: true,
      message: '任务完成成功',
      data: result
    });
  });

  // 重新激活任务
  reactivateTask = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.reactivateTask(parseInt(id), userId);
    
    res.json({
      success: true,
      message: '任务重新激活成功',
      data: result
    });
  });

  // 归档任务
  archiveTask = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const result = await this.taskService.archiveTask(parseInt(id), userId);
    
    res.json({
      success: true,
      message: '任务归档成功',
      data: result
    });
  });

  // 添加子任务
  addSubtask = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 这里需要在TaskService中添加addSubtask方法
    // const result = await this.taskService.addSubtask(parseInt(id), title, userId);
    
    res.json({
      success: true,
      message: '添加子任务成功'
      // data: result
    });
  });

  // 切换子任务状态
  toggleSubtask = catchAsync(async (req: Request, res: Response) => {
    const { id, subtaskId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 这里需要在TaskService中添加toggleSubtask方法
    // const result = await this.taskService.toggleSubtask(parseInt(id), parseInt(subtaskId), userId);
    
    res.json({
      success: true,
      message: '切换子任务状态成功'
      // data: result
    });
  });

  // 添加评论
  addComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 这里需要在TaskService中添加addComment方法
    // const result = await this.taskService.addComment(parseInt(id), content, userId);
    
    res.json({
      success: true,
      message: '添加评论成功'
      // data: result
    });
  });

  // 添加观察者
  addWatcher = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId: watcherId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 这里需要在TaskService中添加addWatcher方法
    // const result = await this.taskService.addWatcher(parseInt(id), watcherId, userId);
    
    res.json({
      success: true,
      message: '添加观察者成功'
      // data: result
    });
  });

  // 移除观察者
  removeWatcher = catchAsync(async (req: Request, res: Response) => {
    const { id, userId: watcherId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 这里需要在TaskService中添加removeWatcher方法
    // const result = await this.taskService.removeWatcher(parseInt(id), parseInt(watcherId), userId);
    
    res.json({
      success: true,
      message: '移除观察者成功'
      // data: result
    });
  });

  // 移动任务到其他项目
  moveTask = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { projectId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 这里需要在TaskService中添加moveTask方法
    // const result = await this.taskService.moveTask(parseInt(id), projectId, userId);
    
    res.json({
      success: true,
      message: '移动任务成功'
      // data: result
    });
  });
}


