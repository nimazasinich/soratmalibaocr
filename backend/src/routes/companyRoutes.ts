import { Router } from 'express';

const router = Router();

// TODO: Implement company routes
router.get('/', (_req, res) => {
  res.json({ message: 'Company routes - in development' });
});

export default router;
