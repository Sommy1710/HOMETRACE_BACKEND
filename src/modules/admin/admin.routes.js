import {Router} from 'express';
import {createAdminAccount, authenticateAdmin, getAuthenticatedAdmin} from './admin.controller.js';
import adminMiddleware from '../../app/middleware/admin.middleware.js';
import { adminLimiter } from './adminLimiter.js';
const router = Router();

router.post('/register', createAdminAccount);
router.post('/login', adminLimiter, authenticateAdmin);
router.get('/user', adminMiddleware, getAuthenticatedAdmin);

export const adminRouter = router;
