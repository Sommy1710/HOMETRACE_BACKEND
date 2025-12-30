/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and User Account Management APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               country:
 *                 type: string
 *                 example: Nigeria
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully and OTP sent to email.
 *       400:
 *         description: Validation error or missing fields.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify user's email using OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *       400:
 *         description: Invalid or expired OTP.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and return access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       403:
 *         description: Email not verified.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get authenticated user profile
 *     security:
 *       - cookieAuth: []
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Unauthorized or missing authentication.
 */

/**
 * @swagger
 * /api/auth/delete/{userId}:
 *   delete:
 *     summary: Delete a user account
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 6725ff21a56a46a1c2e909ab
 *     responses:
 *       200:
 *         description: User account deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/delete-profile-photo:
 *   delete:
 *     summary: Delete authenticated user's profile photo
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile photo deleted successfully.
 *       400:
 *         description: No profile photo to delete.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   put:
 *     summary: Update user account details
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe_updated
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP via email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset OTP sent.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 example: "54321"
 *               newPassword:
 *                 type: string
 *                 example: newStrongPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Invalid or expired OTP.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: authentication
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         country:
 *           type: string
 *         profilePhoto:
 *           type: string
 *         isEmailVerified:
 *           type: boolean
 *         role:
 *           type: string
 *           enum: [user, admin]
 */


