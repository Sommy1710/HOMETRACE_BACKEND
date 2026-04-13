import {Router} from 'express';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js';
import { getMessages, sendMessage } from './message.controller.js';
import {uploadListingMedia} from '../../lib/upload.js';
const router = Router();


router.get('/:userId', dualAuthMiddleware, getMessages);
router.post('/', dualAuthMiddleware, sendMessage);
export const messageRouter = router;
