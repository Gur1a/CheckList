import express from 'express';
import { TagController } from '../controllers/TagController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// 应用认证中间件
router.use(authMiddleware);
const tagController = new TagController();

// 标签相关路由
router.get('', tagController.getTags); // 获取当前用户的所有标签
router.post('', tagController.createTag); // 创建新标签
router.get('/:id', tagController.getTagById); // 获取特定标签
router.put('/:id', tagController.updateTag); // 更新标签
router.delete('/:id', tagController.deleteTag); // 删除标签

// 标签与任务关联路由
router.get('/:tagId/tasks', tagController.getTasksByTag); // 获取带有特定标签的任务
router.post('/:tagId/tasks/:taskId', tagController.addTagToTask); // 为任务添加标签
router.delete('/:tagId/tasks/:taskId', tagController.removeTagFromTask); // 从任务中移除标签
router.get('/tasks/:taskId', tagController.getTagsForTask); // 获取任务的所有标签


export default router;