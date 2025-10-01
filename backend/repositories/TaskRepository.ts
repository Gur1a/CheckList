import { Task, TaskAttributes, TaskCreationAttributes } from '../models/Task';
import { Project } from '../models/Project';
import { Tag } from '../models/Tag';
import { Op } from 'sequelize';
import { TaskStatus, TaskPriority } from '../types/shared';

export class TaskRepository {
  /**
   * 创建任务
   * @param taskData 任务数据
   * @returns 创建的任务
   */
  async create(taskData: TaskCreationAttributes): Promise<Task> {
    return await Task.create(taskData);
  }

  /**
   * 根据ID查找任务
   * @param id 任务ID
   * @returns 任务对象或null
   */
  async findById(id: number): Promise<Task | null> {
    return await Task.findByPk(id, {
      include: [
        {
          model: Tag,
          as: 'tags',
          through: {
            attributes: [] // 不包含中间表的属性
          },
          attributes: ['id', 'name', 'color'] // 只包含需要的标签字段
        },
        {
          model: Project,
          as: 'projectInfo',
          attributes: ['id', 'name', 'description', 'color', 'icon'] // 只包含需要的项目字段
        }
      ]
    });
  }

  /**
   * 根据条件查找任务列表
   * @param filters 过滤条件
   * @param options 分页选项
   * @returns 任务列表和总数
   */
  async findAndCountAll(
    filters: any = {},
    options: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ rows: Task[]; count: number }> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const where: any = {};

    // 处理状态过滤
    if (filters.status) {
      where.status = filters.status;
    }

    // 处理优先级过滤
    if (filters.priority) {
      where.priority = filters.priority;
    }

    // 处理项目过滤
    if (filters.project) {
      where.project = filters.project;
    }

    // 处理分配人过滤
    if (filters.assignee) {
      where.assignee = filters.assignee;
    }

