import initializeModels from '../models/index';

export class HistoryRepository {
  // 创建历史记录
  async create(historyData: any) {
    const { History } = await initializeModels();
    
    return await (History as any).create(historyData);
  }

  // 记录历史
  async recordHistory(options: {
    entityType: string;
    entityId: number;
    entityModel: string;
    action: string;
    changes?: Record<string, any>;
    performedBy: number;
    project?: number;
    description?: string;
    metadata?: any;
  }) {
    const { History } = await initializeModels();
    
    const {
      entityType,
      entityId,
      entityModel,
      action,
      changes = {},
      performedBy,
      project,
      description,
      metadata = {}
    } = options;

    return await (History as any).create({
      entityType,
      entityId,
      entityModel,
      action,
      changes,
      performedBy,
      project,
      description,
      metadata: {
        source: 'web',
        ...metadata
      }
    });
  }
}