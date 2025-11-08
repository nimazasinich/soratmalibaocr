import { Router } from 'express';

const router = Router();

// TODO: Implement auth routes in Phase 10
router.post('/login', (req, res) => {
  res.json({ message: 'Auth routes - coming in Phase 10' });
});

export default router;
