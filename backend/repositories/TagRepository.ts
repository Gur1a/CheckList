import { Tag, TagAttributes, TagCreationAttributes } from '../models/Tag';
import { Task } from '../models/Task';
import { TaskTag } from '../models/TaskTag';
import { Op, Sequelize } from 'sequelize';

/**
 * 标签存储库，处理标签相关的数据库操作
 */
export class TagRepository {
  /**
   * 创建标签
   * @param tagData 标签数据
   * @returns 创建的标签
   */
  async create(tagData: TagCreationAttributes): Promise<Tag> {
    return await Tag.create(tagData);
  }

  /**
   * 根据ID查找标签
   * @param id 标签ID
   * @returns 标签对象或null
   */
  async findById(id: number): Promise<Tag | null> {
    // 检查ID是否有效
    if (isNaN(id) || !Number.isInteger(id)) {
      return null;
    }
    return await Tag.findByPk(id);
  }

  /**
   * 根据用户ID查找标签列表
   * @param userId 用户ID
   * @returns 标签列表
   */
  async findByUserId(userId: number): Promise<Tag[]> {
    return await Tag.findAll({
      where: {
        userId
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 根据ID数组查找标签
   * @param ids 标签ID数组
   * @returns 标签对象数组
   */
  async findByIds(ids: number[]): Promise<Tag[]> {
    return await Tag.findAll({
      where: {
        id: ids
      }
    });
  }

  /**
   * 更新标签
   * @param id 标签ID
   * @param updateData 更新数据
   * @returns 更新后的标签
   */
  async update(id: number, updateData: Partial<TagAttributes>): Promise<Tag | null> {
    const tag = await this.findById(id);
    if (!tag) return null;

    return await tag.update(updateData);
  }

  /**
   * 删除标签
   * @param id 标签ID
   * @returns 删除结果
   */
  async delete(id: number): Promise<boolean> {
    const tag = await this.findById(id);
    if (!tag) return false;

    await tag.destroy();
    return true;
  }

  /**
   * 检查标签名是否已存在
   * @param name 标签名称
   * @param userId 用户ID
   * @param excludeId 排除的标签ID（用于更新时）
   * @returns 是否存在
   */
  async isNameExists(name: string, userId: number, excludeId?: number): Promise<boolean> {
    const where: any = {
      name,
      userId
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const existingTag = await Tag.findOne({
      where
    });

    return !!existingTag;
  }

  /**
   * 获取带有特定标签的任务总数
   * @param tagId 标签ID
   * @param userId 用户ID（可选，用于过滤用户的任务）
   * @returns 任务总数
   */
  async getTasksCountByTag(tagId: number, userId?: number): Promise<number> {
    const count = await TaskTag.count({
      include: [
        {
          model: Task,
          where: userId ? { createdBy: userId } : {}
        }
      ],
      where: { tagId }
    });
    return count;
  }

  /**
   * 查找带有特定标签的所有任务
   * @param tagId 标签ID
   * @param userId 用户ID（可选，用于过滤用户的任务）
   * @param pagination 分页参数（可选）
   * @returns 任务列表
   */
  async findTasksByTag(tagId: number, userId?: number, pagination?: { offset: number; limit: number }): Promise<Task[]> {
    // 直接从TaskTag表查询关联的任务
    const taskTags = await TaskTag.findAll({
      where: { tagId },
      include: [
        {
          model: Task,
          attributes: ['id', 'title', 'status', 'priority', 'dueDate', 'createdAt'],
          where: userId ? { createdBy: userId } : {}
        }
      ],
      offset: pagination?.offset,
      limit: pagination?.limit
    });
    
    // 提取任务数据
    return taskTags.map(taskTag => taskTag.get('Task') as Task);
  }

  /**
   * 为任务添加标签
   * @param taskId 任务ID
   * @param tagId 标签ID
   * @returns 是否添加成功
   */
  async addTagToTask(taskId: number, tagId: number): Promise<boolean> {
    try {
      await TaskTag.create({
        taskId,
        tagId
      });
      return true;
    } catch (error) {
      console.error('添加标签到任务失败:', error);
      return false;
    }
  }

  /**
   * 从任务中移除标签
   * @param taskId 任务ID
   * @param tagId 标签ID
   * @returns 是否移除成功
   */
  async removeTagFromTask(taskId: number, tagId: number): Promise<boolean> {
    try {
      const result = await TaskTag.destroy({
        where: {
          taskId,
          tagId
        }
      });
      return result > 0;
    } catch (error) {
      console.error('从任务中移除标签失败:', error);
      return false;
    }
  }

  /**
   * 获取标签数量统计
   * @param userId 用户ID
   * @returns 标签数量
   */
  async getCountByUserId(userId: number): Promise<number> {
    return await Tag.count({
      where: {
        userId
      }
    });
  }
  
  /**
   * 获取特定任务的所有标签
   * @param taskId 任务ID
   * @param userId 用户ID（可选，用于过滤用户的标签）
   * @returns 标签列表
   */
  async findTagsByTaskId(taskId: number, userId?: number): Promise<number[]> {
    // 从TaskTag表通过包含标签的方式查询
    const tagIds = await TaskTag.findAll({
      where: { taskId },
    });

    return tagIds.map(tagId => tagId.tagId);
  }
}