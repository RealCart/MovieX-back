const mongoose = require("mongoose");

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
