import {Router} from 'express';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js';
import {toggleFavouriteListing, fetchFavouriteListings,} from './favourites.controller.js';
const router = Router();

router.patch('/favourites/:id', dualAuthMiddleware, toggleFavouriteListing);
router.get('/fetch-favourites', dualAuthMiddleware, fetchFavouriteListings);

export const favouritesRouter = router;