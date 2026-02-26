// HEADER: Centralized error middleware for consistent API error responses.
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // `next` is required by Express error-handler signature even when unused.
  void next;

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(`Request failed: ${req.method} ${req.originalUrl} -> ${statusCode}`, err);

  return res.status(statusCode).json({
    success: false,
    message,
    details: err.details || null
  });
}

module.exports = errorHandler;

/*
BOTTOM EXPLANATION
- Responsibility: Converts thrown errors into predictable JSON responses and logs technical details.
- Key syntax: Express error middleware has four params `(err, req, res, next)`.
- Common mistakes: Throwing raw errors without centralized handling creates inconsistent API output.
*/
