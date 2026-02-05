function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

function errorHandler(err, req, res, next) {
  const code = err.statusCode || 500;

  if (err && err.code === 11000) {
    return res.status(409).json({ error: "Duplicate key", details: err.keyValue });
  }

  res.status(code).json({ error: err.message || "Server error" });
}

module.exports = { notFound, errorHandler };
