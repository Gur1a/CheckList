import express from 'express';
import { ProjectController } from '../controllers/ProjectController';
import boardRoutes from './boards';
import authMiddleware from '../middleware/auth';

const router = express.Router();
const projectController = new ProjectController();

// 应用认证中间件
router.use(authMiddleware);

// 更具体的路由应该在通用路由之前

// 项目基础路由
router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/user/:userId', projectController.getUserProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// 项目搜索路由
router.get('/search', projectController.search);



// 项目归档路由
router.put('/:id/archive', projectController.archiveProject);
router.put('/:id/unarchive', projectController.unarchiveProject);

// 项目成员管理路由
router.post('/:id/members', projectController.addProjectMember);
router.delete('/:id/members/:memberId', projectController.removeProjectMember);

// 看板路由已改为独立路由，不再嵌套挂载

export default router;