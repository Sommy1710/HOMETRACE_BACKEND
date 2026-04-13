/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user account management
 */

/**
 * @swagger
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
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         country:
 *           type: string
 *         profilePhoto:
 *           type: string
 *         role:
 *           type: string
 *         isEmailVerified:
 *           type: boolean
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         country:
 *           type: string
 *         profilePhoto:
 *           type: string
 *           format: binary
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     VerifyOTPRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *         otp:
 *           type: string
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *         otp:
 *           type: string
 *         newPassword:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered and OTP sent
 */

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify email using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPRequest'
 *     responses:
 *       200:
 *         description: Email verified successfully
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       403:
 *         description: Email not verified
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get authenticated user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user retrieved
 */

/**
 * @swagger
 * /api/auth/delete/{userId}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Auth]
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
 *         description: User deleted successfully
 */

/**
 * @swagger
 * /api/auth/delete-profile-photo:
 *   delete:
 *     summary: Delete user profile photo
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile photo deleted
 */

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   put:
 *     summary: Update user account
 *     tags: [Auth]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 */

/**
 * @swagger
 * /api/auth/toggle-favourite-listing/{id}:
 *   post:
 *     summary: Add or remove listing from favourites
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favourite toggled
 */

/**
 * @swagger
 * /api/auth/fetch-favourite-listings:
 *   get:
 *     summary: Get user's favourite listings
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Favourites retrieved
 */

/**
 * @swagger
 * /api/auth/profile/{id}:
 *   get:
 *     summary: Get user or property provider profile
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved
 */

/**
 * @swagger
 * /api/auth/search:
 *   get:
 *     summary: Search users and property providers by username
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Search results returned
 */
