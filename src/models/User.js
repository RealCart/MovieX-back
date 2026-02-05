const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", default: null },
    provider: { type: String, enum: ["tmdb", "omdb", "ghibli"], default: null },
    externalId: { type: String, default: null },
    title: { type: String, default: "" },
    year: { type: Number, default: null },
    posterUrl: { type: String, default: "" }
  },
  { _id: false, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    favorites: { type: [favoriteSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
