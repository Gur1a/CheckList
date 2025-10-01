import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { TagService } from '../services/TagService';

// 定义Request类型扩展，添加user属性
interface AuthRequest extends Request {
  user?: {
    id: number;
    // 其他用户属性
  };
}

export class TagController {
  private tagService: TagService;

  constructor() {
    this.tagService = new TagService();
  }

  // 获取当前用户的所有标签
  getTags = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    const tags = await this.tagService.getUserTags(userId);

    res.json({
      success: true,
      message: '获取标签列表成功',
      data: tags
    });
  });

  // 创建新标签
  createTag = catchAsync(async (req: AuthRequest, res: Response) => {
    const { name, color } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 验证标签名
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('标签名不能为空', 400, 'VALIDATION_ERROR');
    }

    // 验证标签名长度
    if (name.length > 20) {
      throw new AppError('标签名不能超过20个字符', 400, 'VALIDATION_ERROR');
    }

    // 创建标签
    const tag = await this.tagService.createTag({
      name: name.trim(),
      color: color || '#4D4D4D', // 默认灰色
      userId
    });

    res.status(201).json({
      success: true,
      message: '创建标签成功',
      data: tag
    });
  });

  // 更新标签
  updateTag = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 验证标签ID
    const tagId = parseInt(id);
    if (isNaN(tagId)) {
      throw new AppError('无效的标签ID', 400, 'VALIDATION_ERROR');
    }

    // 验证标签名
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('标签名不能为空', 400, 'VALIDATION_ERROR');
      }
      if (name.length > 20) {
        throw new AppError('标签名不能超过20个字符', 400, 'VALIDATION_ERROR');
      }
    }

    // 更新标签
    const updatedTag = await this.tagService.updateTag(tagId, {
      name: name?.trim(),
      color
    }, userId);

    res.json({
      success: true,
      message: '更新标签成功',
      data: updatedTag
    });
  });

  // 删除标签
  deleteTag = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 验证标签ID
    const tagId = parseInt(id);
    if (isNaN(tagId)) {
      throw new AppError('无效的标签ID', 400, 'VALIDATION_ERROR');
    }

    // 删除标签
    await this.tagService.deleteTag(tagId, userId);

    res.json({
      success: true,
      message: '删除标签成功',
      data: null
    });
  });

  // 获取带有特定标签的任务
  getTasksByTag = catchAsync(async (req: AuthRequest, res: Response) => {
    const { tagId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 验证标签ID
    const parsedTagId = parseInt(tagId);
    if (isNaN(parsedTagId)) {
      throw new AppError('无效的标签ID', 400, 'VALIDATION_ERROR');
    }

    // 验证分页参数
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new AppError('无效的分页参数', 400, 'VALIDATION_ERROR');
    }

    // 获取带标签的任务
    const result = await this.tagService.getTasksByTag(parsedTagId, userId, {
      page: pageNum,
      limit: limitNum
    });

    res.json({
      success: true,
      message: '获取带标签的任务成功',
      data: result
    });
  });

  // 为任务添加标签
  addTagToTask = catchAsync(async (req: AuthRequest, res: Response) => {
    const { taskId, tagId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 验证任务ID和标签ID
    const parsedTaskId = parseInt(taskId);
    const parsedTagId = parseInt(tagId);
    if (isNaN(parsedTaskId) || isNaN(parsedTagId)) {
      throw new AppError('无效的任务ID或标签ID', 400, 'VALIDATION_ERROR');
    }

    // 添加标签到任务
    await this.tagService.addTagToTask(parsedTaskId, parsedTagId, userId);

    res.json({
      success: true,
      message: '添加标签到任务成功',
      data: null
    });
  });

  // 从任务中移除标签
  removeTagFromTask = catchAsync(async (req: AuthRequest, res: Response) => {
    const { taskId, tagId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 验证任务ID和标签ID
    const parsedTaskId = parseInt(taskId);
    const parsedTagId = parseInt(tagId);
    if (isNaN(parsedTaskId) || isNaN(parsedTagId)) {
      throw new AppError('无效的任务ID或标签ID', 400, 'VALIDATION_ERROR');
    }

    // 从任务中移除标签
    await this.tagService.removeTagFromTask(parsedTaskId, parsedTagId, userId);

    res.json({
      success: true,
      message: '从任务中移除标签成功',
      data: null
    });
  });
  
  // 获取任务的所有标签
  getTagsForTask = catchAsync(async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 验证任务ID
    const parsedTaskId = parseInt(taskId);
    if (isNaN(parsedTaskId)) {
      throw new AppError('无效的任务ID', 400, 'VALIDATION_ERROR');
    }

    // 获取任务的所有标签
    const tags = await this.tagService.getTagsForTask(parsedTaskId, userId);

    res.json({
      success: true,
      message: '获取任务标签成功',
      data: tags
    });
  });

  getTagById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
    }

    // 验证标签ID
    const tagId = parseInt(id);
    if (isNaN(tagId)) {
      throw new AppError('无效的标签ID', 400, 'VALIDATION_ERROR');
    }

    // 获取标签详情
    const tag = await this.tagService.getTagById(tagId, userId);

    res.json({
      success: true,
      message: '获取标签成功',
      data: tag
    });
  });
}