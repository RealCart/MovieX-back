const express = require("express");
const { query, validationResult } = require("express-validator");
const { searchAllProviders } = require("../services/movieProviders");

const router = express.Router();

router.get(
  "/movies/search",
  query("q").isString().isLength({ min: 1, max: 80 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const results = await searchAllProviders(req.query.q);
      res.json({ query: req.query.q, results });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
