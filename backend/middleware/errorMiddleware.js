/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Central Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Server Error]', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);

  // Handle specific database errors gracefully
  let userMessage = err.message || 'An unexpected internal server error occurred.';
  if (err.code === 'ER_DUP_ENTRY') {
    userMessage = 'A record with this unique information already exists.';
  } else if (err.code === 'ECONNREFUSED') {
    userMessage = 'Could not connect to MySQL Server. Please ensure MySQL service is running on your computer.';
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    userMessage = 'MySQL Access Denied: The password or username in backend/.env does not match your MySQL Server credentials. Please update DB_PASSWORD in backend/.env.';
  }

  res.status(statusCode).json({
    success: false,
    message: userMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
