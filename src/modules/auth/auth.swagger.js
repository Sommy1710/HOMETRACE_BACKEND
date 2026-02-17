/**
 * @swagger
 * tags:
 *   - name: Account Management
 *     description: User authentication, profile management, and password operations
 *
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: authentication
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Account Management]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 32
 *               country:
 *                 type: string
 *                 example: Nigeria
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully. OTP sent to email.
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify user email with OTP
 *     tags: [Account Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Account Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       403:
 *         description: Email not verified
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get authenticated user
 *     tags: [Account Management]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User found successfully
 *       401:
 *         description: Invalid or missing token
 */
/**
 * @swagger
 * /api/auth/delete/{userId}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Account Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *       403:
 *         description: Not authorized
 */
/**
 * @swagger
 * /api/auth/users/{userId}:
 *   put:
 *     summary: Update user account
 *     tags: [Account Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: At least one field (username or profilePhoto) must be provided
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               profilePhoto:
 *                 type: string
 *                 format: uri
 *             anyOf:
 *               - required: [username]
 *               - required: [profilePhoto]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Account Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset code sent
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Account Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired OTP
 */
/**
 * @swagger
 * /api/auth/delete-profile-photo:
 *   delete:
 *     summary: Delete logged-in user's profile photo
 *     tags: [Account Management]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile photo deleted successfully
 *       400:
 *         description: No profile photo exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete profile photo
 */
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Account Management]
 *     responses:
 *       200:
 *         description: User successfully logged out
 */
