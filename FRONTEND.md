# UZLaunch — Frontend/Backend Separation Plan

## Repo structure

```
uzlaunch/                          # existing Spring Boot root — unchanged
├── src/                           # backend source
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── railway.toml                   # backend Railway config (watchPatterns: src/**, pom.xml, Dockerfile)
├── docs/
│   └── adr-001-api-contract.md   # API contract — read this
├── frontend/                      # NEW — frontend lives here
│   ├── railway.toml               # frontend Railway config (watchPatterns: frontend/**)
│   └── ...                        # frontend collab owns this directory
└── README.md
```

Backend dev: everything outside `frontend/`.  
Frontend dev: everything inside `frontend/`.

---

## Communication

Frontend calls backend via REST API. No shared code, no imports across boundary.

```
uzlaunch.uz  (frontend)  →  api.uzlaunch.uz  (backend)
```

---

## Auth

Backend issues **JWT tokens** on login/register.  
Frontend sends `Authorization: Bearer <token>` on every authenticated request.

---

## API base

All endpoints: `https://api.uzlaunch.uz/api/v1/...`

### Auth
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/register` | No |
| GET | `/api/v1/auth/verify-email?token=` | No |
| POST | `/api/v1/auth/login` | No |
| POST | `/api/v1/auth/logout` | Yes |
| GET | `/api/v1/auth/me` | Yes |

### Projects
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/projects` | Yes |
| POST | `/api/v1/projects` | Yes |
| GET | `/api/v1/projects/{id}` | Yes |
| PUT | `/api/v1/projects/{id}` | Yes |
| DELETE | `/api/v1/projects/{id}` | Yes |
| GET | `/api/v1/projects/{id}/export` | Yes (PAID) |
| GET | `/api/v1/projects/{id}/stats` | Yes |

### Subscribers
| Method | Path | Auth |
|--------|------|------|
| DELETE | `/api/v1/projects/{id}/subscribers/{subId}` | Yes |
| POST | `/api/v1/projects/{id}/subscribers/{subId}/resend` | Yes |

### Public (no auth)
| Method | Path |
|--------|------|
| GET | `/api/v1/public/{slug}` |
| POST | `/api/v1/public/{slug}/subscribe` |
| GET | `/api/v1/public/{slug}/confirm?token=` |
| GET | `/api/v1/public/unsubscribe?token=` |
| GET | `/api/v1/public/{slug}/sse` — countdown (text/event-stream) |

### Admin
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/admin/users` | `X-Admin-Secret` header |
| POST | `/api/v1/admin/users/{id}/upgrade` | `X-Admin-Secret` header |
| POST | `/api/v1/admin/users/{id}/downgrade` | `X-Admin-Secret` header |
| POST | `/api/v1/admin/users/{id}/ban` | `X-Admin-Secret` header |
| POST | `/api/v1/admin/users/{id}/unban` | `X-Admin-Secret` header |

---

## Response shape

See [docs/adr-001-api-contract.md](docs/adr-001-api-contract.md) for the full agreed contract — request/response shapes, HTTP status codes, error codes, pagination, auth, date format, edge cases.

---

## Railway deployment

| Service | Repo | Root dir | Config file | Domain |
|---------|------|----------|-------------|--------|
| Backend (existing) | `uzlaunch` | `/` | `railway.toml` | `api.uzlaunch.uz` |
| Frontend (new) | `uzlaunch` | `/frontend` | `frontend/railway.toml` | `uzlaunch.uz` |

Same repo, two Railway services. Each service has its own `railway.toml` — deploys only when its own directory changes.

**Setting config file path in Railway dashboard:**  
Service → Settings → Source → Config File Path → set to `frontend/railway.toml` for the frontend service.

`frontend/railway.toml` is already configured:
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
watchPatterns = ["frontend/**"]
```