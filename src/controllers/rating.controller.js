const Rating = require("../models/Rating");
const Movie = require("../models/Movie");

async function upsertRating(req, res, next) {
  try {
    const { movieId, provider, externalId, title, year, posterUrl, score, comment } = req.body;

    if (movieId) {
      const movie = await Movie.findById(movieId);
      if (!movie) return res.status(404).json({ error: "Movie not found" });

      const rating = await Rating.findOneAndUpdate(
        { user: req.user.id, movieId: movie._id },
        {
          $set: {
            provider: null,
            externalId: null,
            title: movie.title,
            year: movie.year ?? null,
            posterUrl: movie.posterUrl || "",
            score,
            comment: comment || ""
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return res.status(201).json({ rating });
    }

    // External movie rating
    const rating = await Rating.findOneAndUpdate(
      { user: req.user.id, provider, externalId },
      {
        $set: {
          movieId: null,
          provider,
          externalId,
          title,
          year: year ?? null,
          posterUrl: posterUrl ?? "",
          score,
          comment: comment || ""
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ rating });
  } catch (e) {
    next(e);
  }
}

async function getMyRatings(req, res, next) {
  try {
    const items = await Rating.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json({ ratings: items });
  } catch (e) {
    next(e);
  }
}

async function getRatingById(req, res, next) {
  try {
    const item = await Rating.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ error: "Rating not found" });
    res.json({ rating: item });
  } catch (e) {
    next(e);
  }
}

async function updateRating(req, res, next) {
  try {
    const updates = {};
    if (req.body.score !== undefined) updates.score = req.body.score;
    if (typeof req.body.comment === "string") updates.comment = req.body.comment;

    if (typeof req.body.title === "string") updates.title = req.body.title;
    if (req.body.year !== undefined) updates.year = req.body.year;
    if (typeof req.body.posterUrl === "string") updates.posterUrl = req.body.posterUrl;

    const item = await Rating.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!item) return res.status(404).json({ error: "Rating not found" });
    res.json({ rating: item });
  } catch (e) {
    next(e);
  }
}

async function deleteRating(req, res, next) {
  try {
    const deleted = await Rating.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Rating not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { upsertRating, getMyRatings, getRatingById, updateRating, deleteRating };