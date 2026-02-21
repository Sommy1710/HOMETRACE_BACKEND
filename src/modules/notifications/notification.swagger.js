/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: User and PropertyProvider notification management
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
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         recipient:
 *           type: string
 *           description: ID of the user or property provider receiving the notification
 *         recipientModel:
 *           type: string
 *           enum: [User, PropertyProvider]
 *         sender:
 *           type: string
 *           description: ID of the sender (optional)
 *         senderModel:
 *           type: string
 *           enum: [User, PropertyProvider]
 *         type:
 *           type: string
 *           enum: [LISTING_LIKED, NEW_FOLLOWER]
 *         entityId:
 *           type: string
 *           description: ID of the related entity (Listing or PropertyProvider)
 *         entityModel:
 *           type: string
 *           enum: [Listing, PropertyProvider]
 *         message:
 *           type: string
 *         isRead:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/notifications/my-notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user or property provider
 *     description: |
 *       Fetches notifications based on the authenticated account.
 *       The recipientModel is determined automatically from user.role.
 *       Results are sorted by newest first.
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *
 *       401:
 *         description: Unauthorized (missing or invalid authentication)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *
 *       500:
 *         description: Server error while fetching notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
