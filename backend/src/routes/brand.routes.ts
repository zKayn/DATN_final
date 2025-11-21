// backend/src/routes/brand.routes.ts

import { Router } from 'express';
import prisma from '../config/database';
import { ResponseUtil } from '../utils/response';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return ResponseUtil.success(res, brands, 'Brands retrieved');
  } catch (error: any) {
    return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
  }
});

export default router;