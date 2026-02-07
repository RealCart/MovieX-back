const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/password");

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function register(req, res, next) {
  try {
    const { email, password, username } = req.body;

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      username: username || ""
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, username: user.username }
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    return res.status(200).json({
      token,
      user: { id: user._id, email: user.email, username: user.username }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };
