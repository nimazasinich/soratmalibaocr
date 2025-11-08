import { Router } from 'express';
import { getHealth, getStats } from '../controllers/healthController';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', getHealth);

/**
 * @route   GET /api/health/stats
 * @desc    Get database statistics
 * @access  Public
 */
router.get('/stats', getStats);

export default router;
