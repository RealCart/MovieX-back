require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectDB } = require("./src/db");

const authRoutes = require("./src/routes/auth");
const moviesRoutes = require("./src/routes/movies");
const ratingsRoutes = require("./src/routes/ratings");
const externalRoutes = require("./src/routes/externalMovies");
const favoritesRoutes = require("./src/routes/favorites");

const { notFound, errorHandler } = require("./src/middleware/error");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ ok: true, service: "movie-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/external", externalRoutes);
app.use("/api/favorites", favoritesRoutes);

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