    // 处理创建人过滤
    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    // 处理标签过滤
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        [Op.contains]: filters.tags
      };
    }

    // 处理搜索关键词
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    // 处理日期范围过滤
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate[Op.gte] = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate[Op.lte] = new Date(filters.dueDateTo);
      }
    }

    // 处理过期任务过滤
    if (filters.isOverdue) {
      where.dueDate = {
        [Op.lt]: new Date(),
        [Op.not]: null
      };
      where.status = {
        [Op.ne]: TaskStatus.DONE
      };
    }

    return await Task.findAndCountAll({
      where,
      offset,
      limit,
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: Tag,
          as: 'tags',
          through: {
            attributes: [] // 不包含中间表的属性
          },
          attributes: ['id', 'name', 'color'] // 只包含需要的标签字段
        },
        {
          model: Project,
          as: 'projectInfo',
          attributes: ['id', 'name', 'description', 'color', 'icon'] // 只包含需要的项目字段
        }
      ]
    });
  }

  /*
   * 根据用户ID查找任务
   * @param userId 用户ID
   * @returns 任务列表
   */
  async findByUserId(userId: number): Promise<Task[]> {
    return await Task.findAll({
      where: {
        createdBy: userId
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          through: {
            attributes: [] // 不包含中间表的属性
          },
          attributes: ['id', 'name', 'color'] // 只包含需要的标签字段
        },
        {
          model: Project,
          as: 'projectInfo',
          attributes: ['id', 'name', 'description', 'color', 'icon'] // 只包含需要的项目字段
        }
      ]
    });
  }

  /**
   * 更新任务
   * @param id 任务ID
   * @param updateData 更新数据
   * @returns 更新后的任务
   */
  async update(id: number, updateData: Partial<TaskAttributes>): Promise<Task | null> {
    const task = await this.findById(id);
    if (!task) return null;

    // 如果状态变为完成，设置完成时间
    if (updateData.status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      updateData.completedAt = new Date();
    }

    // 如果状态变为归档，设置归档时间
    if (updateData.status === TaskStatus.ARCHIVED && task.status !== TaskStatus.ARCHIVED) {
      updateData.archivedAt = new Date();
    }

    return await task.update(updateData);
  }

  /**
   * 删除任务
   * @param id 任务ID
   * @returns 删除结果
   */
  async delete(id: number): Promise<boolean> {
    const task = await this.findById(id);
    if (!task) return false;

    await task.destroy();
    return true;
  }

  /**
   * 批量更新任务状态
   * @param taskIds 任务ID数组
   * @param status 新状态
   * @param userId 用户ID（用于权限检查）
   * @returns 更新结果
   */
  async bulkUpdateStatus(taskIds: number[], status: TaskStatus, userId: number): Promise<number> {
    // 先检查用户权限
    const tasks = await Task.findAll({
      where: {
        id: taskIds
      }
    });

    // 这里应该检查用户是否有权限更新这些任务
    // 简化处理，假设用户有权限

    const updateData: Partial<TaskAttributes> = { status };
    
    // 如果状态变为完成，设置完成时间
    if (status === TaskStatus.DONE) {
      updateData.completedAt = new Date();
    }

    // 如果状态变为归档，设置归档时间
    if (status === TaskStatus.ARCHIVED) {
      updateData.archivedAt = new Date();
    }

    const [affectedCount] = await Task.update(updateData, {
      where: {
        id: taskIds
      }
    });

    return affectedCount;
  }

  /**
   * 批量删除任务
   * @param taskIds 任务ID数组
   * @param userId 用户ID（用于权限检查）
   * @returns 删除结果
   */
  async bulkDelete(taskIds: number[], userId: number): Promise<number> {
    // 先检查用户权限
    const tasks = await Task.findAll({
      where: {
        id: taskIds
      }
    });

    // 这里应该检查用户是否有权限删除这些任务
    // 简化处理，假设用户有权限

    const deletedCount = await Task.destroy({
      where: {
        id: taskIds
      }
    });

    return deletedCount;
  }

  /**
   * 移动任务到另一个项目
   * @param taskId 任务ID
   * @param newProjectId 新项目ID
   * @param userId 用户ID（用于权限检查）
   * @returns 移动结果
   */
  async moveTask(taskId: number, newProjectId: number, userId: number): Promise<Task | null> {
    const task = await this.findById(taskId);
    if (!task) return null;

    // 检查新项目是否存在
    const project = await Project.findByPk(newProjectId);
    if (!project) {
      throw new Error('目标项目不存在');
    }

    // 这里应该检查用户是否有权限访问新项目
    // 简化处理，假设用户有权限

    // 更新任务的项目ID
    return await task.update({ project: newProjectId });
  }

  /**
   * 添加子任务
   * @param taskId 父任务ID
   * @param title 子任务标题
   * @returns 更新后的任务
   */
  async addSubtask(taskId: number, title: string): Promise<Task | null> {
    const task = await this.findById(taskId);
    if (!task) return null;

    const newSubtasks = [...task.subtasks, {
      title,
      completed: false,
      createdAt: new Date()
    }];

    return await task.update({ subtasks: newSubtasks });
  }

  /**
   * 切换子任务状态
   * @param taskId 父任务ID
   * @param subtaskId 子任务ID
   * @returns 更新后的任务
   */
  async toggleSubtask(taskId: number, subtaskId: number): Promise<Task | null> {
    const task = await this.findById(taskId);
    if (!task) return null;

    const subtaskIndex = task.subtasks.findIndex((subtask: any) => subtask.id === subtaskId);
    if (subtaskIndex === -1) {
      throw new Error('子任务不存在');
    }

    const newSubtasks = [...task.subtasks];
    newSubtasks[subtaskIndex].completed = !newSubtasks[subtaskIndex].completed;

    return await task.update({ subtasks: newSubtasks });
  }

  /**
   * 添加评论
   * @param taskId 任务ID
   * @param content 评论内容
   * @param authorId 作者ID
   * @returns 更新后的任务
   */
  async addComment(taskId: number, content: string, authorId: number): Promise<Task | null> {
    const task = await this.findById(taskId);
    if (!task) return null;

    const newComments = [...task.comments, {
      content,
      author: authorId,
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    return await task.update({ comments: newComments });
  }

  /**
   * 添加观察者
   * @param taskId 任务ID
   * @param userId 用户ID
   * @returns 更新后的任务
   */
  async addWatcher(taskId: number, userId: number): Promise<Task | null> {
    const task = await this.findById(taskId);
    if (!task) return null;

    if (!task.watchers.includes(userId)) {
      const newWatchers = [...task.watchers, userId];
      return await task.update({ watchers: newWatchers });
    }

    return task;
  }

  /**
   * 移除观察者
   * @param taskId 任务ID
   * @param userId 用户ID
   * @returns 更新后的任务
   */
  async removeWatcher(taskId: number, userId: number): Promise<Task | null> {
    const task = await this.findById(taskId);
    if (!task) return null;

    const newWatchers = task.watchers.filter(watcher => watcher !== userId);
    return await task.update({ watchers: newWatchers });
  }

  /**
   * 批量更新任务
   * @param taskIds 任务ID数组
   * @param updates 更新数据
   * @returns 更新结果
   */
  async bulkUpdate(taskIds: number[], updates: Partial<TaskAttributes>): Promise<number> {
    const [affectedCount] = await Task.update(updates, {
      where: {
        id: taskIds
      }
    });

    return affectedCount;
  }

  /**
   * 根据ID数组查找任务
   * @param ids 任务ID数组
   * @returns 任务对象数组
   */
  async findByIds(ids: number[]): Promise<Task[]> {
    return await Task.findAll({
      where: {
        id: ids
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          through: {
            attributes: [] // 不包含中间表的属性
          },
          attributes: ['id', 'name', 'color'] // 只包含需要的标签字段
        },
        {
          model: Project,
          as: 'projectInfo',
          attributes: ['id', 'name', 'description', 'color', 'icon'] // 只包含需要的项目字段
        }
      ]
    });
  }

  /**
   * 重新排序任务
   * @param updates 排序更新数据
   * @returns 更新结果
   */
  async reorder(updates: Array<{ id: number; order: number; board?: number }>): Promise<number> {
    let affectedCount = 0;
    
    for (const update of updates) {
      const [count] = await Task.update(
        { order: update.order, board: update.board },
        { where: { id: update.id } }
      );
      affectedCount += count;
    }
    
    return affectedCount;
  }

  /**
   * 搜索任务
   * @param query 搜索关键词
   * @param options 分页选项
   * @returns 任务列表和总数
   */
  async search(
    query: string,
    options: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ rows: Task[]; count: number }> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    return await Task.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Tag,
          as: 'tags',
          through: {
            attributes: [] // 不包含中间表的属性
          },
          attributes: ['id', 'name', 'color'] // 只包含需要的标签字段
        },
        {
          model: Project,
          as: 'projectInfo',
          attributes: ['id', 'name', 'description', 'color', 'icon'] // 只包含需要的项目字段
        }
      ]
    });
  }
}