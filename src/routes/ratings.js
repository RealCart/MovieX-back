const express = require("express");
const { body, validationResult, param } = require("express-validator");
const { auth } = require("../middleware/auth");
const Rating = require("../models/Rating");
const Movie = require("../models/Movie");

const router = express.Router();

async function recalcMovieStats(movieId) {
  const agg = await Rating.aggregate([
    { $match: { movie: movieId } },
    {
      $group: {
        _id: "$movie",
        avg: { $avg: "$score" },
        count: { $sum: 1 }
      }
    }
  ]);

  const avgRating = agg[0]?.avg ?? 0;
  const ratingsCount = agg[0]?.count ?? 0;

  await Movie.findByIdAndUpdate(movieId, { avgRating, ratingsCount });
}

router.put(
  "/movie/:movieId",
  auth,
  param("movieId").isMongoId(),
  body("score").isInt({ min: 1, max: 10 }),
  body("review").optional().isString().isLength({ max: 2000 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const movieId = req.params.movieId;

      const movie = await Movie.findById(movieId);
      if (!movie) return res.status(404).json({ error: "Movie not found" });

      const rating = await Rating.findOneAndUpdate(
        { movie: movieId, user: req.user.id },
        { score: req.body.score, review: req.body.review || "" },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      await recalcMovieStats(movie._id);

      res.json(rating);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/movie/:movieId",
  auth,
  param("movieId").isMongoId(),
  async (req, res, next) => {
    try {
      const movieId = req.params.movieId;

      const deleted = await Rating.findOneAndDelete({ movie: movieId, user: req.user.id });
      if (!deleted) return res.status(404).json({ error: "Rating not found" });

      await recalcMovieStats(deleted.movie);

      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/movie/:movieId",
  param("movieId").isMongoId(),
  async (req, res, next) => {
    try {
      const movieId = req.params.movieId;
      const page = Math.max(parseInt(req.query.page || "1", 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 50);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Rating.find({ movie: movieId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("user", "name email"),
        Rating.countDocuments({ movie: movieId })
      ]);

      res.json({ page, limit, total, items });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
