/**
 * @swagger
 * tags:
 *   - name: Listings
 *     description: Complete Listings module (create, update, delete, search, engagement, moderation)
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
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *         videos:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [available, unavailable]
 *         views:
 *           type: number
 *         likes:
 *           type: array
 *           items:
 *             type: object
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
 */

/**
 * @swagger
 * /api/listings/create-listing:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateListingRequest'
 *     responses:
 *       201:
 *         description: Listing created successfully
 */

/**
 * @swagger
 * /api/listings/fetch-all-listings:
 *   get:
 *     summary: Fetch all listings for logged-in property provider
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
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
 *     summary: Fetch single listing
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listing retrieved
 */

/**
 * @swagger
 * /api/listings/update-listing/{id}:
 *   put:
 *     summary: Update a listing (no media updates allowed)
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListingRequest'
 *     responses:
 *       200:
 *         description: Listing updated successfully
 */

/**
 * @swagger
 * /api/listings/delete-listing/{id}:
 *   delete:
 *     summary: Delete a listing and its media
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 */

/**
 * @swagger
 * /api/listings/like-listing/{id}:
 *   post:
 *     summary: Like or unlike a listing
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Like toggled successfully
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
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Public listings retrieved
 */

/**
 * @swagger
 * /api/listings/update-listing-status/{id}:
 *   put:
 *     summary: Update listing availability status
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
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
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Views incremented
 */

/**
 * @swagger
 * /api/listings/fetch-popular-listing:
 *   get:
 *     summary: Fetch most popular listings
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: Popular listings retrieved
 */

/**
 * @swagger
 * /api/listings/property-provider/{propertyProviderId}:
 *   get:
 *     summary: Fetch listings by a property provider
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: propertyProviderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listings retrieved
 */

/**
 * @swagger
 * /api/listings/duplicate/{id}:
 *   post:
 *     summary: Duplicate a listing
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Listing duplicated
 */

/**
 * @swagger
 * /api/listings/unavailable-listings:
 *   get:
 *     summary: Fetch unavailable listings for provider
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Unavailable listings retrieved
 */

/**
 * @swagger
 * /api/listings/report-listing/{id}:
 *   post:
 *     summary: Report a listing
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportListingRequest'
 *     responses:
 *       201:
 *         description: Listing reported successfully
 */

/**
 * @swagger
 * /api/listings/search:
 *   get:
 *     summary: Search listings (full-text search)
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: description
 *         schema: { type: string }
 *       - in: query
 *         name: amenities
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search results returned
 */








