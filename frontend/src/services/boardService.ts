import { API_ENDPOINTS, buildURLWithParams } from '../utils/apiEndpoints';
import { Board, ApiResponse } from '../../../shared/types';
import { ApiClient } from '../utils/apiClient';
import { encryptProjectId } from '../utils/cryptoUtils';

// 看板创建数据类型
export interface CreateBoardData {
  name: string;
  project: string;
  color?: string;
  order?: number;
}

// 看板更新数据类型
export interface UpdateBoardData {
  name?: string;
  color?: string;
  order?: number;
}

// 看板重排序数据类型
export interface ReorderBoardsData {
  boardUpdates: Array<{
    id: string;
    order: number;
  }>;
}

export class BoardService {
  /**
   * 创建新看板
   */
  static async create(boardData: CreateBoardData): Promise<ApiResponse<Board>> {
    try {
      // 必须先加密projectId，然后再传递给API端点
      const encryptedProjectId = encryptProjectId(boardData.project);
      const response = await ApiClient.post<Board>(
        API_ENDPOINTS.BOARDS.CREATE(encryptedProjectId),
        boardData
      );
      return response;
    } catch (error) {
      console.error('创建看板失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取看板详情
   */
  static async getById(boardId: string, encryptedProjectId?: string): Promise<ApiResponse<Board>> {
    try {
      // projectId 在这里应该是已经加密过的
      if (encryptedProjectId) {
        // 如果提供了项目ID，通过查询参数传递
        const response = await ApiClient.get<Board>(
          `${API_ENDPOINTS.BOARDS.GET_BY_ID(boardId)}?encryptedProjectId=${encryptedProjectId}`
        );
        return response;
      } else {
        // 否则直接请求看板ID
        const response = await ApiClient.get<Board>(
          API_ENDPOINTS.BOARDS.GET_BY_ID(boardId)
        );
        return response;
      }
    } catch (error) {
      console.error('获取看板详情失败:', error);
      throw error;
    }
  }

  /**
   * 根据项目ID获取看板列表
   */
  static async getByProject(projectId: string): Promise<ApiResponse<Board[]>> {
    try {
      // projectId 在这里应该是已经加密过的
      const response = await ApiClient.get<Board[]>(
        API_ENDPOINTS.BOARDS.LIST_BY_PROJECT(projectId)
      );
      return response;
    } catch (error) {
      console.error('获取项目看板列表失败:', error);
      throw error;
    }
  }

  /**
   * 更新看板
   */
  static async update(
    boardId: string,
    updateData: UpdateBoardData,
    encryptedProjectId?: string
  ): Promise<ApiResponse<Board>> {
    try {
      // projectId 在这里应该是已经加密过的
      if (encryptedProjectId) {
        // 如果提供了项目ID，通过查询参数传递
        const response = await ApiClient.put<Board>(
          `${API_ENDPOINTS.BOARDS.UPDATE(boardId)}?encryptedProjectId=${encryptedProjectId}`,
          updateData
        );
        return response;
      } else {
        // 否则直接请求看板ID
        const response = await ApiClient.put<Board>(
          API_ENDPOINTS.BOARDS.UPDATE(boardId),
          updateData
        );
        return response;
      }
    } catch (error) {
      console.error('更新看板失败:', error);
      throw error;
    }
  }

  /**
   * 删除看板
   */
  static async delete(boardId: string, encryptedProjectId?: string): Promise<ApiResponse<void>> {
    try {
      // projectId 在这里应该是已经加密过的
      if (encryptedProjectId) {
        // 如果提供了项目ID，通过查询参数传递
        const response = await ApiClient.delete<void>(
          `${API_ENDPOINTS.BOARDS.DELETE(boardId)}?encryptedProjectId=${encryptedProjectId}`
        );
        return response;
      } else {
        // 否则直接请求看板ID
        const response = await ApiClient.delete<void>(
          API_ENDPOINTS.BOARDS.DELETE(boardId)
        );
        return response;
      }
    } catch (error) {
      console.error('删除看板失败:', error);
      throw error;
    }
  }

  /**
   * 重排序看板
   */
  static async reorder(
    encryptedProjectId: string,
    reorderData: ReorderBoardsData
  ): Promise<ApiResponse<void>> {
    try {
      // projectId 在这里应该是已经加密过的
      const response = await ApiClient.post<void>(
        API_ENDPOINTS.BOARDS.REORDER(encryptedProjectId),
        reorderData
      );
      return response;
    } catch (error) {
      console.error('重排序看板失败:', error);
      throw error;
    }
  }
}

export default BoardService;