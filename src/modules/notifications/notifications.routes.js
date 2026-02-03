import {Router} from "express";
import { getMyNotifications } from './notification.controller.js';
import dualAuthMiddleware from "../../app/middleware/dual-auth.middleware.js";

const router = Router();

router.get('/my-notifications', dualAuthMiddleware, getMyNotifications);
export const notificationsRouter = router;

