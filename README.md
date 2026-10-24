#  Hometrace API

Hometrace is a housing and property management API designed to make it easier for users to **discover, explore, and interact with properties**, while giving property providers the tools they need to **create and manage property listings**.

The API supports property listings with photos and videos, user interactions, favourites, comments, notifications, messaging, property searches, location-based information, and property provider verification.

> **⚠️ Work in Progress**
>
> This API is currently under active development. Features, endpoints, database structures, and implementation details may change as development continues.

---

## 🚀 Overview

Hometrace provides two primary account types:

### 👤 User

Users can:

- Create and manage their accounts
- Browse property listings
- Search for properties
- View property details
- Like listings
- Comment on listings
- Like comments
- Reply to comments
- Like comment replies
- Add listings to favourites
- Receive notifications
- Send and receive messages
- View listing statistics such as views
- Interact with property providers

# 🌐 Deployment

The Hometrace backend API is currently hosted on **Render**.

### Production API

[Hometrace Backend API](https://hometrace-backend-9.onrender.com?utm_source=chatgpt.com)

The deployed API can be used by the frontend application to communicate with the Hometrace backend.

### Health Check

The deployed server also provides a health-check endpoint:

```text
https://hometrace-backend-9.onrender.com/health
```

A successful response should look like:

```json
{
  "success": true,
  "message": "server is running"
}
```

### API Documentation

Swagger API documentation is available through:

```text
https://hometrace-backend-9.onrender.com/api-docs
```

> **Note:** The backend is still under active development, so the production API, available endpoints, and documentation may change over time.

### 🏢 Property Provider

Property providers can:

- Create and manage their accounts
- Create property listings
- Upload property photos and videos
- Update and manage their listings
- Monitor listing interactions
- View listing statistics
- Receive notifications
- Communicate with users
- Have their identity verified through NIN verification

Listings can contain information such as:

- Property title
- Description
- Property type
- Price
- Location
- Photos
- Videos
- Views
- Likes
- Comments
- Other property-related information

---

# 🛠️ Technologies Used

The API is built with **Node.js, Express.js, MongoDB and several supporting services and libraries.**

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime used to build the backend |
| **Express.js** | Web framework for building the REST API |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB object modeling and schema management |
| **Cloudinary** | Image and video upload/storage |
| **Brevo** | Email delivery |
| **Joi** | Request data validation |
| **Argon2** | Password hashing |
| **OpenStreetMap** | Geolocation and location-related services |
| **WebSockets (`ws`)** | Real-time notifications and messaging |
| **QoreID** | NIN verification |
| **Swagger** | API documentation |
| **Redis** | Caching |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-Origin Resource Sharing |
| **Compression** | HTTP response compression |
| **Express Rate Limiting** | Protection against excessive requests |
| **Cookie Parser** | Handling authentication cookies |
| **JWT** | Authentication and authorization |
| **Sentry** | Error monitoring |

---

# 📁 Project Structure

The project is organized into modules so that different features of the application remain separated and easier to maintain.

```text
src/
│
├── app/
│   └── middleware/
│       ├── auth.middleware.js
│       ├── propertyProvider.middleware.js
│       ├── dualAuth.middleware.js
│       ├── error-middleware.js
│       └── logger.middleware.js
│
├── config/
│   └── app.config.js
│
├── docs/
│   └── swagger.js
│
├── lib/
│   ├── error-definitions.js
│   └── util.js
│
├── modules/
│   ├── auth/
│   ├── admin/
│   ├── propertyProvider/
│   ├── listing/
│   ├── favourites/
│   ├── listingComment/
│   ├── listingCommentLike/
│   ├── listingCommentReply/
│   ├── listingCommentReplyLike/
│   ├── listingView/
│   ├── messages/
│   ├── notifications/
│   ├── search/
│   └── ninVerification/
│
└── server.js
```

The exact project structure may continue to change as the API develops.

---

# 🔐 Authentication & Authorization

Hometrace uses authentication to protect private endpoints and determine what actions a user is allowed to perform.

Authentication is handled using **JWT-based authentication**.

The application uses different middleware depending on the type of account accessing an endpoint.

### User Authentication Middleware

The user authentication middleware verifies that a request was made by an authenticated user.

It is used for endpoints that should only be accessible to users.

Examples include:

- Adding a listing to favourites
- Liking a listing
- Commenting
- Managing user-specific resources

### Property Provider Authentication Middleware

The property provider middleware verifies that the authenticated account is a property provider.

It is used for property-provider-specific operations such as:

- Creating listings
- Updating listings
- Managing properties
- Accessing property-provider resources

### Dual Authentication Middleware

Some endpoints can be accessed by **both users and property providers**.

For these endpoints, the `dualAuthMiddleware` is used.

This allows the API to authenticate either account type without requiring separate endpoints.

---

# 🏘️ Property Listings

Property listings are one of the main components of the API.

Property providers can create listings containing information such as:

```text
Title
Description
Property Type
Price
Location
Photos
Videos
Status
Views
Likes
Comments
```

Listings support both **image and video uploads** through Cloudinary.

A listing can also receive interactions from users, including:

- Likes
- Comments
- Comment replies
- Comment likes
- Reply likes
- Views
- Favourites

---

# ❤️ Favourites

Users can save listings they are interested in to their favourites.

This allows users to easily return to properties they may want to consider later.

---

# 💬 Comments & Replies

Users can interact with property listings through comments.

The API supports:

- Creating comments
- Liking comments
- Replying to comments
- Liking replies

This allows users to interact with listings and potentially communicate with other users through listing discussions.

---

# 🔔 Real-Time Notifications

Hometrace uses **WebSockets** to provide real-time notifications.

The WebSocket server is created using the `ws` package.

When a user connects:

1. The authentication cookie is retrieved.
2. The JWT is extracted.
3. The JWT is verified.
4. The user's ID is obtained.
5. The user's WebSocket connection is stored.
6. The connection can then receive real-time notifications.

A simplified connection flow looks like:

```text
Client
   │
   │ WebSocket Connection
   ▼
WebSocket Server
   │
   │ Verify JWT
   ▼
Authenticated User
   │
   │ Store Connection
   ▼
connectedUsers Map
   │
   │
   ▼
Real-Time Notifications
```

The server maintains active connections using a `Map`:

```javascript
export const connectedUsers = new Map();
```

Notifications can then be sent to a specific connected user.

If the user is not currently connected, the notification is not sent through the active WebSocket connection.

---

# ✉️ Messaging

The API includes a messaging module that supports communication between users and property providers.

WebSockets are used to support real-time communication.

The messaging system is still under active development and may change as additional functionality is implemented.

---

# 📧 Email Delivery

The API uses **Brevo** for email delivery.

Email functionality can be used for operations such as:

- OTP delivery
- Account verification
- Authentication-related emails
- Other transactional emails

Brevo is used as the external email delivery service rather than relying directly on the application's server to deliver emails.

---

# Image & Video Uploads

Property images and videos are uploaded and managed through **Cloudinary**.

Cloudinary provides:

- Media storage
- Image hosting
- Video hosting
- Media URLs
- Media transformation capabilities

The API handles the upload process and stores the resulting media information associated with property listings.

---

# 📍 Geolocation

The project uses **OpenStreetMap** for location and geolocation-related functionality.

This allows property listings to include location information that can be used to improve property discovery and location-based searches.

---

# 🪪 NIN Verification

Property providers can undergo identity verification through **QoreID**.

The NIN verification module communicates with QoreID to verify submitted Nigerian National Identification Numbers.

The verification functionality is currently under development and may change as the integration evolves.

---

# 🗄️ Database

The application uses **MongoDB** as its primary database.

**Mongoose** is used to:

- Define schemas
- Create models
- Validate database structures
- Query MongoDB
- Manage relationships between documents

Major database resources include:

```text
Users
Property Providers
Listings
Favourites
Comments
Comment Likes
Comment Replies
Reply Likes
Notifications
Messages
Listing Views
```

---

# ⚡ Redis Caching

**Redis** is used for caching.

Caching can help reduce unnecessary database queries and improve API performance by temporarily storing frequently requested data.

The caching layer is intended to improve performance as the application grows.

---

# 🛡️ Security

Several security and performance mechanisms are used throughout the API.

### Helmet

Helmet is used to add security-related HTTP headers.

```javascript
app.use(helmet());
```

### CORS

CORS is enabled to allow requests from authorized frontend applications.

```javascript
app.use(cors());
```

### Rate Limiting

Rate limiting is used to help prevent abuse and excessive requests to the API.

### Password Hashing

Passwords are hashed using **Argon2** rather than being stored as plain text.

### JWT Authentication

JWTs are used to authenticate requests and identify authenticated accounts.

### HTTP-Only Authentication Cookies

Authentication information can be stored in cookies configured with security-related options such as:

```text
httpOnly
secure
sameSite
```

---

# 📚 API Documentation

The API is documented using **Swagger**.

Swagger provides an interactive interface for exploring and testing available API endpoints.

Once the server is running, the documentation is available at:

```text
/api-docs
```

For example:

```text
http://localhost:PORT/api-docs
```

The exact port depends on the application's environment configuration.

---

# ❤️ Health Check

The API provides a health-check endpoint:

```http
GET /health
```

A successful response looks like:

```json
{
  "success": true,
  "message": "server is running"
}
```

This endpoint can be used to confirm that the API server is running.

---

# 🔗 Main API Routes

The current API contains routes for the following major modules:

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/propertyProvider` | Property provider operations |
| `/api/admin` | Administrative operations |
| `/api/listings` | Property listings |
| `/api/favourites` | Favourite listings |
| `/api/listingComment` | Listing comments |
| `/api/listingCommentLike` | Comment likes |
| `/api/listingCommentReply` | Comment replies |
| `/api/listingCommentReplyLike` | Reply likes |
| `/api/search` | Property/search functionality |
| `/api/messages` | Messaging |
| `/api/notifications` | Notifications |
| `/api/listingView` | Listing views |
| `/api/nin-verification` | NIN verification |
| `/api-docs` | Swagger API documentation |
| `/health` | Server health check |

---

# ⚙️ Getting Started

## 1. Clone the repository

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd <project-folder>
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file in the root of the project.

Example:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=your_jwt_expiration

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=your_email
EMAIL_NAME=your_email_name

QOREID_BASE_URL=your_qoreid_base_url
QOREID_CLIENT_ID=your_qoreid_client_id
QOREID_CLIENT_SECRET=your_qoreid_client_secret

REDIS_URL=your_redis_url
```

> The environment variables above are examples. The actual variables required by the project may change as development continues.

**Never commit your `.env` file to GitHub.**

---

# ▶️ Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The exact scripts depend on the project's `package.json`.

Once the server starts, you can check:

```text
GET /health
```

or open the Swagger documentation:

```text
/api-docs
```

---

# 🧪 API Development

The API is being developed with a modular architecture.

Each major feature is separated into its own module.

For example:

```text
modules/
│
├── listing/
├── messages/
├── notifications/
├── favourites/
└── search/
```

This makes it easier to:

- Add new features
- Maintain existing features
- Debug individual modules
- Scale the application
- Keep business logic organized

---

# 🏗️ Architecture Overview

A simplified request flow is:

```text
Client / Frontend
        │
        ▼
     Express
        │
        ▼
     Middleware
        │
        ├── Authentication
        ├── Authorization
        ├── Validation
        ├── Rate Limiting
        └── Logging
        │
        ▼
      Routes
        │
        ▼
   Controllers
        │
        ▼
     Services
        │
        ├───────────────┐
        ▼               ▼
    MongoDB           External APIs
    /Mongoose         │
                      ├── Cloudinary
                      ├── Brevo
                      ├── QoreID
                      └── OpenStreetMap
```

Real-time communication operates separately through WebSockets:

```text
Frontend
   │
   │ WebSocket
   ▼
WebSocket Server
   │
   ▼
Authenticated Connection
   │
   ▼
Real-Time Notification / Message
```

---

# 🚧 Current Development Status

Hometrace is currently a **work-in-progress project**.

Some functionality may still be incomplete, experimental, or subject to change.

Planned and ongoing improvements may include:

- Additional property search functionality
- Improved caching
- More robust real-time messaging
- Additional notification functionality
- Improved property-provider verification
- Additional security improvements
- Performance optimization
- More comprehensive API documentation
- Additional testing
- Deployment and infrastructure improvements

The README will be updated as the project evolves.

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

Before making major changes, please ensure that the proposed changes are consistent with the existing project architecture.

---

# 📄 License

This project is currently under development.

License information will be added when the project's licensing decision has been finalized.

---

## 👨‍💻 Project Status

**Status:** 🚧 Active Development

**Backend:** Node.js / Express.js

**Database:** MongoDB / Mongoose

**API Documentation:** Swagger

**Real-Time Communication:** WebSockets

**Media Storage:** Cloudinary

**Email:** Brevo

**Identity Verification:** QoreID

**Caching:** Redis

**Geolocation:** OpenStreetMap
