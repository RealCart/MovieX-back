const mongoose = require("mongoose");

/**
 * Favorites are a private user-owned resource (CRUD).
 * A favorite can reference:
 * - Local movie: movieId
 * - External movie: provider + externalId
 */
const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Local movie reference (optional)
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", default: null },

    // External reference (optional)
    provider: { type: String, enum: ["tmdb", "omdb", "ghibli"], default: null },
    externalId: { type: String, default: null },

    // Cached fields for UI
    title: { type: String, required: true, trim: true },
    year: { type: Number, default: null, min: 1800, max: 2100 },
    posterUrl: { type: String, default: "" },

    note: { type: String, default: "", maxlength: 500 }
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, movieId: 1 }, { unique: true, partialFilterExpression: { movieId: { $type: "objectId" } } });
favoriteSchema.index({ user: 1, provider: 1, externalId: 1 }, { unique: true, partialFilterExpression: { provider: { $type: "string" }, externalId: { $type: "string" } } });

module.exports = mongoose.model("Favorite", favoriteSchema);
