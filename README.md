# Movie Info & Ratings Backend (Express + MongoDB)

Backend project for **movie search + favorites** with secure authentication.

This project matches common backend rubric requirements:
- Node.js + Express server
- Modular structure (routes, controllers, models, middleware, config, services)
- MongoDB + Mongoose schemas
- JWT authentication + protected routes
- bcrypt password hashing
- Validation + global error handler
- Optional External API integration (TMDB / OMDb / Ghibli)

---

## 1) Setup & Installation

### Requirements
- Node.js 18+ (recommended)
- MongoDB running locally OR MongoDB Atlas connection string

### Install
```bash
npm install
cp .env.example .env
```

### Run
```bash
npm run dev
# or
npm start
```

Server runs on: `http://localhost:3000`

---

## 2) Environment Variables

Create `.env` based on `.env.example`:

Required:
- `MONGODB_URI`
- `JWT_SECRET`

Optional (for external API search):
- `TMDB_READ_TOKEN` (TMDB Read Access Token)
- `OMDB_API_KEY` (OMDb API Key)

If TMDB/OMDb keys are not set, the external search still works via the public Ghibli API.

---

## 3) Database Models (Collections)

### User (required)
- `username` (string)
- `email` (string, unique)
- `passwordHash` (string)

### Favorite (private user resource)
- `user` (ObjectId -> User)
- Either local movie:
  - `movieId` (ObjectId -> Movie)
- Or external movie:
  - `provider` ("tmdb" | "omdb" | "ghibli")
  - `externalId` (string)
- Cached display fields:
  - `title`, `year`, `posterUrl`
- `note` (optional)

### Movie (optional local catalog)
- `title`, `year`, `genres`, `description`, `posterUrl`

---

## 4) API Documentation

### Auth Routes (PUBLIC)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user (bcrypt hashed password) |
| POST | `/api/auth/login` | Public | Login, returns JWT |

**Register body**
```json
{ "email":"test@mail.com", "password":"123456", "username":"Dias" }
```

**Login body**
```json
{ "email":"test@mail.com", "password":"123456" }
```

---

### User Routes (PRIVATE)

> Requires header: `Authorization: Bearer <JWT>`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Private | Get logged-in user profile |
| PUT | `/api/users/profile` | Private | Update user profile |

---

### Second Resource Routes (PRIVATE) — Favorites CRUD

> Favorites are the required “second resource” owned by the user.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/favorites` | Private | Create a new favorite |
| GET | `/api/favorites` | Private | Get all user favorites |
| GET | `/api/favorites/:id` | Private | Get one favorite |
| PUT | `/api/favorites/:id` | Private | Update favorite (note/cached fields) |
| DELETE | `/api/favorites/:id` | Private | Delete favorite |

**Create favorite (local movie)**
```json
{ "movieId":"<MongoMovieId>", "note":"watch later" }
```

**Create favorite (external movie)**
```json
{
  "provider":"tmdb",
  "externalId":"157336",
  "title":"Interstellar",
  "year":2014,
  "posterUrl":"https://....",
  "note":"top sci-fi"
}
```

---

### External API Integration (OPTIONAL/RECOMMENDED)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/external/movies/search?q=...` | Public | Search movies using external APIs (TMDB/OMDb/Ghibli) |

---

## 5) Notes for Deployment (Render/Railway/Replit)

- Add all environment variables in the hosting dashboard:
  - `MONGODB_URI`, `JWT_SECRET`, optionally `TMDB_READ_TOKEN`, `OMDB_API_KEY`
- Ensure your deployed URL works:
  - `GET /` should return `{ ok: true, ... }`

---

## 6) Quick Test (curl)

1) Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"123456","username":"Dias"}'
```

2) Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"123456"}'
```

3) External search:
```bash
curl "http://localhost:3000/api/external/movies/search?q=interstellar"
```

4) Favorites (replace TOKEN):
```bash
curl -X GET http://localhost:3000/api/favorites \
  -H "Authorization: Bearer <TOKEN>"
```
