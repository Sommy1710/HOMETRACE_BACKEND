//import emailRoutes from '../routes/emailRoutes.js'
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
import cookieParser  from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../docs/swagger.js';
import * as Sentry from '@sentry/node';
import { listingRouter } from './../modules/listing/listing.routes.js';



const app = express();
const server = createServer(app);
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

//app.use('/api/email', emailRoutes);
app.use('/api/auth', authRouter);
app.use('/api/propertyProvider', propertyProviderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/listings', listingRouter);

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
app.use(errorMiddleware);

export {app, server};