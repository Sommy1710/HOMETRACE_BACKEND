/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Complete Admin module (authentication, profile, user management, listing moderation)
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
 *     Admin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           example: admin
 *         isEmailVerified:
 *           type: boolean
 *
 *     AdminRegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: superadmin
 *         email:
 *           type: string
 *           example: admin@example.com
 *         password:
 *           type: string
 *           example: password123
 *
 *     AdminLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: admin@example.com
 *         password:
 *           type: string
 *           example: password123
 *
 *     AdminVerifyOTPRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *         otp:
 *           type: string
 *           example: 12345
 *
 *     UpdateAdminRequest:
 *       type: object
 *       required:
 *         - username
 *       properties:
 *         username:
 *           type: string
 *           example: updatedAdminName
 *
 *     BanPropertyProviderRequest:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           example: Violation of platform rules
 */
/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminRegisterRequest'
 *     responses:
 *       201:
 *         description: Admin registered successfully. OTP sent.
 *       409:
 *         description: Admin already exists
 */
/**
 * @swagger
 * /api/admin/verify:
 *   post:
 *     summary: Verify admin email using OTP
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminVerifyOTPRequest'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Admin not found
 */
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Admin successfully logged in
 *       403:
 *         description: Email not verified
 *       404:
 *         description: Admin not found
 */
/**
 * @swagger
 * /api/admin/user:
 *   get:
 *     summary: Get authenticated admin
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin found successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/admin/user/{adminId}:
 *   put:
 *     summary: Update admin profile
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdminRequest'
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 */
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users (paginated)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
/**
 * @swagger
 * /api/admin/propertyProviders:
 *   get:
 *     summary: List all property providers (paginated)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Property providers retrieved successfully
 */
/**
 * @swagger
 * /api/admin/user/{userId}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Admin]
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
 * /api/admin/propertyProvider/{propertyProviderId}:
 *   delete:
 *     summary: Delete property provider account
 *     tags: [Admin]
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
 * /api/admin/listing:
 *   get:
 *     summary: Fetch all pending reported listings
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Reported listings retrieved
 */
/**
 * @swagger
 * /api/admin/review-report/{reportId}:
 *   patch:
 *     summary: Mark report as reviewed
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report marked as reviewed
 */
/**
 * @swagger
 * /api/admin/resolve-report/{reportId}:
 *   patch:
 *     summary: Resolve report
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report resolved successfully
 */
/**
 * @swagger
 * /api/admin/take-down-listing/{listingId}:
 *   patch:
 *     summary: Take down a listing (soft delete)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing taken down successfully
 */
/**
 * @swagger
 * /api/admin/listing/{id}:
 *   delete:
 *     summary: Permanently delete listing and all associated media
 *     tags: [Admin]
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
 *         description: Listing deleted successfully
 */
/**
 * @swagger
 * /api/admin/ban-propertyProvider/{propertyProviderId}:
 *   patch:
 *     summary: Ban property provider and disable listings
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BanPropertyProviderRequest'
 *     responses:
 *       200:
 *         description: Property provider banned successfully
 */
