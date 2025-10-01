import { Board, BoardAttributes, BoardCreationAttributes } from '../models/Board';
import { Op } from 'sequelize';

/**
 * 看板存储库，处理看板相关的数据库操作
 */
export class BoardRepository {
  /**
   * 创建看板
   * @param boardData 看板数据
   * @returns 创建的看板
   */
  async create(boardData: BoardCreationAttributes): Promise<Board> {
    return await Board.create(boardData);
  }

  /**
   * 根据ID查找看板
   * @param id 看板ID
   * @returns 看板对象或null
   */
  async findById(id: number): Promise<Board | null> {
    // 检查ID是否有效
    if (isNaN(id) || !Number.isInteger(id)) {
      return null;
    }
    return await Board.findByPk(id);
  }

  /**
   * 根据条件查找看板列表
   * @param filters 过滤条件
   * @param options 查询选项
   * @returns 看板列表
   */
  async findAll(
    filters: any = {},
    options: { order?: [string, string][]; include?: any[] } = {}
  ): Promise<Board[]> {
    const where: any = {};

    // 处理ID过滤
    if (filters.id !== undefined && !isNaN(filters.id) && Number.isInteger(filters.id)) {
      where.id = filters.id;
    }

    // 处理项目过滤
    if (filters.project) {
      where.project = filters.project;
    }

    // 处理默认看板过滤
    if (filters.isDefault !== undefined) {
      where.isDefault = filters.isDefault;
    }

    // 处理创建人过滤
    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    // 处理搜索关键词
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    return await Board.findAll({
      where,
      order: options.order || [['order', 'ASC'], ['createdAt', 'DESC']],
      include: options.include || []
    });
  }

  /**
   * 根据项目ID查找看板
   * @param projectId 项目ID
   * @returns 看板列表
   */
  async findByProject(projectId: number): Promise<Board[]> {
    return await this.findAll({
      project: projectId
    });
  }

  /**
   * 查找项目中的最后一个看板
   * @param projectId 项目ID
   * @returns 最后一个看板或null
   */
  async findLastBoardInProject(projectId: number): Promise<Board | null> {
    const boards = await this.findAll({
      project: projectId
    }, {
      order: [['order', 'DESC']],
      include: []
    });
    
    return boards.length > 0 ? boards[0] : null;
  }

  /**
   * 更新看板
   * @param id 看板ID
   * @param updateData 更新数据
   * @returns 更新后的看板
   */
  async update(id: number, updateData: Partial<BoardAttributes>): Promise<Board | null> {
    const board = await this.findById(id);
    if (!board) return null;

    return await board.update(updateData);
  }

  /**
   * 删除看板
   * @param id 看板ID
   * @returns 删除结果
   */
  async delete(id: number): Promise<boolean> {
    const board = await this.findById(id);
    if (!board) return false;

    await board.destroy();
    return true;
  }

  /**
   * 批量更新看板顺序
   * @param projectId 项目ID
   * @param boardUpdates 看板更新信息数组
   * @returns 更新结果
   */
  async bulkUpdateOrder(projectId: number, boardUpdates: Array<{ id: number; order: number }>): Promise<number> {
    let affectedCount = 0;
    
    // 批量更新看板顺序
    for (const update of boardUpdates) {
      const [count] = await Board.update(
        { order: update.order },
        { where: { id: update.id, project: projectId } }
      );
      affectedCount += count;
    }
    
    return affectedCount;
  }

  /**
   * 设置项目中所有默认看板为非默认
   * @param projectId 项目ID
   * @param excludeBoardId 排除的看板ID（可选）
   * @returns 更新结果
   */
  async setAllNonDefault(projectId: number, excludeBoardId?: number): Promise<number> {
    const where: any = { 
      project: projectId, 
      isDefault: true 
    };
    
    if (excludeBoardId) {
      where.id = { [Op.ne]: excludeBoardId };
    }
    
    const [affectedCount] = await Board.update(
      { isDefault: false },
      { where }
    );
    
    return affectedCount;
  }
}

export default BoardRepository;