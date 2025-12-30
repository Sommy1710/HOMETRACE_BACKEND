/**
 * @swagger
 * tags:
 *   name: Property Provider Authentication
 *   description: Property Provider Account Management APIs
 */

/**
 * @swagger
 * /api/propertyProvider/register:
 *   post:
 *     summary: Register a new property provider
 *     tags: [Property Provider Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePassword123
 *               country:
 *                 type: string
 *                 example: Nigeria
 *               bio:
 *                 type: string
 *                 example: Experienced property manager
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Property provider registered successfully. OTP sent to email.
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/propertyProvider/verify:
 *   post:
 *     summary: Verify email using OTP
 *     tags: [Property Provider Authentication]
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
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Property provider not found
 */

/**
 * @swagger
 * /api/propertyProvider/login:
 *   post:
 *     summary: Login a property provider
 *     tags: [Property Provider Authentication]
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
 *                 example: MySecurePassword123
 *     responses:
 *       200:
 *         description: Property provider successfully logged in
 *       403:
 *         description: Email not verified
 *       404:
 *         description: Property provider not found
 */

/**
 * @swagger
 * /api/propertyProvider/user:
 *   get:
 *     summary: Get authenticated property provider details
 *     tags: [Property Provider Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Property provider found successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/propertyProvider/delete/{propertyProviderId}:
 *   delete:
 *     summary: Delete property provider account
 *     tags: [Property Provider Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property provider to delete
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property provider not found
 */

/**
 * @swagger
 * /api/propertyProvider/delete-profile-photo:
 *   delete:
 *     summary: Delete property provider profile photo
 *     tags: [Property Provider Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile photo deleted successfully
 *       400:
 *         description: No profile photo to delete
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/propertyProvider/propertyProviders/{propertyProviderId}:
 *   put:
 *     summary: Update property provider account details
 *     tags: [Property Provider Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property provider to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               bio:
 *                 type: string
 *                 example: Updated bio text
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Property provider updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property provider not found
 */

/**
 * @swagger
 * /api/propertyProvider/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Property Provider Authentication]
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
 *         description: Password reset code sent to email
 *       404:
 *         description: Property provider not found
 */

/**
 * @swagger
 * /api/propertyProvider/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Property Provider Authentication]
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
 *               newPassword:
 *                 type: string
 *                 example: NewStrongPassword!23
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Property provider not found
 */

/**
 * @swagger
 * /api/propertyProvider/logout:
 *   post:
 *     summary: Logout property provider
 *     tags: [Property Provider Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Property provider successfully logged out
 */
