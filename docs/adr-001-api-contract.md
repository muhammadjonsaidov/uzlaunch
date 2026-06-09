# ADR-001: API Request/Response Contract

**Status:** Accepted  
**Date:** 2026-06-09

---

## Context

Frontend and backend split into separate apps communicating via REST API. Need agreed shapes for all requests and responses so both sides can develop independently without surprises.

---

## Decisions

### 1. Content type

All requests and responses: `application/json`.  
Exception: CSV export — `text/csv`.  
SSE countdown — `text/event-stream`.

---

### 2. HTTP status codes

| Code | When |
|------|------|
| `200 OK` | Success with body |
| `201 Created` | New resource created |
| `204 No Content` | Success, no body (delete, logout) |
| `400 Bad Request` | Validation error, bad input |
| `401 Unauthorized` | Not authenticated / token expired / email not verified |
| `403 Forbidden` | Authenticated but no permission (plan gate, wrong owner, banned) |
| `404 Not Found` | Resource not found, or confirm token expired/invalid |
| `409 Conflict` | Duplicate (email already registered, already subscribed) |
| `429 Too Many Requests` | Rate limit hit |
| `500 Internal Server Error` | Unhandled server error |

---

### 3. Success response

Return the resource directly. No envelope wrapper.

**Single object:**
```json
{
  "id": 1,
  "name": "MyStartup",
  "slug": "mystartup",
  "tagline": "Build fast",
  "subscriberCount": 42
}
```

**List (non-paginated):**
```json
[
  { "id": 1 },
  { "id": 2 }
]
```

Empty list: `[]` — never `null`.

**Paginated list:**
```json
{
  "content": [ { "id": 1 } ],
  "page": 0,
  "size": 25,
  "totalPages": 4,
  "totalElements": 98
}
```

Empty paginated: `{ "content": [], "page": 0, "size": 25, "totalPages": 0, "totalElements": 0 }` — never `null`.

**Message-only (subscribe, resend, verify email):**
```json
{ "message": "Confirmation email sent" }
```

**No body:** HTTP `204 No Content`, empty body.

---

### 4. Error response

All errors return same shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

`error` — shown to user or logged.  
`code` — frontend uses for specific handling. Optional — omit when no special handling needed.

**Error codes (defined):**

| Code | Status | Meaning |
|------|--------|---------|
| `TOKEN_EXPIRED` | 401 | JWT expired — frontend clears token, redirect `/login` |
| `EMAIL_NOT_VERIFIED` | 401 | Login attempt before email verification |
| `USER_BANNED` | 403 | Banned user tries to login or make request |
| `PLAN_UPGRADE_REQUIRED` | 403 | Free plan hits paid-only feature |
| `SUBSCRIBER_LIMIT_REACHED` | 403 | Free plan: project has 100 subscribers, new subscribe rejected |
| `ALREADY_CONFIRMED` | 409 | Confirm token used twice |
| `ALREADY_SUBSCRIBED` | 409 | Email already on this waitlist (confirmed or pending) |

**Examples:**
```json
{ "error": "Tagline is required" }

{ "error": "Token expired", "code": "TOKEN_EXPIRED" }

{ "error": "Please verify your email before logging in", "code": "EMAIL_NOT_VERIFIED" }

{ "error": "Your account has been banned", "code": "USER_BANNED" }

{ "error": "CSV export requires Pro plan", "code": "PLAN_UPGRADE_REQUIRED" }

{ "error": "This waitlist is full (100 subscriber limit)", "code": "SUBSCRIBER_LIMIT_REACHED" }

{ "error": "This email is already on the waitlist", "code": "ALREADY_SUBSCRIBED" }

{ "error": "Project not found" }

{ "error": "Too many requests, try again later" }
```

**Validation error (multiple fields):**
```json
{
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "tagline": "Max 200 characters"
  }
}
```

**Rate limit — include `Retry-After` header:**
```
HTTP 429
Retry-After: 3600
{ "error": "Too many requests, try again later" }
```

---

### 5. Request body — create/update

Field names: `camelCase`.  
Optional fields: omit or send `null`.

**Register:**
```json
{ "name": "Jasur", "email": "jasur@example.com", "password": "secret123" }
```

**Login:**
```json
{ "email": "jasur@example.com", "password": "secret123" }
```

