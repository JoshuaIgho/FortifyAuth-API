import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.config';
import routes from './routes';
import { errorConverter, errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './utils/api-error';
import { swaggerSpec } from './docs/swagger/swagger.config';
import { generalRateLimiter } from './middlewares/rateLimit.middleware';
import { sanitize } from './middlewares/sanitize.middleware';

const app: Express = express();

// Set security HTTP headers
app.use(helmet());

// Logging middleware
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(generalRateLimiter);

// Input sanitization
app.use(sanitize);

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Enable cors
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/', routes);

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new NotFoundError('Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

export default app;
