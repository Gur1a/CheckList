import apiClient from '../utils/apiClient';
import { API_ENDPOINTS, buildURLWithParams } from '../utils/apiEndpoints';
import { Project, ProjectMember, ApiResponse, PaginationParams, PaginatedResponse } from '../../../shared/types';

// 项目创建数据类型
export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  isPrivate?: boolean;
}

// 项目更新数据类型
export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  isPrivate?: boolean;
}

// 项目成员添加数据类型
export interface AddProjectMemberData {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
}

// 项目查询过滤器
export interface ProjectFilters {
  userId?: string;
  search?: string;
  isPrivate?: boolean;
  memberId?: string;
}

// 项目排序选项
export interface ProjectSortOptions {
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export class ProjectService {
  /**
   * 创建新项目
   */
  static async create(projectData: CreateProjectData): Promise<ApiResponse<Project[]>> {
    try {
      const response = await apiClient.post<Project[]>(
        API_ENDPOINTS.PROJECTS.CREATE,
        projectData
      );
      return response;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  }

  /**
   * 获取项目列表
   */
  static async getList(
    filters?: ProjectFilters,
    pagination?: PaginationParams,
    sorting?: ProjectSortOptions
  ): Promise<ApiResponse<PaginatedResponse<Project>>> {
    try {
      const params = {
        ...filters,
        ...pagination,
        ...sorting
      };

      const response = await apiClient.get<PaginatedResponse<Project>>(
          API_ENDPOINTS.PROJECTS.LIST
      );
      return response;
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取项目详情
   */
  static async getById(projectId: string): Promise<ApiResponse<Project>> {
    try {
      const response = await apiClient.get<Project>(
        API_ENDPOINTS.PROJECTS.GET_BY_ID(projectId)
      );
      return response;
    } catch (error) {
      console.error('获取项目详情失败:', error);
      throw error;
    }
  }


  /**
   *  根据用户ID获取所有项目
   */
  static async getByUserId(userId: string, filters?: ProjectFilters): Promise<ApiResponse<PaginatedResponse<Project>>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Project>>(
        buildURLWithParams(API_ENDPOINTS.PROJECTS.GET_BY_USER_ID(userId), filters)
      )
      return response;
    } catch (error) {
      console.error('根据用户ID获取项目失败:', error);
      throw error;
    }
  }


  /**
   * 更新项目
   */
  static async update(
    projectId: string,
    updateData: UpdateProjectData
  ): Promise<ApiResponse<Project>> {
    try {
      const response = await apiClient.put<Project>(
        API_ENDPOINTS.PROJECTS.UPDATE(projectId),
        updateData
      );
      return response;
    } catch (error) {
      console.error('更新项目失败:', error);
      throw error;
    }
  }

  /**
   * 删除项目
   */
  static async delete(projectId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.PROJECTS.DELETE(projectId)
      );
      return response;
    } catch (error) {
      console.error('删除项目失败:', error);
      throw error;
    }
  }

  /**
   * 获取项目成员列表
   */
  static async getMembers(projectId: string): Promise<ApiResponse<ProjectMember[]>> {
    try {
      const response = await apiClient.get<ProjectMember[]>(
        API_ENDPOINTS.PROJECTS.MEMBERS(projectId)
      );
      return response;
    } catch (error) {
      console.error('获取项目成员列表失败:', error);
      throw error;
    }
  }

  /**
   * 添加项目成员
   */
  static async addMember(
    projectId: string,
    memberData: AddProjectMemberData
  ): Promise<ApiResponse<ProjectMember>> {
    try {
      const response = await apiClient.post<ProjectMember>(
        API_ENDPOINTS.PROJECTS.ADD_MEMBER(projectId),
        memberData
      );
      return response;
    } catch (error) {
      console.error('添加项目成员失败:', error);
      throw error;
    }
  }

  /**
   * 移除项目成员
   */
  static async removeMember(
    projectId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        API_ENDPOINTS.PROJECTS.REMOVE_MEMBER(projectId, userId)
      );
      return response;
    } catch (error) {
      console.error('移除项目成员失败:', error);
      throw error;
    }
  }

  /**
   * 更新项目成员角色
   */
  static async updateMemberRole(
    projectId: string,
    userId: string,
    role: 'admin' | 'member' | 'viewer'
  ): Promise<ApiResponse<ProjectMember>> {
    try {
      const response = await apiClient.patch<ProjectMember>(
        API_ENDPOINTS.PROJECTS.UPDATE_MEMBER_ROLE(projectId, userId),
        { role }
      );
      return response;
    } catch (error) {
      console.error('更新项目成员角色失败:', error);
      throw error;
    }
  }

  /**
   * 搜索项目
   */
  static async search(
    query: string,
    pagination?: PaginationParams,
    sorting?: ProjectSortOptions
  ): Promise<ApiResponse<PaginatedResponse<Project[]>>> {
    try {
      const params = {
        query,
        ...pagination,
        ...sorting
      };

      const response = await apiClient.get<PaginatedResponse<Project[]>>(
        buildURLWithParams(API_ENDPOINTS.PROJECTS.SEARCH, params)
      );
      return response;
    } catch (error) {
      console.error('搜索项目失败:', error);
      throw error;
    }
  }
}


export default ProjectService;