import {Router} from 'express';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js';
import {toggleLikeListingComment} from './listingCommentLike.controller.js';
const router = Router();

router.patch("/listing-comment-like/:id", dualAuthMiddleware, toggleLikeListingComment);

export const listingCommentLikeRouter = router;