import {Router} from 'express';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js';
import {createListingComment, deleteListingComment} from './listingComment.controller.js'
const router = Router();

router.post("/listing-comment/:id", dualAuthMiddleware, createListingComment);
router.delete("/delete-listing-comment/:id", dualAuthMiddleware, deleteListingComment);

export const listingCommentRouter = router;
