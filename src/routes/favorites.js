const express = require("express");
const { body, validationResult } = require("express-validator");
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const Movie = require("../models/Movie");

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites.movieId");
    if (!user) return res.status(404).json({ error: "User not found" });

    const favorites = user.favorites.map((f) => {
      if (f.movieId && typeof f.movieId === "object") {
        return {
          type: "local",
          movieId: f.movieId._id,
          title: f.movieId.title,
          year: f.movieId.year,
          posterUrl: f.movieId.posterUrl,
          provider: null,
          externalId: null
        };
      }
      return {
        type: "external",
        movieId: null,
        title: f.title,
        year: f.year,
        posterUrl: f.posterUrl,
        provider: f.provider,
        externalId: f.externalId
      };
    });

    res.json({ favorites });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/local",
  auth,
  body("movieId").isMongoId(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const movie = await Movie.findById(req.body.movieId);
      if (!movie) return res.status(404).json({ error: "Movie not found" });

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const exists = user.favorites.some((f) => f.movieId?.toString() === movie._id.toString());
      if (exists) return res.status(409).json({ error: "Already in favorites" });

      user.favorites.push({
        movieId: movie._id,
        title: movie.title,
        year: movie.year || null,
        posterUrl: movie.posterUrl || ""
      });

      await user.save();
      res.status(201).json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/external",
  auth,
  body("provider").isIn(["tmdb", "omdb", "ghibli"]),
  body("externalId").isString().isLength({ min: 1, max: 60 }),
  body("title").isString().isLength({ min: 1, max: 200 }),
  body("year").optional().isInt({ min: 1800, max: 2100 }),
  body("posterUrl").optional().isString().isLength({ max: 500 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { provider, externalId, title, year, posterUrl } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const exists = user.favorites.some((f) => f.provider === provider && f.externalId === externalId);
      if (exists) return res.status(409).json({ error: "Already in favorites" });

      user.favorites.push({
        provider,
        externalId,
        title,
        year: year ?? null,
        posterUrl: posterUrl ?? ""
      });

      await user.save();
      res.status(201).json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/",
  auth,
  body("movieId").optional().isMongoId(),
  body("provider").optional().isIn(["tmdb", "omdb", "ghibli"]),
  body("externalId").optional().isString().isLength({ min: 1, max: 60 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { movieId, provider, externalId } = req.body;

      if (!movieId && !(provider && externalId)) {
        return res.status(400).json({ error: "Provide movieId OR (provider + externalId)" });
      }

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const before = user.favorites.length;

      user.favorites = user.favorites.filter((f) => {
        if (movieId) return f.movieId?.toString() !== movieId;
        return !(f.provider === provider && f.externalId === externalId);
      });

      if (user.favorites.length === before) return res.status(404).json({ error: "Not found" });

      await user.save();
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
