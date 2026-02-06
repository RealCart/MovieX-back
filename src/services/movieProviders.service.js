function normalizeMovie({ provider, id, title, year, posterUrl, overview }) {
  return {
    provider,
    externalId: String(id),
    title: title || "",
    year: year ? Number(year) : null,
    posterUrl: posterUrl || "",
    overview: overview || ""
  };
}

async function searchTMDB(query) {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) return [];

  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" }
  });

  if (!r.ok) return [];
  const data = await r.json();

  return (data.results || []).slice(0, 10).map((m) =>
    normalizeMovie({
      provider: "tmdb",
      id: m.id,
      title: m.title,
      year: (m.release_date || "").slice(0, 4),
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
      overview: m.overview
    })
  );
}

async function searchOMDb(query) {
  const key = process.env.OMDB_API_KEY;
  if (!key) return [];

  const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&s=${encodeURIComponent(query)}&type=movie&page=1`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const data = await r.json();

  if (data.Response !== "True") return [];
  return (data.Search || []).slice(0, 10).map((m) =>
    normalizeMovie({
      provider: "omdb",
      id: m.imdbID,
      title: m.Title,
      year: m.Year,
      posterUrl: m.Poster && m.Poster !== "N/A" ? m.Poster : "",
      overview: ""
    })
  );
}

async function searchGhibli(query) {
  const r = await fetch("https://ghibliapi.vercel.app/films");
  if (!r.ok) return [];
  const data = await r.json();

  const q = query.trim().toLowerCase();
  return (data || [])
    .filter((f) => (f.title || "").toLowerCase().includes(q))
    .slice(0, 10)
    .map((f) =>
      normalizeMovie({
        provider: "ghibli",
        id: f.id,
        title: f.title,
        year: f.release_date,
        posterUrl: f.image || "",
        overview: f.description || ""
      })
    );
}

async function searchAllProviders(query) {
  const results = await Promise.allSettled([searchTMDB(query), searchOMDb(query), searchGhibli(query)]);
  const merged = results.flatMap((p) => (p.status === "fulfilled" ? p.value : []));

  const seen = new Set();
  const out = [];
  for (const m of merged) {
    const key = `${m.title.toLowerCase()}|${m.year || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out.slice(0, 20);
}

module.exports = { searchAllProviders };
