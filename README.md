# UZLaunch

**O'zbekistondagi startaplar uchun kutish ro'yxati va pre-launch sahifa yaratuvchi platforma.**

> Kodlashdan oldin — tekshiring. Idea bormi? Avval auditoriyangizni yig'ing.

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?style=flat-square)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square)](https://www.postgresql.org/)

---

## Loyiha haqida

**UZLaunch** — O'zbekistondagi tadbirkorlar, talabalar va startap asoschilari uchun yaratilgan platforma. Maqsad: mahsulot ishga tushirishdan oldin haqiqiy manfaatdor foydalanuvchilarni yig'ish va ideani bozorda sinab ko'rish.

**2 daqiqada** pre-launch sahifa yarating:
- `uzlaunch.uz/p/loyiha-nomi` ko'rinishida o'z havola
- Tashrif buyuruvchilar email orqali ro'yxatdan o'tadi (double opt-in)
- Asoschi abonentlar sonini real vaqtda ko'radi
- Ishga tushish kuni sanasi uchun countdown taymer

---

## Asosiy imkoniyatlar

| Imkoniyat | Tavsif |
|-----------|--------|
| Pre-launch sahifa | 5 ta maydon to'ldirib, jonli sahifa yarating |
| Shaxsiy havola | `uzlaunch.uz/p/sizning-loyiha` ko'rinishida unique URL |
| Double opt-in | Email tasdiqlash havolasi orqali ro'yxatdan o'tish |
| Token muddati | Tasdiqlanmagan abonentlar 7 kundan keyin avtomatik o'chiriladi |
| Countdown taymer | Ishga tushish sanasigacha sanash (real-time SSE) |
| Dashboard | Abonentlar ro'yxati, pagination (25/sahifa), qidiruv |
| Abonentlarni boshqarish | O'chirish, tasdiqlash emailini qayta yuborish |
| Loyihani tahrirlash | Nom, tagline, tavsif, sana, email shablonlarini yangilash |
| Statistika | Kunlik obunalar grafigi |
| Unsubscribe | Token orqali xavfsiz obunadan chiqish |
| Email verificatsiya | Yangi foydalanuvchilar emailni tasdiqlashdan keyin kirishadi |
| Bepul / Pro rejalar | Bepul: 100 tagacha abonent, 1 loyiha. Pro: cheksiz + CSV eksport + maxsus email shablonlar |
| Admin panel | Foydalanuvchilarni boshqarish, ban, Pro rejaga o'tkazish, brute-force himoyasi |
| Ishga tushish emaili | Belgilangan sana kelganda barcha abonentlarga avtomatik email |
| Maxsus email shablonlar | Pro: tasdiqlash va ishga tushirish emaillarini sozlash (Pro) |
| Responsive dizayn | Mobil qurilmalar uchun to'liq moslashtirilgan, hamburger menu |
| Dark mode | Foydalanuvchi tanlovi saqlanadi |

---

## Texnologiyalar

**Backend**
- Java 17, Spring Boot 3.2
- Spring Data JPA + Hibernate
- Spring Security (sessiya autentifikatsiya, CSRF o'chirilgan)
- Flyway (migratsiya boshqaruvi, V1–V9)
- SSE (Server-Sent Events) — countdown real-time yangilanishi

**Frontend**
- Thymeleaf (server-side shablonlar)
- Tailwind CSS (CDN) + maxsus `app.css`
- Glass UI dizayn (landing) + clean white UI (dashboard)

**Ma'lumotlar bazasi**
- H2 (ishlab chiqish), PostgreSQL 16 (ishlab chiqarish)

**Email**
- Resend API (transaksion va ommaviy emaillar)

**Deploy**
- Docker & Docker Compose

---

## Ma'lumotlar bazasi tuzilmasi

```
users
├── id (UUID, PK)
├── email (unique)
├── password_hash
├── name
├── plan (FREE | PAID)
├── email_verified (boolean, default true mavjud foydalanuvchilar uchun)
├── verification_token (UUID, emailni tasdiqlash uchun)
└── created_at

projects
├── id (PK)
├── user_id (FK → users)
├── slug (unique, masalan "my-startup")
├── name
├── tagline
├── description
├── launch_at (timestamp, ixtiyoriy)
├── launch_notified (boolean)
├── subscriber_count
├── launch_email_subject / launch_email_body  (maxsus email, Pro)
└── confirm_email_subject / confirm_email_body (maxsus email, Pro)

subscribers
├── id (PK)
├── project_id (FK → projects)
├── email
├── name
├── token (UUID, unique — tasdiqlash/chiqish uchun)
├── confirmed (boolean)
├── subscribed_at (ro'yxatdan o'tgan vaqt)
└── confirmed_at (tasdiqlagan vaqt)
```

---

## Ishga tushirish

### Talablar
- Java 17+
- Docker va Docker Compose

### 1. Clone

```bash
git clone https://github.com/muhammadjonsaidov/uzlaunch.git
cd uzlaunch
```

### 2. `.env` fayl yarating

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/uzlaunch
DB_USER=uzlaunch
DB_PASSWORD=your_strong_password
DB_DRIVER=org.postgresql.Driver

# Email (Resend)
RESEND_API_KEY=re_your_key_here
MAIL_FROM=UZLaunch <noreply@uzlaunch.uz>

# App
BASE_URL=http://localhost:8080
PORT=8080
TRUST_PROXY=false

# Admin
ADMIN_SECRET=your_strong_admin_secret
```

### 3. PostgreSQL ishga tushiring

```bash
docker compose up db -d
```

### 4. Ilovani ishga tushiring

```bash
./mvnw spring-boot:run
```

Brauzerda oching: `http://localhost:8080`

### Docker bilan (to'liq stack)

```bash
docker compose up --build
```

App + PostgreSQL birgalikda ishga tushadi. `BASE_URL` ni `http://localhost:8080` ga o'rnating.

---

## API Endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| `GET/POST` | `/register` | Ro'yxatdan o'tish |
| `GET` | `/verify-email?token=` | Email tasdiqlash |
| `GET/POST` | `/login` | Kirish |
| `GET` | `/logout` | Chiqish |
| `GET` | `/dashboard` | Boshqaruv paneli |
| `GET/POST` | `/projects/new` | Yangi loyiha yaratish |
| `GET` | `/projects/{id}` | Loyiha va abonentlar ro'yxati |
| `GET/POST` | `/projects/{id}/edit` | Loyihani tahrirlash |
| `POST` | `/projects/{id}/delete` | Loyihani o'chirish |
| `GET` | `/projects/{id}/export` | CSV eksport (Pro) |
| `GET` | `/projects/{id}/stats` | Statistika |
| `POST` | `/projects/{id}/subscribers/{subId}/delete` | Abonentni o'chirish |
| `POST` | `/projects/{id}/subscribers/{subId}/resend` | Tasdiqlash emailini qayta yuborish |
| `GET` | `/p/{slug}` | Ommaviy kutish sahifasi |
| `POST` | `/p/{slug}/subscribe` | Email obuna bo'lish |
| `GET` | `/p/{slug}/confirm?token=` | Emailni tasdiqlash |
| `GET` | `/p/{slug}/sse` | Countdown SSE oqimi |
| `GET` | `/unsubscribe?token=` | Obunadan chiqish |
| `GET/POST` | `/admin` | Admin paneli |
| `POST` | `/admin/users/{id}/upgrade` | Foydalanuvchini Pro ga o'tkazish |
| `POST` | `/admin/users/{id}/downgrade` | Foydalanuvchini Free ga o'tkazish |
| `POST` | `/admin/users/{id}/ban` | Foydalanuvchini ban qilish |
| `POST` | `/admin/users/{id}/unban` | Foydalanuvchi ban'ini olib tashlash |

---

## Loyiha tuzilmasi

```
uzlaunch/
├── src/main/java/uz/uzlaunch/
│   ├── config/
│   │   └── SecurityConfig.java           # Spring Security, sessiya, rate limiter beans
│   ├── controller/
│   │   ├── AuthController.java           # /register, /verify-email, /login, /logout
│   │   ├── ProjectController.java        # /dashboard, /projects/*
│   │   ├── PublicController.java         # /p/*, /unsubscribe
│   │   └── AdminController.java          # /admin/*
│   ├── service/
│   │   ├── AuthService.java              # Ro'yxatdan o'tish, kirish, email verificatsiya
│   │   ├── ProjectService.java           # CRUD, statistika, eksport
│   │   ├── SubscriberService.java        # Obuna, tasdiqlash, o'chirish, qayta yuborish
│   │   ├── EmailService.java             # Resend API integratsiyasi
│   │   ├── LaunchSchedulerService.java   # Ishga tushirish emailini scheduled yuborish
│   │   ├── SseService.java               # Server-Sent Events (countdown)
│   │   ├── AdminService.java             # Foydalanuvchi boshqaruvi
│   │   └── RateLimiter.java              # IP-asosidagi rate limiting
│   ├── model/
│   │   ├── User.java
│   │   ├── Project.java
│   │   └── Subscriber.java
│   ├── dto/                              # Form DTO'lari (ProjectCreateRequest, va boshqalar)
│   ├── exception/                        # FlashRedirectException va subtiplari
│   ├── repository/
│   └── web/
│       └── GlobalExceptionHandler.java
├── src/main/resources/
│   ├── application.yml
│   ├── db/migration/
│   │   ├── V1__init.sql                  # Asosiy schema
│   │   ├── V2__subscriber_double_optin.sql
│   │   ├── V3__add_banned_column.sql
│   │   ├── V4__unique_subscriber_token.sql
│   │   ├── V5__launch_at_and_notified.sql
│   │   ├── V6__launch_email_template.sql
│   │   ├── V7__confirm_email_template.sql
│   │   ├── V8__subscriber_confirmed_at.sql
│   │   └── V9__user_email_verification.sql
│   ├── static/css/app.css
│   └── templates/                        # Thymeleaf HTML shablonlar
├── Dockerfile
├── docker-compose.yml
├── pom.xml
└── .env                                  # Maxfiy sozlamalar (git'ga qo'shilmaydi)
```

---

## Xavfsizlik

- Sessiya autentifikatsiya (HttpSession, Spring Security orqasida)
- Rate limiting: obuna 3 req/soat/IP, admin login 5 req/15 daqiqa/IP
- Double opt-in: faqat email tasdiqlagan abonentlar sanaladi
- Email verificatsiya: yangi foydalanuvchilar emailni tasdiqlashdan keyin kirishi mumkin
- Token muddati: 7 kundan eski tasdiqlanmagan abonentlar o'chiriladi
- `ADMIN_SECRET` env var orqali (default yo'q)
- X-Forwarded-For faqat `TRUST_PROXY=true` bo'lganda ishlatiladi
- `subscriber_count` atomic DB-level `UPDATE` orqali yangilanadi (race condition yo'q)

---

## Narx rejalari

| Reja | Narx | Nima kiradi |
|------|------|-------------|
| **Bepul** | $0 | 100 tagacha abonent, 1 ta loyiha, countdown, statistika |
| **Pro** | $5/oy | Cheksiz abonent, bir nechta loyiha, CSV eksport, email xabarnoma, maxsus email shablonlar |

---

## Litsenziya

MIT litsenziyasi — batafsil [LICENSE](LICENSE) faylini ko'ring.

---

*UZLaunch — O'zbekistonda ideangizni haqiqatga aylantiring*
