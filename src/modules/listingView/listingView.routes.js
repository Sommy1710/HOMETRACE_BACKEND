import {Router} from 'express';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js';
import { incrementListingViews } from './listingView.controller.js';
const router = Router();

router.post('/increment-listing-views/:id', dualAuthMiddleware, incrementListingViews);

export const incrementListingViewsRouter = router;