**Login response:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Jasur",
    "email": "jasur@example.com",
    "plan": "FREE",
    "emailVerified": true
  }
}
```

**Create project:**
```json
{
  "name": "MyStartup",
  "tagline": "Build fast",
  "description": "Optional description",
  "launchAt": "2026-09-01T10:00:00Z"
}
```

**Update project (PAID extras optional):**
```json
{
  "name": "MyStartup",
  "tagline": "Build fast",
  "description": null,
  "launchAt": "2026-09-01T10:00:00Z",
  "launchEmailSubject": null,
  "launchEmailBody": null,
  "confirmEmailSubject": null,
  "confirmEmailBody": null
}
```

**Subscribe (public):**
```json
{ "email": "user@example.com", "name": "Optional name" }
```

---

### 6. Pagination query params

```
GET /api/v1/projects/{id}?page=0&size=25&q=search
```

| Param | Default | Max | Notes |
|-------|---------|-----|-------|
| `page` | `0` | — | zero-indexed |
| `size` | `25` | `100` | clamped server-side if exceeded |
| `q` | `""` | — | empty = no filter |

---

### 7. Auth

**User endpoints:**  
`Authorization: Bearer <jwt_token>`

**Admin endpoints:**  
`X-Admin-Secret: <ADMIN_SECRET>`

Token lifetime: **7 days**. No refresh token — re-login on expiry.  
On `401` + `code: TOKEN_EXPIRED` — frontend clears token, redirects to `/login`.  
On `401` + `code: EMAIL_NOT_VERIFIED` — frontend shows "check your email" message, no redirect.

---

### 8. Date/time format

All timestamps: **ISO 8601**, UTC.

```
"2026-06-09T14:30:00Z"
"2026-09-01T10:00:00Z"
```

`launchAt: null` — no launch date set.  
`confirmedAt: null` — subscriber not yet confirmed.

---

### 9. Field naming

- JSON fields: `camelCase`
- URL path params: numeric IDs or `slug` (alphanumeric + hyphens)
- Query params: `camelCase`

---

### 10. SSE — countdown

`GET /api/v1/public/{slug}/sse`

Streams seconds remaining until `launchAt`. Event format:

```
data: 86400\n\n
data: 86399\n\n
```

If project has no `launchAt` — server closes stream immediately with no events.  
If `launchAt` already passed — server sends `data: 0` and closes.  
Frontend must handle `EventSource` reconnect (browser does this automatically).

---

### 11. Slug rules

Slugs are auto-generated from project name on create. Rules:
- Lowercase alphanumeric + hyphens only: `[a-z0-9-]`
- Max 100 characters
- Unique across all projects
- Not editable after create

---

### 12. Edge cases

| Scenario | Backend behavior |
|----------|-----------------|
| Confirm token used twice | `409 ALREADY_CONFIRMED` |
| Confirm token older than 7 days | Subscriber deleted, `404` returned |
| Subscribe to full Free waitlist (100 subs) | `403 SUBSCRIBER_LIMIT_REACHED` |
| Subscribe with already-registered email (same project) | `409 ALREADY_SUBSCRIBED` |
| Resend confirmation to already-confirmed subscriber | `409 ALREADY_CONFIRMED` |
| Unsubscribe with invalid/unknown token | `404` |
| Access other user's project | `404` (not leak that it exists) |
| Free user calls CSV export | `403 PLAN_UPGRADE_REQUIRED` |
| Login with unverified email | `401 EMAIL_NOT_VERIFIED` |
| Login with banned account | `403 USER_BANNED` |
| SSE on project with no launchAt | Stream closes immediately, no events |
| `size` param > 100 | Clamped to 100 server-side, no error |
| `page` beyond totalPages | Returns empty `content: []`, no error |
| Delete project with subscribers | Cascade deletes all subscribers |

---

## Summary table

| Concern | Decision |
|---------|----------|
| Format | JSON (except CSV export, SSE) |
| Success wrapper | None — resource directly |
| Error shape | `{ error, code?, details? }` |
| HTTP semantics | Strict — 201/204/400/401/403/404/409/429 |
| Empty collections | `[]` or `{ content: [] }` — never `null` |
| Pagination | `{ content, page, size, totalPages, totalElements }` |
| Auth | Bearer JWT 7d (users), X-Admin-Secret (admin), no refresh |
| Dates | ISO 8601 UTC, nullable fields explicit `null` |
| Casing | camelCase fields, kebab-case/numeric URL segments |
| Slug | Auto-generated, immutable, `[a-z0-9-]` |
| Rate limit | 429 + `Retry-After` header |