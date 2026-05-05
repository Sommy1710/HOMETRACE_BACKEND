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




/**
 * @swagger
 * /api/propertyProvider/analytics/{propertyProviderId}:
 *   get:
 *     summary: Get profile view analytics (last 30 days)
 *     description: >
 *       Returns analytics for a property provider's profile views within the last 30 days.
 *       It includes total views, follower vs non-follower views, and percentage breakdown.
 *       
 *       ⚠️ Only the authenticated property provider can access their own analytics.
 *
 *     tags: [PropertyProvider]
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property provider
 *
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProfileViewAnalytics'
 *
 *       401:
 *         description: Unauthorized - Not logged in or invalid token
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized
 *
 *       403:
 *         description: Forbidden - Trying to access another provider's analytics
 *         content:
 *           application/json:
 *             example:
 *               message: You are not authorized to view analytics for another provider.
 *
 *       404:
 *         description: Property provider not found
 *         content:
 *           application/json:
 *             example:
 *               message: Property provider not found
 *
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */




/**
 * @swagger
 * /api/propertyProvider/accounts-reached/{propertyProviderId}:
 *   get:
 *     summary: Get total accounts reached (unique profile viewers) in the last 30 days
 *     description: |
 *       Returns the number of unique accounts that have viewed a property provider's profile 
 *       within the last 30 days.
 *       
 *       ⚠️ Authorization Rules:
 *       - Only authenticated property providers can access this endpoint
 *       - A provider can ONLY access their own analytics
 *
 *     tags: [PropertyProvider]
 *      
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property provider whose analytics is being requested
 *
 *     responses:
 *       200:
 *         description: Accounts reached fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accountsReached:
 *                       type: number
 *                       example: 125
 *                     period:
 *                       type: string
 *                       example: last 30 days
 *
 *       401:
 *         description: Unauthorized - User not authenticated or trying to access another provider's data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: you must be logged in as a property provider to view accounts reached
 *
 *       404:
 *         description: Property provider not found (if you later add this validation)
 *
 *       500:
 *         description: Internal server error
 */