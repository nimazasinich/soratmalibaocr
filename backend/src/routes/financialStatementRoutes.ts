import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Financial statement routes - in development' });
});

export default router;
