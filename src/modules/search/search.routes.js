import {Router} from 'express';
import { globalSearch } from './search.controller.js';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js';
const router = Router();

router.get('/search', dualAuthMiddleware, globalSearch);

export const searchRouter = router;