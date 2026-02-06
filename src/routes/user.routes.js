const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth.middleware");
const { getProfile, updateProfile } = require("../controllers/user.controller");

const router = express.Router();

router.get("/profile", requireAuth, getProfile);

router.put(
  "/profile",
  requireAuth,
  body("username").optional().isString().isLength({ max: 50 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return updateProfile(req, res, next);
  }
);

module.exports = router;
