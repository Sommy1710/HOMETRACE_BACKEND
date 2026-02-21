/**
 * @swagger
 * tags:
 *   - name: Listings
 *     description: Listing management (create, update, delete, like, report, public browsing, analytics)
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
 *     Listing:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: string
 *         username:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *         videos:
 *           type: array
 *           items:
 *             type: string
 *         price:
 *           type: number
 *         location:
 *           type: string
 *         amenities:
 *           type: string
 *         status:
 *           type: string
 *           enum: [available, unavailable]
 *         views:
 *           type: number
 *         likes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [user, propertyProvider]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateListingRequest:
 *       type: object
 *       required:
 *         - description
 *         - type
 *         - price
 *         - location
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         price:
 *           type: number
 *         location:
 *           type: string
 *         amenities:
 *           type: string
 *
 *     UpdateListingRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         price:
 *           type: number
 *         location:
 *           type: string
 *         amenities:
 *           type: string
 *         status:
 *           type: string
 *           enum: [available, unavailable]
 *
 *     ReportListingRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           enum:
 *             - scam
 *             - fake_photos
 *             - misleading_info
 *             - offensive_content
 *             - duplicate_listing
 *             - other
 *         description:
 *           type: string
 *           maxLength: 500
 */
/**
 * @swagger
 * /api/listings/create-listing:
 *   post:
 *     summary: Create a new listing (PropertyProvider only)
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
 *               - description
 *               - type
 *               - price
 *               - location
 *               - photos
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *               amenities:
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
 *         description: New listing created successfully
 *       401:
 *         description: PropertyProvider not authenticated
 *       400:
 *         description: Validation error
 */
/**
 * @swagger
 * /api/listings/fetch-all-listings:
 *   get:
 *     summary: Fetch all listings belonging to authenticated PropertyProvider
 *     tags: [Listings]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, unavailable]
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
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
 *         description: Listing retrieved successfully
 *       404:
 *         description: Listing not found
 */
/**
 * @swagger
 * /api/listings/update-listing/{id}:
 *   put:
 *     summary: Update a listing (media cannot be updated)
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
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListingRequest'
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /api/listings/delete-listing/{id}:
 *   delete:
 *     summary: Delete a listing and its Cloudinary media
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
 *         description: Listing and associated media deleted successfully
 */
/**
 * @swagger
 * /api/listings/like-listing/{id}:
 *   post:
 *     summary: Like or unlike a listing (User or PropertyProvider)
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
 *         description: Listing liked or unliked successfully
 *       401:
 *         description: Not authenticated
 */
/**
 * @swagger
 * /api/listings/fetch-public-listings:
 *   get:
 *     summary: Fetch public available listings
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
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
 *         description: Public listings retrieved successfully
 */
/**
 * @swagger
 * /api/listings/update-listing-status/{id}:
 *   put:
 *     summary: Update listing status (available or unavailable)
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, unavailable]
 *     responses:
 *       200:
 *         description: Listing status updated successfully
 */
/**
 * @swagger
 * /api/listings/increment-listing-views/{id}:
 *   patch:
 *     summary: Increment listing views
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Views incremented successfully
 */
/**
 * @swagger
 * /api/listings/fetch-popular-listing:
 *   get:
 *     summary: Fetch most viewed and trending listings
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Popular listings retrieved successfully
 */
/**
 * @swagger
 * /api/listings/property-provider/{propertyProviderId}:
 *   get:
 *     summary: Fetch all available listings of a specific PropertyProvider
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 */
/**
 * @swagger
 * /api/listings/duplicate/{id}:
 *   post:
 *     summary: Duplicate a listing (new copy is set to unavailable)
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
 *       201:
 *         description: Listing duplicated successfully
 */
/**
 * @swagger
 * /api/listings/unavailable-listings:
 *   get:
 *     summary: Fetch unavailable listings of authenticated PropertyProvider
 *     tags: [Listings]
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
 *     responses:
 *       200:
 *         description: Unavailable listings retrieved successfully
 */
/**
 * @swagger
 * /api/listings/report-listing/{id}:
 *   post:
 *     summary: Report a listing (User or PropertyProvider)
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
 *             $ref: '#/components/schemas/ReportListingRequest'
 *     responses:
 *       201:
 *         description: Listing reported successfully
 *       400:
 *         description: Invalid report data
 *       401:
 *         description: Not authenticated
 *       409:
 *         description: Duplicate report (unique index violation)
 */
