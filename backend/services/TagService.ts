import { AppError } from '../middleware/errorHandler';
import { log } from '../middleware/logger';
import { TagRepository } from '../repositories/TagRepository';
import { Tag, TagCreationAttributes } from '../models/Tag';
import { Task } from '../models/Task';
import { PaginationParams, PaginatedResponse } from '../types/shared';

/**
 * 标签服务，处理标签相关的业务逻辑
 */
export class TagService {
  private tagRepository: TagRepository;

  constructor() {
    this.tagRepository = new TagRepository();
  }

  /**
   * 创建标签
   * @param tagData 标签数据
   * @returns 创建的标签
   * @throws 标签名已存在或其他错误
   */
  async createTag(tagData: TagCreationAttributes): Promise<Tag> {
    try {
      // 验证标签名是否已存在
      const isExists = await this.tagRepository.isNameExists(
        tagData.name,
        tagData.userId
      );

      if (isExists) {
        throw new AppError('标签名已存在', 400);
      }

      // 创建标签
      const tag = await this.tagRepository.create(tagData);
      log.info(`创建标签成功: ${tag.id}, 用户ID: ${tag.userId}`);
      return tag;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      log.error(`创建标签失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('创建标签失败，请稍后再试', 500);
    }
  }

  /**
   * 获取用户的所有标签
   * @param userId 用户ID
   * @returns 标签列表
   */
  async getUserTags(userId: number): Promise<Tag[]> {
    try {
      const tags = await this.tagRepository.findByUserId(userId);
      log.debug(`获取用户标签成功: 用户ID: ${userId}, 标签数量: ${tags.length}`);
      return tags;
    } catch (error) {
      log.error(`获取用户标签失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('获取标签列表失败，请稍后再试', 500);
    }
  }

  /**
   * 根据ID获取标签
   * @param tagId 标签ID
   * @param userId 用户ID（用于验证所有权）
   * @returns 标签对象
   * @throws 标签不存在或无权限访问
   */
  async getTagById(tagId: number, userId: number): Promise<Tag> {
    try {
      const tag = await this.tagRepository.findById(tagId);
      
      if (!tag) {
        throw new AppError('标签不存在', 404);
      }

      // 验证用户权限
      if (tag.userId !== userId) {
        throw new AppError('您无权访问此标签', 403);
      }

      return tag;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      log.error(`获取标签失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('获取标签失败，请稍后再试', 500);
    }
  }

  /**
   * 更新标签
   * @param tagId 标签ID
   * @param updateData 更新数据
   * @param userId 用户ID（用于验证所有权）
   * @returns 更新后的标签
   * @throws 标签不存在、无权限访问或标签名已存在
   */
  async updateTag(
    tagId: number,
    updateData: Partial<TagCreationAttributes>,
    userId: number
  ): Promise<Tag> {
    try {
      // 检查标签是否存在且归用户所有
      const existingTag = await this.getTagById(tagId, userId);

      // 如果更新了标签名，检查新名称是否已存在
      if (updateData.name && updateData.name !== existingTag.name) {
        const isNameExists = await this.tagRepository.isNameExists(
          updateData.name,
          userId,
          tagId
        );

        if (isNameExists) {
          throw new AppError('标签名已存在', 400);
        }
      }

      // 更新标签
      const updatedTag = await this.tagRepository.update(tagId, updateData);
      log.info(`更新标签成功: ${tagId}, 用户ID: ${userId}`);
      return updatedTag!;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      log.error(`更新标签失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('更新标签失败，请稍后再试', 500);
    }
  }

  /**
   * 删除标签
   * @param tagId 标签ID
   * @param userId 用户ID（用于验证所有权）
   * @returns 是否删除成功
   * @throws 标签不存在或无权限访问
   */
  async deleteTag(tagId: number, userId: number): Promise<boolean> {
    try {
      // 检查标签是否存在且归用户所有
      await this.getTagById(tagId, userId);

      // 删除标签
      const result = await this.tagRepository.delete(tagId);
      log.info(`删除标签成功: ${tagId}, 用户ID: ${userId}`);
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      log.error(`删除标签失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('删除标签失败，请稍后再试', 500);
    }
  }

  /**
   * 获取带有特定标签的所有任务
   * @param tagId 标签ID
   * @param userId 用户ID（用于验证所有权和过滤任务）
   * @param pagination 分页参数
   * @returns 分页后的任务列表
   * @throws 标签不存在或无权限访问
   */
  async getTasksByTag(tagId: number, userId: number, pagination: PaginationParams): Promise<PaginatedResponse<Task>> {
    try {
      // 检查标签是否存在且归用户所有
      await this.getTagById(tagId, userId);

      // 获取带有该标签的任务总数
      const totalItems = await this.tagRepository.getTasksCountByTag(tagId, userId);
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // 获取分页后的任务列表
      const tasks = await this.tagRepository.findTasksByTag(tagId, userId, { offset, limit });
      log.debug(`获取带标签的任务成功: 标签ID: ${tagId}, 用户ID: ${userId}, 任务数量: ${tasks.length}`);

      // 构建分页响应
      const totalPages = Math.ceil(totalItems / limit);
      return {
        items: tasks,
        totalItems,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      log.error(`获取带标签的任务失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('获取任务列表失败，请稍后再试', 500);
    }
  }

  /**
   * 为任务添加标签
   * @param taskId 任务ID
   * @param tagId 标签ID
   * @param userId 用户ID（用于验证所有权）
   * @returns 是否添加成功
   * @throws 标签不存在或无权限访问
   */
  async addTagToTask(taskId: number, tagId: number, userId: number): Promise<boolean> {
    try {
      // 检查标签是否存在且归用户所有
      await this.getTagById(tagId, userId);

      // 为任务添加标签
      const result = await this.tagRepository.addTagToTask(taskId, tagId);
      log.info(`为任务添加标签成功: 任务ID: ${taskId}, 标签ID: ${tagId}, 用户ID: ${userId}`);
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      log.error(`为任务添加标签失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('添加标签失败，请稍后再试', 500);
    }
  }

  /**
   * 从任务中移除标签
   * @param taskId 任务ID
   * @param tagId 标签ID
   * @param userId 用户ID（用于验证所有权）
   * @returns 是否移除成功
   * @throws 标签不存在或无权限访问
   */
  async removeTagFromTask(taskId: number, tagId: number, userId: number): Promise<boolean> {
    try {
      // 检查标签是否存在且归用户所有
      await this.getTagById(tagId, userId);

      // 从任务中移除标签
      const result = await this.tagRepository.removeTagFromTask(taskId, tagId);
      log.info(`从任务中移除标签成功: 任务ID: ${taskId}, 标签ID: ${tagId}, 用户ID: ${userId}`);
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      log.error(`从任务中移除标签失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('移除标签失败，请稍后再试', 500);
    }
  }

  /**
   * 获取用户的标签数量
   * @param userId 用户ID
   * @returns 标签数量
   */
  async getTagCountByUser(userId: number): Promise<number> {
    try {
      const count = await this.tagRepository.getCountByUserId(userId);
      log.debug(`获取用户标签数量成功: 用户ID: ${userId}, 标签数量: ${count}`);
      return count;
    } catch (error) {
      log.error(`获取用户标签数量失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('获取标签数量失败，请稍后再试', 500);
    }
  }
  
  /**
   * 获取特定任务的所有标签
   * @param taskId 任务ID
   * @param userId 用户ID（用于验证所有权）
   * @returns 标签列表
   */
  async getTagsForTask(taskId: number, userId: number): Promise<Tag[]> {
    try {
      // 获取任务的所有标签
      const tagIds = await this.tagRepository.findTagsByTaskId(taskId);
      const tags = await this.tagRepository.findByIds(tagIds);
      return tags;
    } catch (error) {
      log.error(`获取任务标签失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError('获取标签失败，请稍后再试', 500);
    }
  }
}