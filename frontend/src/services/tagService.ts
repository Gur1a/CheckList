import apiClient from '../utils/apiClient';
import { API_ENDPOINTS, buildURLWithParams } from '../utils/apiEndpoints';
import { ApiResponse, PaginationParams, Tag } from '../../../shared/types';

// 标签创建数据类型
export interface CreateTagData {
  name: string;
  color?: string;
  userId?: string;
}

// 标签更新数据类型
export interface UpdateTagData {
  name?: string;
  color?: string;
}

// 标签查询过滤器
export interface TagFilters {
  search?: string;
  userId?: string;
}

export class TagService {
  /**
   * 获取标签列表
   */
  static async getTags(filters?: TagFilters): Promise<ApiResponse<Tag[]>> {
    try {
      const url = buildURLWithParams(API_ENDPOINTS.TAGS.LIST, filters);
      const response = await apiClient.get<Tag[]>(url);
      return response;
    } catch (error) {
      console.error('获取标签列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建新标签
   */
  static async create(tagData: CreateTagData): Promise<ApiResponse<Tag>> {
    try {
      const response = await apiClient.post<Tag>(
        API_ENDPOINTS.TAGS.CREATE,
        tagData
      );
      return response;
    } catch (error) {
      console.error('创建标签失败:', error);
      throw error;
    }
  }

  /**
   * 更新标签
   */
  static async update(tagId: string, tagData: UpdateTagData): Promise<ApiResponse<Tag>> {
    try {
      const response = await apiClient.put<Tag>(
        API_ENDPOINTS.TAGS.UPDATE(tagId),
        tagData
      );
      return response;
    } catch (error) {
      console.error('更新标签失败:', error);
      throw error;
    }
  }

  /**
   * 删除标签
   */
  static async delete(tagId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.TAGS.DELETE(tagId)
      );
      return response;
    } catch (error) {
      console.error('删除标签失败:', error);
      throw error;
    }
  }

  /**
   * 为任务添加标签
   */
  static async addTagToTask(taskId: string, tagId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(
        API_ENDPOINTS.TAGS.ADD_TAG_TO_TASK(tagId, taskId),
        {}
      );
      return response;
    } catch (error) {
      console.error('为任务添加标签失败:', error);
      throw error;
    }
  }

  /**
   * 从任务移除标签
   */
  static async removeTagFromTask(taskId: string, tagId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.TAGS.REMOVE_TAG_FROM_TASK(tagId, taskId)
      );
      return response;
    } catch (error) {
      console.error('从任务移除标签失败:', error);
      throw error;
    }
  }

  /**
  * 获取任务的所有标签
  */
  static async getTagsForTask(taskId: string): Promise<ApiResponse<Tag[]>> {
    try {
      const response = await apiClient.get<Tag[]>(
        API_ENDPOINTS.TAGS.GET_TAGS_FOR_TASK(taskId)
      );
      return response;
    } catch (error) {
      console.error('获取任务标签失败:', error);
      throw error;
    }
  }

  /**
   * 获取特定标签详情
   */
  static async getTagById(tagId: string): Promise<ApiResponse<Tag>> {
    try {
      const response = await apiClient.get<Tag>(
        API_ENDPOINTS.TAGS.GET_BY_ID(tagId)
      );
      return response;
    } catch (error) {
      console.error('获取标签详情失败:', error);
      throw error;
    }
  }
}

export default TagService;