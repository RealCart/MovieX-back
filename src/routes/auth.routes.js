const express = require("express");
const { body, validationResult } = require("express-validator");
const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

/**
 * Public: POST /api/auth/register
 */
router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("username").optional().isString().isLength({ max: 50 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return register(req, res, next);
  }
);

/**
 * Public: POST /api/auth/login
 */
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return login(req, res, next);
  }
);

module.exports = router;
