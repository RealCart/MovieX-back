require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const favoriteRoutes = require("./src/routes/favorite.routes");
const externalRoutes = require("./src/routes/external.routes");
const { notFound, errorHandler } = require("./src/middleware/error.middleware");

const app = express();

// Core middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => res.json({ ok: true, service: "movie-info-ratings-backend" }));

// Routes
app.use("/api/auth", authRoutes);        // public
app.use("/api/users", userRoutes);       // private
app.use("/api/favorites", favoriteRoutes); // private (CRUD resource)
app.use("/api/external", externalRoutes);  // optional external integration

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
