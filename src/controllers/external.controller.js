const { searchAllProviders } = require("../services/movieProviders.service");

async function searchExternalMovies(req, res, next) {
  try {
    const results = await searchAllProviders(req.query.q);
    res.json({ query: req.query.q, results });
  } catch (e) {
    next(e);
  }
}

module.exports = { searchExternalMovies };