/**
 * @swagger
 * /api/listings/total-listing/{propertyProviderId}:
 *   get:
 *     summary: Get total listings summary for a property provider
 *     description: |
 *       Returns a breakdown of a property provider's listings including:
 *       - Total number of listings
 *       - Number of available listings
 *       - Number of unavailable listings
 *
 *       ⚠️ Authorization Rules:
 *       - Only authenticated property providers can access this endpoint
 *       - A provider can ONLY access their own listing analytics
 *
 *     tags: [Listings]
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
 *         description: The ID of the property provider whose listing summary is being requested
 *
 *     responses:
 *       200:
 *         description: Listings summary retrieved successfully
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
 *                     propertyProviderId:
 *                       type: string
 *                       example: 64f1c2a9b1234567890abcd1
 *                     availableListings:
 *                       type: number
 *                       example: 8
 *                     unavailableListings:
 *                       type: number
 *                       example: 3
 *                     totalListings:
 *                       type: number
 *                       example: 11
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
 *                   example: You must be logged in as a property provider to view listings summary.
 *
 *       404:
 *         description: Property provider not found (optional, if you later add validation)
 *
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /api/listings/top-three-most-viewed/{propertyProviderId}:
 *   get:
 *     summary: Get top 3 most viewed listings for the current month
 *     description: |
 *       Returns the top three most viewed **available listings** for a property provider
 *       within the current month.
 *
 *       The listings are:
 *       - Filtered by current month (based on creation date)
 *       - Sorted by highest number of views
 *       - Limited to top 3 results
 *
 *       ⚠️ Authorization Rules:
 *       - Only authenticated property providers can access this endpoint
 *       - A provider can ONLY access their own listing analytics
 *
 *     tags: [Listings]
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
 *         description: The ID of the property provider whose listings are being requested
 *
 *     responses:
 *       200:
 *         description: Top 3 most viewed listings retrieved successfully
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
 *                     propertyProviderId:
 *                       type: string
 *                       example: 64f1c2a9b1234567890abcd1
 *                     topListings:
 *                       type: array
 *                       description: Array of top 3 listings sorted by views (descending)
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f1c2a9b1234567890abcd2
 *                           title:
 *                             type: string
 *                             example: Luxury 3 Bedroom Apartment
 *                           description:
 *                             type: string
 *                             example: Spacious and modern apartment located in the city center
 *                           type:
 *                             type: string
 *                             example: 3 Bedroom Flat
 *                           price:
 *                             type: number
 *                             example: 2500000
 *                           location:
 *                             type: string
 *                             example: Abuja, Nigeria
 *                           photos:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["https://image-url.com/photo1.jpg"]
 *                           videos:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["https://video-url.com/video1.mp4"]
 *                           views:
 *                             type: number
 *                             example: 120
 *                           status:
 *                             type: string
 *                             example: available
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-05-01T10:00:00.000Z
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
 *                   example: You must be logged in as a property provider to view this data.
 *
 *       404:
 *         description: No listings found for the current month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No available listings found for this month.
 *
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /api/listings/trending:
 *   get:
 *     summary: Get top trending listings
 *     description: |
 *       Returns a list of trending listings based on **engagement score**.
 *
 *       📊 Engagement Score Formula:
 *       - engagementScore = views + total likes
 *
 *       📌 Sorting Logic:
 *       - Highest engagement score first
 *       - If equal, newer listings rank higher
 *
 *       📌 Only "available" listings are included.
 *
 *     tags: [Listings]
 *       
 *
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *         description: Number of listings to return (default is 10)
 *
 *     responses:
 *       200:
 *         description: Trending listings retrieved successfully
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
 *                   example: Top trending listings retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       price:
 *                         type: number
 *                       location:
 *                         type: string
 *                       views:
 *                         type: number
 *                       likes:
 *                         type: array
 *                         items:
 *                           type: object
 *                       engagementScore:
 *                         type: number
 *                         example: 150
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/listings/hot-locations:
 *   get:
 *     summary: Get hot property locations
 *     description: |
 *       Returns the most popular locations based on aggregated engagement.
 *
 *       📊 Engagement Score Formula:
 *       - engagementScore = totalViews + totalLikes (per location)
 *
 *       📌 Only "available" listings are considered.
 *       📌 Locations are ranked by total engagement.
 *
 *     tags: [Listings]
 *       
 *
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *         description: Number of locations to return (default is 5)
 *
 *     responses:
 *       200:
 *         description: Hot locations retrieved successfully
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
 *                   example: Hot locations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                         example: Abuja, Nigeria
 *                       listingsCount:
 *                         type: number
 *                         example: 12
 *                       totalViews:
 *                         type: number
 *                         example: 850
 *                       totalLikes:
 *                         type: number
 *                         example: 120
 *                       engagementScore:
 *                         type: number
 *                         example: 970
 *
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/listings/popular-property-types:
 *   get:
 *     summary: Get most popular property types
 *     description: |
 *       Returns the most popular property types based on engagement across listings.
 *
 *       📊 Engagement Score Formula:
 *       - engagementScore = totalViews + totalLikes (per property type)
 *
 *       📌 Only "available" listings are included.
 *       📌 Property types are ranked by engagement.
 *
 *     tags: [Listings]
 *       
 *
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *         description: Number of property types to return (default is 5)
 *
 *     responses:
 *       200:
 *         description: Popular property types retrieved successfully
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
 *                   example: Popular property types retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       propertyType:
 *                         type: string
 *                         example: 3 Bedroom Flat
 *                       listingsCount:
 *                         type: number
 *                         example: 20
 *                       totalViews:
 *                         type: number
 *                         example: 1500
 *                       totalLikes:
 *                         type: number
 *                         example: 300
 *                       engagementScore:
 *                         type: number
 *                         example: 1800
 *
 *       500:
 *         description: Internal server error
 */