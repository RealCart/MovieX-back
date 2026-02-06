const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  upsertRating,
  getMyRatings,
  getRatingById,
  updateRating,
  deleteRating
} = require("../controllers/rating.controller");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  body("movieId").optional().isMongoId(),
  body("provider").optional().isIn(["tmdb", "omdb", "ghibli"]),
  body("externalId").optional().isString().isLength({ min: 1, max: 60 }),
  body("title").optional().isString().isLength({ min: 1, max: 200 }),
  body("year").optional().isInt({ min: 1800, max: 2100 }),
  body("posterUrl").optional().isString().isLength({ max: 500 }),
  body("score").isInt({ min: 1, max: 10 }),
  body("comment").optional().isString().isLength({ max: 2000 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const hasLocal = !!req.body.movieId;
    const hasExternal = !!(req.body.provider && req.body.externalId && req.body.title);

    if (!hasLocal && !hasExternal) {
      return res.status(400).json({
        error: "Provide either {movieId} OR {provider, externalId, title} for external rating"
      });
    }

    return upsertRating(req, res, next);
  }
);

router.get("/", requireAuth, getMyRatings);

router.get(
  "/:id",
  requireAuth,
  param("id").isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return getRatingById(req, res, next);
  }
);

router.put(
  "/:id",
  requireAuth,
  param("id").isMongoId(),
  body("score").optional().isInt({ min: 1, max: 10 }),
  body("comment").optional().isString().isLength({ max: 2000 }),
  body("title").optional().isString().isLength({ min: 1, max: 200 }),
  body("year").optional().isInt({ min: 1800, max: 2100 }),
  body("posterUrl").optional().isString().isLength({ max: 500 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return updateRating(req, res, next);
  }
);

router.delete(
  "/:id",
  requireAuth,
  param("id").isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return deleteRating(req, res, next);
  }
);

module.exports = router;