const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    review: { type: String, default: "", maxlength: 2000 }
  },
  { timestamps: true }
);

ratingSchema.index({ movie: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
