import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import configuration and utilities
import { getConfig } from './config/index.js';
import { logger } from './utils/logger.js';
import { requestLogger, validateSession } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import launchRouter from './routes/launch.js';
import callbackRouter from './routes/callback.js';
import patientRouter from './routes/patient.js';
import summaryRoute from './routes/summary.js';
import dashboardRouter from './routes/dashboard.js';
import fundingRouter from './routes/funding.js';
import patientSearchRouter from './routes/patient-search.js';

// Load configuration
const config = getConfig();

// Initialize Express app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware must be configured before validateSession
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: config.environment === 'production' }
}));

app.use(validateSession);

// Configure view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Request logging middleware
app.use(requestLogger);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Register routes
app.use('/launch', launchRouter);
app.use('/callback', callbackRouter);
app.use('/patient', patientRouter);
app.use('/summary', summaryRoute);
app.use('/dashboard', dashboardRouter);
app.use('/funding', fundingRouter);
app.use('/patient-search', patientSearchRouter);

// Root route redirect
app.get('/', (req, res) => {
  logger.info('Root route accessed, redirecting to patient search');
  res.redirect('/patient-search');
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`, {
    port: PORT,
    environment: config.environment,
    fhirBase: config.fhirBase
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
