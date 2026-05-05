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
 *       400:
 *         description: Validation error
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
 *         description: Email not verified (OTP resent)
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
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: createdAt
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
 *     summary: Ban or unban property provider and update their listings
 *     description: Toggles ban status. If banned → unbans, if active → bans.
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
 *         description: Property provider ban status updated successfully
 */




/**
 * @swagger
 * /api/admin/listing-stats:
 *   get:
 *     summary: Get overall listing statistics
 *     description: >
 *       This endpoint allows an admin to retrieve statistics about all listings
 *       in the system, including total listings, available listings, and unavailable listings.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Listing statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Listing statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalListings:
 *                       type: integer
 *                       example: 120
 *                     availableListings:
 *                       type: integer
 *                       example: 95
 *                     unavailableListings:
 *                       type: integer
 *                       example: 25
 *
 *       401:
 *         description: Unauthorized - Admin not authenticated or invalid role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: you are not authorized to fetch total listings
 *
 *       500:
 *         description: Failed to fetch listing statistics due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch listing statistics
 */


/**
 * @swagger
 * /api/admin/top-viewed-listings:
 *   get:
 *     summary: Get top 5 most viewed available listings
 *     description: >
 *       Retrieves the top 5 listings with the highest number of views.
 *       Only listings with "available" status are included.
 *       Results are sorted in descending order based on view count.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Top viewed listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Top 5 most viewed available listings retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f123abc456def789012345
 *                       title:
 *                         type: string
 *                         example: Luxury 3 Bedroom Apartment
 *                       description:
 *                         type: string
 *                         example: Spacious apartment with modern amenities
 *                       type:
 *                         type: string
 *                         example: 3 Bedroom Flat
 *                       photos:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://image-url.com/photo1.jpg"]
 *                       videos:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://video-url.com/video1.mp4"]
 *                       price:
 *                         type: number
 *                         example: 1500000
 *                       location:
 *                         type: string
 *                         example: Lagos, Nigeria
 *                       geoLocation:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: Point
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                             example: [3.3792, 6.5244]
 *                       amenities:
 *                         type: string
 *                         example: Pool, Gym, Parking
 *                       listedBy:
 *                         type: string
 *                         example: 64f123abc456def789012999
 *                       likes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                             userType:
 *                               type: string
 *                               example: user
 *                       views:
 *                         type: number
 *                         example: 320
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-05-01T12:00:00.000Z
 *
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: You are not authorized to fetch top viewed listings
 *
 *       500:
 *         description: Failed to fetch top viewed listings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch top viewed listings
 */


/**
 * @swagger
 * /api/admin/monthly-new-listings:
 *   get:
 *     summary: Get monthly new listings statistics
 *     description: >
 *       Retrieves the number of new listings created each month.
 *       Returns data for the last 12 months, sorted from most recent to oldest.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Monthly new listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Monthly new listings retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: number
 *                         example: 2026
 *                       month:
 *                         type: string
 *                         example: May
 *                       newListings:
 *                         type: number
 *                         example: 42
 *
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: You are not authorized to fetch monthly new listings
 *
 *       500:
 *         description: Failed to fetch monthly new listings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch monthly new listings
 */