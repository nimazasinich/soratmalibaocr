import { Request, Response, NextFunction } from 'express';
import DatabaseManager from '../utils/database';
import { asyncHandler } from '../middlewares/errorHandler';

export const getHealth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const isHealthy = await DatabaseManager.healthCheck();

    res.status(isHealthy ? 200 : 503).json({
      success: true,
      message: isHealthy ? 'System is healthy' : 'System is unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isHealthy ? 'connected' : 'disconnected',
    });
  }
);

export const getStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await DatabaseManager.getStats();

    res.json({
      success: true,
      data: stats,
    });
  }
);
