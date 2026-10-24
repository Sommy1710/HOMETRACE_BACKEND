import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import logger from '../app/middleware/logger.middleware.js';
import { NotFoundError } from '../lib/error-definitions.js';
import errorMiddleware from '../app/middleware/error-middleware.js';
import config from '../config/app.config.js'
import { getSecondsFromNow } from '../lib/util.js';
import express from 'express';
import {createServer} from 'http';
import {authRouter} from '../modules/auth/api.js';
import { propertyProviderRouter } from '../modules/propertyProvider/propertyProvider.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';
import { messageRouter } from '../modules/messages/message.routes.js';
import {notificationsRouter} from '../modules/notifications/notifications.routes.js';
import cookieParser  from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../docs/swagger.js';
import * as Sentry from '@sentry/node';
import { listingRouter } from './../modules/listing/listing.routes.js';
import {favouritesRouter} from '../modules/favourites/favourites.routes.js';
import { listingCommentRouter } from '../modules/listingComment/listingComment.routes.js';
import {listingCommentLikeRouter} from '../modules/listingCommentLike/listingCommentLike.routes.js';
import {listingCommentReplyRouter} from '../modules/listingCommentReply/listingCommentReply.routes.js';
import {listingCommentReplyLikeRouter} from '../modules/listingCommentReplyLike/listingCommentReplyLike.routes.js';
import {searchRouter} from '../modules/search/search.routes.js';
import { incrementListingViewsRouter } from '../modules/listingView/listingView.routes.js';
import {ninVerificationRouter} from "../modules/ninVerification/ninVerification.routes.js";
import {WebSocketServer, WebSocket} from "ws";
import jwt from 'jsonwebtoken';






const app = express();
const server = createServer(app);

const wss = new WebSocketServer({
    server
});

export const connectedUsers = new Map();

wss.on('connection', (ws, req) => {
    console.log('websocket client connected');

    try {
        const cookies = req.headers.cookie;
        if (!cookies) {
            ws.close(1008, 'Authentication required.');
            return;
        }

        // find authentication cookie
        const authenticationCookie = cookies
        .split(';')
        .find(cookie => 
            cookie.trim().startsWith('authentication=')
        );
        if (!authenticationCookie) {
            ws.close(1008, 'authentication required.');
            return;
        }

        const token = authenticationCookie
        .split('=')[1];

        //verify jwt
        const decoded = jwt.verify(
            token,
            config.jwt.secret
        );

        const userId = decoded.id || decoded.userId;

        if (!userId) {
            ws.close(1008, 'invalid authentication token.');
            return
        }

        //store user connection
        connectedUsers.set(
            userId.toString(),
            ws
        );

        //store user id on socket
        ws.userId = userId.toString();

        console.log(
            `User ${ws.userId} connected to notifications`
        );

        // Tell frontend connection succeeded
        ws.send(
            JSON.stringify({
                type: 'connected',
                message: 'Notification WebSocket connected successfully.'
            })
        );
    } catch (error) {
        console.error(
            'Websocket authentication failed:',
            error.message
        );
        ws.close(
            1008,
            'authentication failed'
        );

        return;
    }

    ws.on('close', () => {

        if (ws.userId) {

            // Only remove this connection if it is
            // still the active connection for this user
            if (
                connectedUsers.get(ws.userId) === ws
            ) {

                connectedUsers.delete(ws.userId);
            }


            console.log(
                `User ${ws.userId} disconnected from notifications`
            );
        }

    });
    ws.on('error', (error) => {
        console.error(
            `WebSocket error for user ${ws.userId}:`,
            error
        );
    });
});

export const sendNotification = (
    userId,
    notification
) => {
    const userSocket = connectedUsers.get(
        userId.toString()
    );

    //user is not currently connected
    if (!userSocket) {
        return false;
    }

    // Socket is not open
    if (
        userSocket.readyState !== WebSocket.OPEN
    ) {
        return false;
    }


    userSocket.send(
        JSON.stringify({
            type: 'notification',
            data: notification
        })
    );


    return true;
}

app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(logger());
app.use(
    cookieParser({
        httpOnly: true,
        secure: config.environment === 'production',
        sameSite: 'strict',
        maxAge: getSecondsFromNow(config.jwt.expiration)
    })
)

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'server is running'
    });
})


app.use('/api/auth', authRouter);
app.use('/api/propertyProvider', propertyProviderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/listings', listingRouter);
app.use('/api/favourites', favouritesRouter);
app.use('/api/listingComment', listingCommentRouter);
app.use('/api/listingCommentLike', listingCommentLikeRouter);
app.use('/api/listingCommentReply', listingCommentReplyRouter);
app.use('/api/listingCommentReplyLike', listingCommentReplyLikeRouter);
app.use('/api/search', searchRouter);
app.use('/api/messages', messageRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/listingView', incrementListingViewsRouter);

app.use("/api/nin-verification", ninVerificationRouter);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//app.use(Sentry.middleware.error);
app.use(
  express.json({
    strict: true,
    verify: (req, res, buf) => {
      if (!buf.length) {
        req.body = {};
      }
    },
  })
);


app.use((req, res, next) => {
    next(new NotFoundError(`the requested route ${req.originalUrl} does not exist on this server`));
});


app.use((req, res, next) => {
    next(new NotFoundError(`the requested route ${req.originalUrl} does  not exist on this server`));
});
app.use(errorMiddleware);

export {app, server};