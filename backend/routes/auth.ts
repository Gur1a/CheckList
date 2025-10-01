import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import initializeModels from '../models/index';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { log } from '../middleware/logger';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();
const authController = new AuthController();

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 验证token
router.get('/verify', authController.verifyToken);

// 登出接口
router.post('/logout', authController.logout);

export default router;