# movie-backend (Express + MongoDB)

## Setup
1) Copy env:
- `cp .env.example .env` and fill values

2) Install:
- `npm i`

3) Run:
- `npm run dev`

## Endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/movies`
- GET  `/api/movies?q=&sort=`
- GET  `/api/movies/:id`
- PUT  `/api/ratings/movie/:movieId` (auth)
- DELETE `/api/ratings/movie/:movieId` (auth)
- GET  `/api/ratings/movie/:movieId?page=&limit=`
- GET  `/api/external/movies/search?q=...` (server делает запросы во внешние API)
- GET  `/api/favorites` (auth)
- POST `/api/favorites/local` (auth)
- POST `/api/favorites/external` (auth)
- DELETE `/api/favorites` (auth)
