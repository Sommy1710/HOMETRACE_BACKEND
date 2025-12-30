/**
 * @swagger
 * components:
 *   securitySchemes:
 *     AdminAuth:
 *       type: apiKey
 *       in: cookie
 *       name: authentication
 *
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f123abc456def7890
 *         username:
 *           type: string
 *           example: superadmin
 *         email:
 *           type: string
 *           example: admin@example.com
 *         role:
 *           type: string
 *           example: admin
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         totalPages:
 *           type: integer
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
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
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Authenticate admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin logged in successfully (auth cookie set)
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/admin/user:
 *   get:
 *     summary: Get authenticated admin profile
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       200:
 *         description: Admin retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/admin/user/{userId}:
 *   delete:
 *     summary: Delete a user account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
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
 * /api/admin/propertyProvider/{propertyProviderId}:
 *   delete:
 *     summary: Delete a property provider account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property provider deleted successfully
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /api/admin/listing/{id}:
 *   delete:
 *     summary: Delete a listing and all media (Admin only)
 *     tags: [Admin, Listings]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing and media deleted successfully
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
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
 *     summary: List all property providers (Admin only)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property providers retrieved successfully
 */

/**
 * @swagger
 * /api/admin/user/{adminId}:
 *   put:
 *     summary: Update admin profile (self only)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
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
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       403:
 *         description: Not authorized
 */
