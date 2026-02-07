require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const favoriteRoutes = require("./src/routes/favorite.routes");
const externalRoutes = require("./src/routes/external.routes");
const ratingRoutes = require("./src/routes/rating.routes");
const { notFound, errorHandler } = require("./src/middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ ok: true, service: "movie-info-ratings-backend" }));

app.use("/api/auth", authRoutes);       
app.use("/api/users", userRoutes);      
app.use("/api/favorites", favoriteRoutes); 
app.use("/api/external", externalRoutes);  
app.use("/api/ratings", ratingRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Listening on", PORT);
});

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
