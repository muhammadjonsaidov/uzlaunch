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
| Countdown taymer | Ishga tushish sanasigacha sanash |
| Dashboard | Abonentlar ro'yxati, pagination (25/sahifa) |
| Loyihani tahrirlash | Nom, tagline, tavsif, sanani yangilash |
| Statistika | Kunlik obunalar grafigi |
| Unsubscribe | Token orqali xavfsiz obunadan chiqish |
| Bepul / Pro rejalar | Bepul: 100 tagacha abonent. Pro: cheksiz + CSV eksport |
| Admin panel | Foydalanuvchilarni boshqarish, brute-force himoyasi |

---

## Texnologiyalar

**Backend**
- Java 17, Spring Boot 3.2
- Spring Data JPA + Hibernate
- Spring Security (sessiya autentifikatsiya, CSRF himoyasi)
- Flyway (migratsiya boshqaruvi)

**Frontend**
- Thymeleaf (server-side shablonlar)
- Vanilla CSS (CDN'siz)

**Ma'lumotlar bazasi**
- PostgreSQL 16

**Email**
- Resend API (transaksion emaillar)

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
└── created_at

projects
├── id (PK)
├── user_id (FK → users)
├── slug (unique, e.g. "my-startup")
├── name
├── tagline
├── description
├── launch_date
└── subscriber_count

subscribers
├── id (PK)
├── project_id (FK → projects)
├── email
├── name
├── token (UUID, confirm/unsubscribe uchun)
├── confirmed (boolean)
└── subscribed_at
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

---

## API Endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| `GET/POST` | `/register` | Ro'yxatdan o'tish |
| `GET/POST` | `/login` | Kirish |
| `GET` | `/logout` | Chiqish |
| `GET` | `/dashboard` | Boshqaruv paneli |
| `GET/POST` | `/projects/new` | Yangi loyiha yaratish |
| `GET` | `/projects/{id}` | Loyiha va abonentlar ro'yxati |
| `GET/POST` | `/projects/{id}/edit` | Loyihani tahrirlash |
| `POST` | `/projects/{id}/delete` | Loyihani o'chirish |
| `GET` | `/projects/{id}/export` | CSV eksport (Pro) |
| `GET` | `/p/{slug}` | Ommaviy kutish sahifasi |
| `POST` | `/p/{slug}/subscribe` | Email obuna bo'lish |
| `GET` | `/p/{slug}/confirm?token=` | Emailni tasdiqlash |
| `GET` | `/p/{slug}/stats` | Statistika sahifasi |
| `GET` | `/unsubscribe?token=` | Obunadan chiqish |
| `GET/POST` | `/admin` | Admin paneli |
| `POST` | `/admin/users/{id}/upgrade` | Foydalanuvchini Pro'ga o'tkazish |

---

## Loyiha tuzilmasi

```
uzlaunch/
├── src/main/java/uz/uzlaunch/
│   ├── config/
│   │   └── SecurityConfig.java       # Spring Security, CSRF, rate limiter beans
│   ├── controller/
│   │   ├── AuthController.java       # /register, /login, /logout
│   │   ├── ProjectController.java    # /dashboard, /projects/*
│   │   ├── PublicController.java     # /p/*, /unsubscribe
│   │   └── AdminController.java      # /admin/*
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── ProjectService.java
│   │   ├── SubscriberService.java
│   │   ├── EmailService.java
│   │   ├── AdminService.java
│   │   └── RateLimiter.java
│   ├── model/
│   │   ├── User.java
│   │   ├── Project.java
│   │   └── Subscriber.java
│   ├── dto/                          # Form DTO'lari
│   ├── exception/                    # FlashRedirectException va subtiplari
│   ├── repository/
│   └── web/
│       └── GlobalExceptionHandler.java
├── src/main/resources/
│   ├── application.yml
│   ├── db/migration/
│   │   ├── V1__init.sql              # Asosiy schema
│   │   └── V2__subscriber_double_optin.sql
│   └── templates/                    # Thymeleaf HTML shablonlar
├── docker-compose.yml
├── pom.xml
└── .env                              # Maxfiy sozlamalar (git'ga qo'shilmaydi)
```

---

## Xavfsizlik

- CSRF himoyasi (barcha formlarda)
- Sessiya fixation himoyasi (login'dan keyin sessiya ID yangilanadi)
- Rate limiting: obuna 3 req/soat/IP, admin login 5 req/15 daqiqa/IP
- Double opt-in: faqat email tasdiqlagan foydalanuvchilar sanaladi
- `ADMIN_SECRET` env var orqali (default yo'q)
- X-Forwarded-For faqat `TRUST_PROXY=true` bo'lganda ishlatiladi

---

## Narx rejalari

| Reja | Narx | Nima kiradi |
|------|------|-------------|
| **Bepul** | $0 | 100 tagacha abonent, 1 ta loyiha |
| **Pro** | $5/oy | Cheksiz abonent, CSV eksport, email xabarnoma |

---

## Litsenziya

MIT litsenziyasi — batafsil [LICENSE](LICENSE) faylini ko'ring.

---

*UZLaunch — O'zbekistonda ideangizni haqiqatga aylantiring*
