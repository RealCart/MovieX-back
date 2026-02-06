const User = require("../models/User");
const Rating = require("../models/Rating");

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    const ratingsHistory = await Rating.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .select("title year posterUrl provider externalId movieId score comment updatedAt createdAt");

    res.json({ user, ratingsHistory });
  } catch (e) {
    next(e);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { username } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username: username ?? "" },
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (e) {
    next(e);
  }
}

module.exports = { getProfile, updateProfile };
