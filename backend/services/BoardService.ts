import { Board } from '../models/Board';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { Task } from '../models/Task';
import BoardRepository from '../repositories/BoardRepository';
import initializeModels from '../models';

// 初始化模型
const initModels = async () => {
  await initializeModels();
};

// 看板创建数据接口
export interface CreateBoardData {
  name: string;
  projectId: number;
  description?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  limits?: {
    wipLimit: number;
    maxTasks: number;
  };
  settings?: {
    autoArchive: boolean;
    allowTaskCreation: boolean;
    showTaskCount: boolean;
  };
}

// 看板更新数据接口
export interface UpdateBoardData {
  name?: string;
  description?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  limits?: {
    wipLimit: number;
    maxTasks: number;
  };
  settings?: {
    autoArchive: boolean;
    allowTaskCreation: boolean;
    showTaskCount: boolean;
  };
}

// 看板重排序数据接口
export interface ReorderBoardsData {
  boardUpdates: Array<{ id: number; order: number }>;
}

/**
 * 看板服务类，处理看板相关的业务逻辑
 */
export class BoardService {
  private boardRepository: BoardRepository;

  constructor() {
    this.boardRepository = new BoardRepository();
  }
  
  /**
   * 创建新看板
   */
  async create(boardData: CreateBoardData, userId: number): Promise<Board> {
    await initModels();
    
    // 验证项目是否存在
    const project = await Project.findByPk(boardData.projectId);
    if (!project) {
      throw new Error('项目不存在');
    }
    
    // 验证用户是否有权限创建看板
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 计算新看板的默认顺序
    const lastBoard = await this.boardRepository.findLastBoardInProject(boardData.projectId);
    const defaultOrder = lastBoard ? lastBoard.order + 1 : 1;
    
    // 如果设置了isDefault为true，需要将其他默认看板设置为非默认
    if (boardData.isDefault) {
      await this.boardRepository.setAllNonDefault(boardData.projectId);
    }
    
    // 创建看板
    const board = await this.boardRepository.create({
      name: boardData.name,
      description: boardData.description,
      project: boardData.projectId,
      order: boardData.order ?? defaultOrder,
      color: boardData.color || '#6c757d',
      isDefault: boardData.isDefault || false,
      limits: boardData.limits || {
        wipLimit: 0, // 0表示无限制
        maxTasks: 0
      },
      settings: boardData.settings || {
        autoArchive: false,
        allowTaskCreation: true,
        showTaskCount: true
      },
      createdBy: userId
    });
    
    return board;
  }
  
  /**
   * 获取用户所有看板列表
   */
  async getList(userId: number): Promise<Board[]> {
    await initModels();
    
    // 获取用户参与的所有项目的ID
    const userProjects = await Project.findAll({
      where: {
        createdBy: userId
      },
      attributes: ['id']
    });
    
    const projectIds = userProjects.map(project => project.id);
    
    // 获取这些项目下的所有看板
    const boards = await this.boardRepository.findAll({
      project: projectIds
    }, {
      order: [['project', 'ASC'], ['order', 'ASC']],
      include: [
        {
          model: Project,
          as: 'projectInfo',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    return boards;
  }
  
  /**
   * 根据ID获取看板详情
   */
  async getById(boardId: number, userId: number): Promise<Board> {
    await initModels();
    
    const board = await this.boardRepository.findById(boardId);
    
    if (!board) {
      throw new Error('看板不存在');
    }
    
    // 获取项目信息以验证权限
    const project = await Project.findByPk(board.project);
    if (!project) {
      throw new Error('看板所属项目不存在');
    }
    
    // 验证用户是否有权限访问该看板
    if (project.createdBy !== userId) {
      throw new Error('无权限访问该看板');
    }
    
    // 重新加载看板以获取关联数据
    const detailedBoard = await this.boardRepository.findAll({
      id: boardId
    }, {
      include: [
        {
          model: Project,
          as: 'projectInfo',
          attributes: ['id', 'name', 'createdBy']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    return detailedBoard[0];
  }
  
  /**
   * 根据项目ID获取看板列表
   */
  async getByProject(projectId: number, userId: number): Promise<Board[]> {
    await initModels();
    
    // 验证项目是否存在且用户有权限访问
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      throw new Error('项目不存在');
    }
    
    if (project.createdBy !== userId) {
      throw new Error('无权限访问该项目的看板');
    }
    
    // 获取该项目下的所有看板
    const boards = await this.boardRepository.findAll({
      project: projectId
    }, {
      order: [['order', 'ASC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ]
    });
    
    return boards;
  }
  
  /**
   * 更新看板信息
   */
  async update(boardId: number, updateData: UpdateBoardData, userId: number): Promise<Board> {
    await initModels();
    
    // 先验证看板存在且用户有权限
    const board = await this.getById(boardId, userId);
    
    // 如果设置了isDefault为true，需要将其他默认看板设置为非默认
    if (updateData.isDefault === true) {
      await this.boardRepository.setAllNonDefault(board.project, boardId);
    }
    
    // 更新看板信息
    const updatedBoard = await this.boardRepository.update(boardId, updateData);
    
    if (!updatedBoard) {
      throw new Error('更新看板失败');
    }
    
    // 重新加载看板以获取最新数据
    return updatedBoard;
  }
  
  /**
   * 删除看板
   */
  async delete(boardId: number, userId: number): Promise<void> {
    await initModels();
    
    // 先验证看板存在且用户有权限
    const board = await this.getById(boardId, userId);
    
    // 检查看板是否包含任务
    const taskCount = await Task.count({
      where: { board: boardId }
    });
    if (taskCount > 0) {
      throw new Error('看板包含任务，无法删除');
    }
    
    // 删除看板
    const deleted = await this.boardRepository.delete(boardId);
    
    if (!deleted) {
      throw new Error('删除看板失败');
    }
  }
  
  /**
   * 重排序看板
   */
  async reorder(projectId: number, reorderData: ReorderBoardsData, userId: number): Promise<void> {
    await initModels();
    
    // 验证项目是否存在且用户有权限访问
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      throw new Error('项目不存在');
    }
    
    if (project.createdBy !== userId) {
      throw new Error('无权限重新排序看板');
    }
    
    // 批量更新看板顺序
    const affectedCount = await this.boardRepository.bulkUpdateOrder(projectId, reorderData.boardUpdates);
    
    if (affectedCount !== reorderData.boardUpdates.length) {
      throw new Error('部分看板重排序失败');
    }
  }
}

export default BoardService;