const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", default: null },
    provider: { type: String, enum: ["tmdb", "omdb", "ghibli"], default: null },
    externalId: { type: String, default: null },
    title: { type: String, required: true, trim: true },
    year: { type: Number, default: null, min: 1800, max: 2100 },
    posterUrl: { type: String, default: "" },

    score: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, default: "", maxlength: 2000 }
  },
  { timestamps: true }
);

ratingSchema.index(
  { user: 1, movieId: 1 },
  { unique: true, partialFilterExpression: { movieId: { $type: "objectId" } } }
);

ratingSchema.index(
  { user: 1, provider: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: { provider: { $type: "string" }, externalId: { $type: "string" } }
  }
);

module.exports = mongoose.model("Rating", ratingSchema);