import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.config';
import routes from './routes';
import { errorConverter, errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './utils/api-error';

const app: Express = express();

// Set security HTTP headers
app.use(helmet());

// Logging middleware
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

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
