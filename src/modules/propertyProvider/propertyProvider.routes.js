import {Router} from 'express';
import {createPropertyProviderAccount, verifyEmailOTP, authenticatePropertyProvider, deletePropertyProviderAccount, getAuthenticatedPropertyProvider, logoutPropertyProvider, deletePropertyProviderProfilePhoto, updatePropertyProviderAccount} from './propertyProvider.controller.js';
import upload from '../../lib/upload.js';
import propertyProviderMiddleware from '../../app/middleware/propertyProvider.middleware.js';
import { propertyProviderLimiter } from './propertyProviderLimiter.js';
const router = Router();

router.post('/register', upload.single('profilePhoto'), createPropertyProviderAccount);
router.post('/verify', verifyEmailOTP);
router.post('/login', propertyProviderLimiter, authenticatePropertyProvider);
router.get('/user', propertyProviderMiddleware, getAuthenticatedPropertyProvider);
router.delete('/delete/:propertyProviderId', propertyProviderMiddleware, deletePropertyProviderAccount);
router.delete('/delete-profile-photo', propertyProviderMiddleware, deletePropertyProviderProfilePhoto);
router.put('/propertyProviders/:propertyProviderId', propertyProviderMiddleware, upload.single('profilePhoto'), updatePropertyProviderAccount);
router.post("/logout", logoutPropertyProvider);

export const propertyProviderRouter = router;
