// HEADER: Catch-all route middleware for unknown API paths.
function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = notFound;

/*
BOTTOM EXPLANATION
- Responsibility: Returns a clean 404 JSON response when no route matches the request.
- Key syntax: `req.originalUrl` keeps the full path for clear debugging.
- Common mistakes: Missing 404 middleware can return HTML or unclear default Express errors.
*/
