/**
 * @swagger
 * tags:
 *   - name: PropertyProvider
 *     description: Property provider authentication and management
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
 *     PropertyProvider:
 *       type: object
 *       properties:
 *         _id:
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
 *         bio:
 *           type: string
 *         profilePhoto:
 *           type: string
 *         isEmailVerified:
 *           type: boolean
 *         isVerified:
 *           type: boolean
 *         followers:
 *           type: array
 *           items:
 *             type: object
 *
 *     RegisterPropertyProviderRequest:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - username
 *         - email
 *         - password
 *       properties:
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         country:
 *           type: string
 *         bio:
 *           type: string
 *         profilePhoto:
 *           type: string
 *           format: binary
 *
 *     LoginPropertyProviderRequest:
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
 * /api/propertyProvider/register:
 *   post:
 *     summary: Register a new property provider
 *     tags: [PropertyProvider]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPropertyProviderRequest'
 *     responses:
 *       201:
 *         description: Property provider registered and OTP sent
 */

/**
 * @swagger
 * /api/propertyProvider/verify:
 *   post:
 *     summary: Verify property provider email using OTP
 *     tags: [PropertyProvider]
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
 * /api/propertyProvider/login:
 *   post:
 *     summary: Login property provider
 *     tags: [PropertyProvider]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginPropertyProviderRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       403:
 *         description: Account banned or email not verified
 */

/**
 * @swagger
 * /api/propertyProvider/logout:
 *   post:
 *     summary: Logout property provider
 *     tags: [PropertyProvider]
 *     responses:
 *       200:
 *         description: Logout successful
 */

/**
 * @swagger
 * /api/propertyProvider/user:
 *   get:
 *     summary: Get authenticated property provider
 *     tags: [PropertyProvider]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Property provider retrieved successfully
 */

/**
 * @swagger
 * /api/propertyProvider/delete/{propertyProviderId}:
 *   delete:
 *     summary: Delete property provider account
 *     tags: [PropertyProvider]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property provider deleted successfully
 */

/**
 * @swagger
 * /api/propertyProvider/delete-profile-photo:
 *   delete:
 *     summary: Delete property provider profile photo
 *     tags: [PropertyProvider]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile photo deleted successfully
 */

/**
 * @swagger
 * /api/propertyProvider/propertyProviders/{propertyProviderId}:
 *   put:
 *     summary: Update property provider account
 *     tags: [PropertyProvider]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
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
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Property provider updated successfully
 */

/**
 * @swagger
 * /api/propertyProvider/forgot-password:
 *   post:
 *     summary: Send password reset OTP
 *     tags: [PropertyProvider]
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
 *         description: OTP sent successfully
 */

/**
 * @swagger
 * /api/propertyProvider/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [PropertyProvider]
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
 * /api/propertyProvider/follow-property-providers/{propertyProviderId}:
 *   post:
 *     summary: Follow or unfollow a property provider
 *     tags: [PropertyProvider]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow/unfollow action completed
 */