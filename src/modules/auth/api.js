import {Router} from 'express';
import {createUserAccount, verifyEmailOTP, authenticateUser, deleteUserAccount, getAuthenticatedUser, deleteprofilePhoto, logoutUser, updateUserAccount, forgotPassword, resetPassword, toggleFavouriteListing, fetchMyFavourites, getProfile, searchByUsername} from './auth.controller.js';
import upload from '../../lib/upload.js';
import authMiddleware from '../../app/middleware/auth.middleware.js';
import dualAuthMiddleware from '../../app/middleware/dual-auth.middleware.js'
import { userlimiter } from './userlimiter.js';
const router = Router();

router.post('/register', upload.single('profilePhoto'), createUserAccount);
router.post('/verify', verifyEmailOTP);
router.post('/login', userlimiter, authenticateUser);
router.get('/user', authMiddleware, getAuthenticatedUser);
router.delete('/delete/:userId', authMiddleware, deleteUserAccount);
router.delete('/delete-profile-photo', authMiddleware, deleteprofilePhoto);
router.put('/users/:userId', authMiddleware, upload.single('profilePhoto'), updateUserAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post("/toggle-favourite-listing/:id", authMiddleware, toggleFavouriteListing);
router.get('/fetch-favourite-listings', authMiddleware, fetchMyFavourites);
/*router.get('/profile/:userId', dualAuthMiddleware, getUserProfile);*/
router.get("/profile/:id", dualAuthMiddleware, getProfile);
router.get("/search", searchByUsername);
router.post("/logout", logoutUser);


export const authRouter = router;

