/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: User-to-user messaging system
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     UserPreview:
 *       type: object
 *       description: Minimal user info returned in messages
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1a2c9b1d2e00123abcd1
 *         username:
 *           type: string
 *           example: john_doe
 *
 *     Message:
 *       type: object
 *       description: Message object returned by the API
 *       properties:
 *         _id:
 *           type: string
 *           example: 66601a2c9b1d2e00123abcd9
 *         sender:
 *           $ref: '#/components/schemas/UserPreview'
 *         receiver:
 *           $ref: '#/components/schemas/UserPreview'
 *         content:
 *           type: string
 *           nullable: true
 *           example: Is this apartment still available?
 *         photos:
 *           type: array
 *           description: Array of image URLs uploaded to Cloudinary
 *           items:
 *             type: string
 *             format: uri
 *           example:
 *             - https://res.cloudinary.com/demo/image/upload/v123/photo.jpg
 *         read:
 *           type: boolean
 *           example: false
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: 2026-01-07T12:30:00.000Z
 *
 *     SendMessageRequest:
 *       type: object
 *       description: Payload used to send a message
 *       required:
 *         - receiver
 *       properties:
 *         receiver:
 *           type: string
 *           description: User ID of the message recipient
 *           example: 665f1a2c9b1d2e00123abcd2
 *         content:
 *           type: string
 *           maxLength: 2000
 *           description: Optional text content
 *           example: Hello, I’m interested in this property
 *         photos:
 *           type: string
 *           format: binary
 *           description: Optional photo to send (can send multiple using "Choose Files")
 *       oneOf:
 *         - required: [content]
 *         - required: [photos]
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Message sent successfully
 *         data:
 *           $ref: '#/components/schemas/Message'
 *
 *     MessagesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Authentication required
 */

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Get all messages for a user
 *     description: Fetch messages where the authenticated user is sender or receiver.
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Authenticated user's ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagesListResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: User not authorized to view messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     description: |
 *       Sends a message to another user.
 *       - Sender is derived from authentication.
 *       - Supports text-only, image-only, or both.
 *       - For images, use `multipart/form-data`.
 *       - Cannot send messages to yourself.
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *                 description: User ID of the recipient
 *                 example: 665f1a2c9b1d2e00123abcd2
 *               content:
 *                 type: string
 *                 description: Optional text content
 *                 example: Hello, I’m interested in this property
 *               photos:
 *                 type: array
 *                 description: Optional images to send
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error (missing fields, invalid receiver)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
