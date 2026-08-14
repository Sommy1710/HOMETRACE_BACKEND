import {Router} from 'express';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js';
import { toggleLikeListingCommentReply } from './listingCommentReplyLike.controller.js';
const router = Router();

router.patch('/listing-comment-reply-like/:id', dualAuthMiddleware, toggleLikeListingCommentReply);

export const listingCommentReplyLikeRouter = router;
