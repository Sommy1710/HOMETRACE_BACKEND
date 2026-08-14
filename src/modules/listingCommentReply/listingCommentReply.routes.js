import {Router} from 'express';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js';
import {createListingCommentReply, deleteListingCommentReply} from './listingCommentReply.controller.js'
const router = Router();

router.post(
    "/comment-reply/:id",
    dualAuthMiddleware,
    createListingCommentReply
);
router.delete("/delete-comment-reply/:id", dualAuthMiddleware, deleteListingCommentReply);

export const listingCommentReplyRouter = router;