const Favorite = require("../models/Favorite");
const Movie = require("../models/Movie");

async function createFavorite(req, res, next) {
  try {
    const { movieId, provider, externalId, title, year, posterUrl, note } = req.body;

    let payload;

    if (movieId) {
      const movie = await Movie.findById(movieId);
      if (!movie) return res.status(404).json({ error: "Movie not found" });

      payload = {
        user: req.user.id,
        movieId: movie._id,
        provider: null,
        externalId: null,
        title: movie.title,
        year: movie.year ?? null,
        posterUrl: movie.posterUrl || "",
        note: note || ""
      };
    } else {
      payload = {
        user: req.user.id,
        movieId: null,
        provider,
        externalId,
        title,
        year: year ?? null,
        posterUrl: posterUrl ?? "",
        note: note || ""
      };
    }

    const created = await Favorite.create(payload);
    res.status(201).json({ favorite: created });
  } catch (e) {
    next(e);
  }
}

async function getFavorites(req, res, next) {
  try {
    const items = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ favorites: items });
  } catch (e) {
    next(e);
  }
}

async function getFavoriteById(req, res, next) {
  try {
    const item = await Favorite.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ error: "Favorite not found" });
    res.json({ favorite: item });
  } catch (e) {
    next(e);
  }
}

async function updateFavorite(req, res, next) {
  try {
    const updates = {};
    if (typeof req.body.note === "string") updates.note = req.body.note;
    if (typeof req.body.title === "string") updates.title = req.body.title;
    if (typeof req.body.posterUrl === "string") updates.posterUrl = req.body.posterUrl;
    if (req.body.year !== undefined) updates.year = req.body.year;

    const item = await Favorite.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!item) return res.status(404).json({ error: "Favorite not found" });
    res.json({ favorite: item });
  } catch (e) {
    next(e);
  }
}

async function deleteFavorite(req, res, next) {
  try {
    const deleted = await Favorite.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Favorite not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { createFavorite, getFavorites, getFavoriteById, updateFavorite, deleteFavorite };
