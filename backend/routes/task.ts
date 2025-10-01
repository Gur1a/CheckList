import express from 'express';
import { TaskController } from "../controllers/TaskController";
import authMiddleware from '../middleware/auth';

const router = express.Router();

// 应用认证中间件
router.use(authMiddleware);
const taskController = new TaskController();

// 任务相关路由
router.get('', taskController.getTasks);
router.post('', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.get('/user/:userId', taskController.getTasksByUserId);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// 批量操作路由
router.put('/bulk/status', taskController.bulkUpdateTasks);
router.delete('/bulk', taskController.bulkDeleteTasks);

// 任务移动路由
router.put('/:id/move', taskController.moveTask);

// 子任务相关路由
router.post('/:id/subtasks', taskController.addSubtask);

router.put('/:id/subtasks/:subtaskId/toggle', taskController.toggleSubtask);


// 评论相关路由
router.post('/:id/comments', taskController.addComment);

// 观察者相关路由
router.post('/:id/watchers', taskController.addWatcher);
router.delete('/:id/watchers/:userId', taskController.removeWatcher);

export default router;