import {Router} from 'express';
import {createUserAccount, verifyEmailOTP, authenticateUser, deleteUserAccount, getAuthenticatedUser, deleteprofilePhoto, logoutUser, updateUserAccount} from './auth.controller.js';
import upload from '../../lib/upload.js';
import authMiddleware from '../../app/middleware/auth.middleware.js';
import { userlimiter } from './userlimiter.js';
const router = Router();

router.post('/register', upload.single('profilePhoto'), createUserAccount);
router.post('/verify', verifyEmailOTP);
router.post('/login', userlimiter, authenticateUser);
router.get('/user', authMiddleware, getAuthenticatedUser);
router.delete('/delete/:userId', authMiddleware, deleteUserAccount);
router.delete('/delete-profile-photo', authMiddleware, deleteprofilePhoto);
router.put('/users/:userId', authMiddleware, upload.single('profilePhoto'), updateUserAccount);
router.post("/logout", logoutUser);

export const authRouter = router;

