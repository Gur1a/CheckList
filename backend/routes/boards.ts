import express from 'express';
import { BoardController } from '../controllers/BoardController';
import authMiddleware from '../middleware/auth';
import { decryptIdMiddleware } from '../utils/cryptoUtils';

const router = express.Router();
const boardController = new BoardController();

// 应用认证中间件
router.use(authMiddleware);

// 应用ID解密中间件
router.use(decryptIdMiddleware());

// 更具体的路由应该在通用路由之前
// 重排序看板路由
router.post('/reorder', boardController.reorderBoards);

// 看板自身的基础路由
// 创建新看板 - POST /api/boards (通过请求参数encryptedProjectId获取项目ID)
router.post('/', boardController.createBoard);

// 获取指定项目的看板列表 - GET /api/boards (通过请求参数encryptedProjectId获取项目ID)
router.get('/', boardController.getBoardsByProject);

// 获取特定看板详情 - GET /api/boards/:id
router.get('/:id', boardController.getBoardById);

// 更新看板 - PUT /api/boards/:id
router.put('/:id', boardController.updateBoard);

// 删除看板 - DELETE /api/boards/:id
router.delete('/:id', boardController.deleteBoard);

export default router;