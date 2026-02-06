const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  createFavorite,
  getFavorites,
  getFavoriteById,
  updateFavorite,
  deleteFavorite
} = require("../controllers/favorite.controller");

const router = express.Router();

/**
 * Private resource CRUD:
 * POST   /api/favorites        create favorite
 * GET    /api/favorites        get all favorites for logged-in user
 * GET    /api/favorites/:id    get one favorite
 * PUT    /api/favorites/:id    update favorite (note/cached fields)
 * DELETE /api/favorites/:id    delete favorite
 */

router.post(
  "/",
  requireAuth,
  body("movieId").optional().isMongoId(),
  body("provider").optional().isIn(["tmdb", "omdb", "ghibli"]),
  body("externalId").optional().isString().isLength({ min: 1, max: 60 }),
  body("title").optional().isString().isLength({ min: 1, max: 200 }),
  body("year").optional().isInt({ min: 1800, max: 2100 }),
  body("posterUrl").optional().isString().isLength({ max: 500 }),
  body("note").optional().isString().isLength({ max: 500 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const hasLocal = !!req.body.movieId;
    const hasExternal = !!(req.body.provider && req.body.externalId && req.body.title);

    if (!hasLocal && !hasExternal) {
      return res.status(400).json({
        error: "Provide either {movieId} OR {provider, externalId, title} for external favorite"
      });
    }
    return createFavorite(req, res, next);
  }
);

router.get("/", requireAuth, getFavorites);

router.get(
  "/:id",
  requireAuth,
  param("id").isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return getFavoriteById(req, res, next);
  }
);

router.put(
  "/:id",
  requireAuth,
  param("id").isMongoId(),
  body("title").optional().isString().isLength({ min: 1, max: 200 }),
  body("year").optional().isInt({ min: 1800, max: 2100 }),
  body("posterUrl").optional().isString().isLength({ max: 500 }),
  body("note").optional().isString().isLength({ max: 500 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return updateFavorite(req, res, next);
  }
);

router.delete(
  "/:id",
  requireAuth,
  param("id").isMongoId(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return deleteFavorite(req, res, next);
  }
);

module.exports = router;
