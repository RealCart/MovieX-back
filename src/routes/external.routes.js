const express = require("express");
const { query, validationResult } = require("express-validator");
const { searchExternalMovies } = require("../controllers/external.controller");

const router = express.Router();

/**
 * Optional external integration:
 * GET /api/external/movies/search?q=interstellar
 */
router.get(
  "/movies/search",
  query("q").isString().isLength({ min: 1, max: 80 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return searchExternalMovies(req, res, next);
  }
);

module.exports = router;
