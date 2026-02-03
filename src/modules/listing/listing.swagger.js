/**
 * @swagger
 * components:
 *   securitySchemes:
 *     CookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: authentication
 *
 *   schemas:
 *     Listing:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f2c8e3a8f1b1234567890
 *         title:
 *           type: string
 *           example: Modern 2 Bedroom Flat
 *         description:
 *           type: string
 *           example: Spacious flat with modern finishes
 *         type:
 *           type: string
 *           example: 2 Bedroom Flat
 *         price:
 *           type: number
 *           example: 2200000
 *         location:
 *           type: string
 *           example: Lekki Phase 1, Lagos
 *         amenities:
 *           type: string
 *           example: Parking, Security, Water heater
 *         status:
 *           type: string
 *           example: available
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         videos:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         likes:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/listings/create-listing:
 *   post:
 *     summary: Create a new property listing
 *     description: Property providers can create listings with photos and videos
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - location
 *               - photos
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Listing created successfully
 *       401:
 *         description: Not authenticated
 */


/**
 * @swagger
 * /api/listings/fetch-all-listings:
 *   get:
 *     summary: Fetch listings created by authenticated property provider
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 *       401:
 *         description: Not authenticated
 */


/**
 * @swagger
 * /api/listings/fetch-listing/{id}:
 *   get:
 *     summary: Fetch a single listing by ID
 *     tags: [Listings]
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
 *         description: Listing retrieved
 *       404:
 *         description: Listing not found
 */


/**
 * @swagger
 * /api/listings/update-listing/{id}:
 *   put:
 *     summary: Update a listing (excluding media)
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/listings/delete-listing/{id}:
 *   delete:
 *     summary: Delete a listing owned by property provider
 *     tags: [Listings]
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */

/**
 * @swagger
 * /api/listings/like-listing/{id}:
 *   post:
 *     summary: Like or unlike a listing
 *     description: Works for users and property providers
 *     tags: [Listings]
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
 *         description: Like toggled
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/listings/fetch-public-listings:
 *   get:
 *     summary: Fetch publicly available listings
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public listings retrieved
 */