import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import DatabaseManager from './utils/database';
import logger from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { swaggerSpec } from './config/swagger';

// Import routes
import companyRoutes from './routes/companyRoutes';
import financialStatementRoutes from './routes/financialStatementRoutes';
import analysisRoutes from './routes/analysisRoutes';
import ocrRoutes from './routes/ocrRoutes';
import authRoutes from './routes/authRoutes';
import healthRoutes from './routes/healthRoutes';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 8000;

// ========================================
// Middleware
// ========================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Static files (for uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================================
// Routes
// ========================================

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'CloudCoder API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/statements', financialStatementRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ocr', ocrRoutes);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🧠 CloudCoder Financial Fraud Detection API',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ========================================
// Server Startup
// ========================================

async function startServer() {
  try {
    // Initialize database
    logger.info('Initializing database...');
    await DatabaseManager.initialize();
    logger.info('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🧠 CloudCoder Financial Fraud Detection API     ║
║                                                    ║
║   Server running on: http://localhost:${PORT}     ║
║   Environment: ${process.env.NODE_ENV || 'development'}                         ║
║   API Docs: http://localhost:${PORT}/api/docs     ║
║                                                    ║
╚════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await DatabaseManager.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await DatabaseManager.close();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
