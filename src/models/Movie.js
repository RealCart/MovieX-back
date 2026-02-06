const mongoose = require("mongoose");

/**
 * Optional local movie catalog (you can keep this empty and rely on external APIs).
 * This model exists to satisfy the "at least two collections" requirement and allow local movies if needed.
 */
const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    year: { type: Number, min: 1888, max: 2100 },
    genres: [{ type: String, trim: true }],
    description: { type: String, default: "" },
    posterUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

movieSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Movie", movieSchema);
