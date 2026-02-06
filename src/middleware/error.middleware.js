function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

function errorHandler(err, req, res, next) {
  // Handle mongoose duplicate key errors
  if (err && err.code === 11000) {
    return res.status(409).json({ error: "Duplicate key", details: err.keyValue });
  }

  const code = err?.statusCode || 500;
  const message = err?.message || "Server error";

  res.status(code).json({ error: message });
}

module.exports = { notFound, errorHandler };
