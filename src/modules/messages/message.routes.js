import {Router} from 'express';
import authMiddleware from '../../app/middleware/auth.middleware.js';
import { getMessages, sendMessage } from './message.controller.js';
import {uploadListingMedia} from '../../lib/upload.js';
const router = Router();


router.get('/:userId', authMiddleware, getMessages);
router.post('/', authMiddleware, sendMessage);
export const messageRouter = router;
