import {Router} from 'express';
import { createNewListing, deleteSingleListing, fetchAllListings, fetchListing, fetchPublicListings, toggleLikeListing, updateListing, updateListingStatus,
    incrementListingViews, fetchPopularListings, fetchListingsBypropertyProvider, duplicateListing, fetchUnavailableListings
 } from './listing.controller.js';
import {uploadListingMedia} from '../../lib/upload.js';
import propertyProviderMiddleware from '../../app/middleware/propertyProvider.middleware.js';
import dualAuthMiddleware from './../../app/middleware/dual-auth.middleware.js';
const router = Router();

router.post('/create-listing', propertyProviderMiddleware, uploadListingMedia, createNewListing );
router.get('/fetch-all-listings', propertyProviderMiddleware, fetchAllListings);
router.get('/fetch-listing/:id', propertyProviderMiddleware, fetchListing);
router.put('/update-listing/:id', propertyProviderMiddleware, updateListing)
router.post("/like-listing/:id", dualAuthMiddleware, toggleLikeListing);
router.delete('/delete-listing/:id', propertyProviderMiddleware, deleteSingleListing);
router.get('/fetch-public-listings', fetchPublicListings);
router.put('/update-listing-status/:id', propertyProviderMiddleware, updateListingStatus );
router.patch('/increment-listing-views/:id', incrementListingViews);
router.get('/fetch-popular-listing', fetchPopularListings)
router.get('/property-provider/:propertyProviderId', fetchListingsBypropertyProvider);
router.post('/duplicate/:id', propertyProviderMiddleware, duplicateListing);
router.get('/unavailable-listings', propertyProviderMiddleware, fetchUnavailableListings)
export const listingRouter = router;

