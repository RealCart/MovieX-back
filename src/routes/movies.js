const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Movie = require("../models/Movie");
const Rating = require("../models/Rating");

const router = express.Router();

router.post(
  "/",
  body("title").isString().isLength({ min: 1 }),
  body("year").optional().isInt({ min: 1888, max: 2100 }),
  body("genres").optional().isArray(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const movie = await Movie.create({
        title: req.body.title,
        year: req.body.year,
        genres: req.body.genres || [],
        description: req.body.description || "",
        posterUrl: req.body.posterUrl || ""
      });

      res.status(201).json(movie);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/",
  query("q").optional().isString(),
  query("sort").optional().isIn(["new", "rating", "title"]),
  async (req, res, next) => {
    try {
      const { q, sort } = req.query;

      const filter = q ? { $text: { $search: q } } : {};
      let cursor = Movie.find(filter);

      if (q) cursor = cursor.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });

      if (sort === "new") cursor = cursor.sort({ createdAt: -1 });
      if (sort === "rating") cursor = cursor.sort({ avgRating: -1, ratingsCount: -1 });
      if (sort === "title") cursor = cursor.sort({ title: 1 });

      const movies = await cursor.limit(50);
      res.json(movies);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    const latestRatings = await Rating.find({ movie: movie._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email");

    res.json({ movie, latestRatings });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
