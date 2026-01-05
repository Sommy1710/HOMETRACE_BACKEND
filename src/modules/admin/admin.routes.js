import {Router} from 'express';
import {createAdminAccount,
     authenticateAdmin,
      getAuthenticatedAdmin,
       deleteUserAccountByAdmin,
        deletePropertyProviderAccountByAdmin,
         listAllUsersByAdmin,
        listAllPropertyProvidersByAdmin,
    updateAdminProfile,
    deleteSingleListingByAdmin, verifyAdminEmailOTP} from './admin.controller.js';
import adminMiddleware from '../../app/middleware/admin.middleware.js';
import { adminLimiter } from './adminLimiter.js';
const router = Router();

router.post('/register', createAdminAccount);
router.post('/verify', verifyAdminEmailOTP);
router.post('/login', adminLimiter, authenticateAdmin);
router.get('/user', adminMiddleware, getAuthenticatedAdmin);
router.delete('/user/:userId', adminMiddleware, deleteUserAccountByAdmin);
router.delete('/propertyProvider/:propertyProviderId', adminMiddleware, deletePropertyProviderAccountByAdmin);
router.get('/users', adminMiddleware, listAllUsersByAdmin);
router.get('/propertyProviders', adminMiddleware, listAllPropertyProvidersByAdmin);
router.put('/user/:adminId', adminMiddleware, updateAdminProfile)
router.delete('/listing/:id', adminMiddleware, deleteSingleListingByAdmin);

export const adminRouter = router;
