import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { BoardService } from '../services/BoardService';

/**
 * 看板控制器，处理看板相关的HTTP请求
 */
export class BoardController {
    private boardService: BoardService;

    constructor() {
        this.boardService = new BoardService();
    }

    /**
     * 创建新看板
     * POST /boards
     */
    createBoard = catchAsync(async (req: Request, res: Response) => {
        // 从request中获取用户ID（已通过auth中间件验证并设置）
        const userId = req.user?.id;

        if (!userId) {
        throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
        }

        // 从中间件设置的req.projectId获取项目ID
        const projectId = (req as any).projectId;
        let boardData = req.body;
        
        // 验证项目ID
        if (!projectId) {
        throw new AppError('项目ID为必填项', 400, 'BAD_REQUEST');
        }
        
        // 验证请求体中的看板数据
        if (!boardData.name) {
        throw new AppError('看板名称为必填项', 400, 'BAD_REQUEST');
        }
        
        // 将解密后的projectId添加到boardData中
        boardData = {
            ...boardData,
            projectId: projectId
        };
        
        const result = await this.boardService.create(boardData, userId);
        
        res.status(201).json({
        success: true,
        message: '创建看板成功',
        data: result
        });
    });

    /**
     * 获取用户的所有看板
     * 注意：此方法在嵌套路由中不直接暴露，只通过getBoardsByProject暴露特定项目的看板
     * GET /boards
     */
    getBoards = catchAsync(async (req: Request, res: Response) => {
        // 从request中获取用户ID（已通过auth中间件验证并设置）
        const userId = req.user?.id;

        if (!userId) {
        throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
        }

        const result = await this.boardService.getList(userId);
        
        res.json({
        success: true,
        message: '获取看板列表成功',
        data: result
        });
    });

    /**
     * 根据ID获取看板详情
     * GET /boards/:id
     */
    getBoardById = catchAsync(async (req: Request, res: Response) => {
        // 从request中获取用户ID（已通过auth中间件验证并设置）
        const userId = req.user?.id;

        if (!userId) {
        throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
        }

        const { id } = req.params;
        
        // 验证boardId是有效数字
        const parsedBoardId = parseInt(id);
        if (isNaN(parsedBoardId)) {
        throw new AppError('无效的看板ID', 400, 'INVALID_BOARD_ID');
        }
        
        const result = await this.boardService.getById(parsedBoardId, userId);
        
        res.json({
        success: true,
        message: '获取看板详情成功',
        data: result
        });
    });

    /**
     * 根据项目ID获取看板列表
     * GET /projects/:projectId/boards
     */
    getBoardsByProject = catchAsync(async (req: Request, res: Response) => {
        // 从request中获取用户ID（已通过auth中间件验证并设置）
        const userId = req.user?.id;

        if (!userId) {
        throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
        }

        // 从中间件设置的req.projectId获取项目ID
        const projectId = (req as any).projectId;
        console.log('projectId:', projectId);
        // 验证projectId存在且是有效数字
        if (!projectId || isNaN(Number(projectId))) {
            throw new AppError('无效的项目ID', 400, 'INVALID_PROJECT_ID');
        }
        
        const parsedProjectId = Number(projectId);
        
        const result = await this.boardService.getByProject(parsedProjectId, userId);
        
        res.json({
        success: true,
        message: '获取项目看板列表成功',
        data: result
        });
    });

    /**
     * 更新看板
     * PUT /boards/:id
     */
    updateBoard = catchAsync(async (req: Request, res: Response) => {
        // 从request中获取用户ID（已通过auth中间件验证并设置）
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
        }

        const { id } = req.params;
        let updateData = req.body;
        
        // 从中间件设置的req.projectId获取项目ID
        const projectId = (req as any).projectId;
        
        // 验证boardId是有效数字
        const parsedBoardId = parseInt(id);
        if (isNaN(parsedBoardId)) {
            throw new AppError('无效的看板ID', 400, 'INVALID_BOARD_ID');
        }
        
        // 验证项目ID
        if (!projectId) {
            throw new AppError('项目ID为必填项', 400, 'BAD_REQUEST');
        }
        
        // 将解密后的projectId添加到updateData中
        if (!updateData) {
            updateData = {};
        }
        updateData.projectId = projectId;
        
        const result = await this.boardService.update(parsedBoardId, updateData, userId);
        
        res.json({
            success: true,
            message: '更新看板成功',
            data: result
        });
    });

    /**
     * 删除看板
     * DELETE /boards/:id
     */
    deleteBoard = catchAsync(async (req: Request, res: Response) => {
        // 从request中获取用户ID（已通过auth中间件验证并设置）
        const userId = req.user?.id;

        if (!userId) {
        throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
        }

        const { id } = req.params;
        
        // 从中间件设置的req.projectId获取项目ID
        const projectId = (req as any).projectId;
        
        // 验证boardId是有效数字
        const parsedBoardId = parseInt(id);
        if (isNaN(parsedBoardId)) {
        throw new AppError('无效的看板ID', 400, 'INVALID_BOARD_ID');
        }
        
        // 验证项目ID
        if (!projectId) {
        throw new AppError('项目ID为必填项', 400, 'BAD_REQUEST');
        }
        
        await this.boardService.delete(parsedBoardId, userId);
        
        res.json({
        success: true,
        message: '删除看板成功',
        data: null
        });
    });

    /**
     * 重排序看板
     * POST /boards/reorder
     */
    reorderBoards = catchAsync(async (req: Request, res: Response) => {
        // 从request中获取用户ID（已通过auth中间件验证并设置）
        const userId = req.user?.id;

        if (!userId) {
        throw new AppError('用户未认证', 401, 'UNAUTHORIZED');
        }

        // 从中间件设置的req.projectId获取项目ID
        const projectId = (req as any).projectId;
        const reqBody = req.body;
        const boardUpdates = reqBody.boardUpdates;
        
        // 验证项目ID
        if (!projectId) {
        throw new AppError('项目ID为必填项', 400, 'BAD_REQUEST');
        }
        
        if (!boardUpdates || !Array.isArray(boardUpdates)) {
        throw new AppError('无效的重排序数据', 400, 'BAD_REQUEST');
        }
        
        const reorderData = {
        boardUpdates: boardUpdates.map((update: any) => ({
            id: parseInt(update.id),
            order: update.order
        }))
        };
        
        await this.boardService.reorder(projectId, reorderData, userId);
        
        res.json({
        success: true,
        message: '重排序看板成功',
        data: null
        });
    });
    }

export default BoardController;