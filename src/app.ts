import path from 'path';
import { fileURLToPath } from 'url';
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { StatusCodes } from 'http-status-codes';
import { env } from './config/env.config';
import routes from './routes';
import { errorConverter, errorHandler } from './middlewares/error.middleware';
import { NotFoundError } from './utils/api-error';
import { swaggerSpec } from './docs/swagger/swagger.config';
import { generalRateLimiter } from './middlewares/rateLimit.middleware';
import { sanitize } from './middlewares/sanitize.middleware';

const app: Express = express();

// Trust proxy for rate limiting (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Set security HTTP headers
app.use(helmet());

// Logging middleware
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'FortifyAuth API is healthy and operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

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

// Serve static frontend assets in production
if (env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // When bundled by esbuild into dist/server.js, __dirname is dist.
  // The frontend assets are in dist/client.
  const publicPath = path.resolve(__dirname, 'client');

  // Serve static files (js, css, images, etc.) from dist/client
  app.use(express.static(publicPath));

  // SPA fallback for all non-API routes
  // This MUST be registered before the 404 handler
  app.get('*', (req, res, next) => {
    // If the request is for an API route or health check that wasn't handled,
    // let it fall through to the 404 handler.
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }

    // For all other routes (/, /login, /docs, etc.), serve the React app
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

// Send back a 404 error for any unknown api request
// In production, this will only be reached for unhandled /api/* or /health routes
app.use((req, res, next) => {
  next(new NotFoundError(`Not found - ${req.originalUrl}`));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

export default app;
