# UZLaunch 🚀

**O'zbekistondagi startaplar uchun kutish ro'yxati va pre-launch sahifa yaratuvchi platforma.**

> Kodlashdan oldin — tekshiring. Idea bormi? Avval auditoriyangizni yig'ing.

[![Live](https://img.shields.io/badge/Live-uzlaunch.uz-black?style=flat-square)](https://uzlaunch.uz)
[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?style=flat-square)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square)](https://www.postgresql.org/)

---

## 🎯 Loyiha haqida

**UZLaunch** — O'zbekistondagi tadbirkorlar, talabalar va startap asoschilari uchun yaratilgan platforma. Maqsad: biror mahsulot yoki xizmat ishga tushirishdan oldin, haqiqiy manfaatdor foydalanuvchilarni yig'ish va ideani bozorda sinab ko'rish.

### Muammo

O'zbekistonda ko'p tadbirkorlar oylar davomida mahsulot yaratadi — keyin esa hech kim sotib olmaydi. Sabab oddiy: bozor talabini avvaldan tekshirmaganlar.

### Yechim

UZLaunch orqali istalgan kishi **2 daqiqada** pre-launch sahifa yaratadi:
- `uzlaunch.uz/loyiha-nomi` ko'rinishida o'z havola
- Tashrif buyuruvchilar email orqali ro'yxatdan o'tadi
- Asoschi abonentlar sonini real vaqtda ko'radi
- Ishga tushish kuni barcha abonentlarga xabar yuboradi

---

## ✨ Asosiy imkoniyatlar

| Imkoniyat | Tavsif |
|-----------|--------|
| 📄 **Pre-launch sahifa** | 5 ta maydon to'ldirib, jonli sahifa yarating |
| 🔗 **Shaxsiy havola** | `uzlaunch.uz/sizning-loyiha` ko'rinishida unique URL |
| 📧 **Email yig'ish** | Tashrif buyuruvchilar ro'yxatdan o'tadi, email saqlanadi |
| 📊 **Dashboard** | Abonentlar soni, ro'yxat va statistika |
| 👤 **Foydalanuvchi tizimi** | Ro'yxatdan o'tish, kirish, sessiya boshqaruvi |
| 💎 **Bepul / Pro rejalar** | Bepul: 100 tagacha abonent. Pro: cheksiz + CSV eksport |
| 🌐 **Ko'p tilli** | O'zbek, Rus, Ingliz tillarida interfeys |

---

## 👥 Kimlar uchun?

### 🎓 Talabalar
Startup musobaqasiga tayyorlanayotgan talaba o'z loyihasiga abonentlar yig'adi va "bizda haqiqiy foydalanuvchilar bor" deb isbot ko'rsatadi.

### 💼 Tadbirkorlar
Yangi mahsulot yoki xizmat ochishdan oldin bozor talabini tekshiradi. Agar 100 kishi ro'yxatga olsa — oldinga ketadi. Olmasa — vaqt va pulni tejaydi.

### 👨‍💻 IT Freylanserlari
Yangi servis yoki SaaS mahsulot ishga tushirishdan oldin auditoriya yig'adi.

### 🏪 Kichik biznes egalari
Yangi mahsulot liniyasi yoki filial ochishdan oldin qiziqish darajasini o'lchaydi.

---

## 💰 Narx rejalari

| Reja | Narx | Nima kiradi |
|------|------|-------------|
| **Bepul** | $0 | 100 tagacha abonent, 1 ta loyiha |
| **Pro** | $5/oy | Cheksiz abonent, CSV eksport, email xabarnoma |
| **Team** | $10/oy | Hamma Pro imkoniyatlar + jamoaviy kirish + analytics |

---

## 🛠️ Texnologiyalar

### Backend
- **Java 17** — asosiy dasturlash tili
- **Spring Boot 3.2** — web freymvork
- **Spring Data JPA** — ma'lumotlar bazasi bilan ishlash
- **Spring Security** — autentifikatsiya va xavfsizlik
- **Hibernate** — ORM

### Frontend
- **Thymeleaf** — server-side shablonlar
- **Vanilla CSS** — stil (CDN'siz, tez yuklash)

### Ma'lumotlar bazasi
- **PostgreSQL 16** — asosiy baza
- **H2** — lokal ishlab chiqish uchun (ixtiyoriy)

### Deploy
- **Docker & Docker Compose** — konteynerizatsiya
- **Railway.app** — bulut deploy
- **uzlaunch.uz** — O'zbekiston domeni

---

## 🗄️ Ma'lumotlar bazasi tuzilmasi

```
users
├── id (PK)
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
└── subscribed_at
```

---

## ⚡ Ishga tushirish

### Talablar
- Java 17+
- Docker va Docker Compose
- PostgreSQL (yoki Docker orqali avtomatik)

### Docker bilan (tavsiya etiladi)

```bash
# 1. Reponi clone qiling
git clone https://github.com/your-username/uzlaunch.git
cd uzlaunch

# 2. .env fayl yarating
echo "DB_PASSWORD=your_strong_password" > .env

# 3. application.properties ga username/password qo'shing
# spring.datasource.username=uzlaunch
# spring.datasource.password=${DB_PASSWORD}

# 4. Ishga tushiring
docker compose up --build
```

Brauzerda oching: `http://localhost:8080`

### Lokal (PostgreSQL bilan)

```bash
# PostgreSQL bazasini yarating
psql -U postgres -c "CREATE DATABASE uzlaunch;"

# Mac/Linux
DATABASE_URL=jdbc:postgresql://localhost:5432/uzlaunch \
SPRING_DATASOURCE_USERNAME=postgres \
SPRING_DATASOURCE_PASSWORD=your_password \
./mvnw spring-boot:run

# Windows PowerShell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/uzlaunch"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="your_password"
./mvnw spring-boot:run
```

### Environment o'zgaruvchilari

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/uzlaunch
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
PORT=8080
ADMIN_SECRET=your-admin-secret
```

---

## 📁 Loyiha tuzilmasi

```
uzlaunch/
├── src/main/java/uz/uzlaunch/
│   ├── UzLaunchApplication.java      # Kirish nuqtasi
│   ├── config/
│   │   └── SecurityConfig.java       # Spring Security sozlamalari
│   ├── controller/
│   │   └── MainController.java       # Barcha route'lar (auth, dashboard, public)
│   ├── model/
│   │   ├── User.java                 # Foydalanuvchi entity
│   │   ├── Project.java              # Loyiha entity
│   │   └── Subscriber.java           # Abonent entity
│   └── repository/
│       ├── UserRepository.java
│       ├── ProjectRepository.java
│       └── SubscriberRepository.java
├── src/main/resources/
│   ├── application.properties        # Sozlamalar
│   └── templates/                    # Thymeleaf HTML shablonlar
│       ├── index.html                # Bosh sahifa
│       ├── register.html             # Ro'yxatdan o'tish
│       ├── login.html                # Kirish
│       ├── dashboard.html            # Boshqaruv paneli
│       ├── new-project.html          # Yangi loyiha formasi
│       ├── public-page.html          # Ommaviy kutish sahifasi
│       └── project-detail.html       # Abonentlar ro'yxati
├── Dockerfile                        # Ko'p bosqichli build
├── docker-compose.yml                # App + PostgreSQL
├── .env                              # Maxfiy sozlamalar (git'ga qo'shilmaydi)
└── pom.xml                           # Maven bog'liqliklar
```

---

## 🔌 API Endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| `GET` | `/` | Bosh sahifa |
| `GET/POST` | `/register` | Ro'yxatdan o'tish |
| `GET/POST` | `/login` | Kirish |
| `GET` | `/logout` | Chiqish |
| `GET` | `/dashboard` | Boshqaruv paneli |
| `GET/POST` | `/projects/new` | Yangi loyiha yaratish |
| `GET` | `/projects/{id}` | Loyiha tafsilotlari |
| `GET` | `/p/{slug}` | Ommaviy kutish sahifasi |
| `POST` | `/p/{slug}/subscribe` | Email obuna bo'lish |
| `POST` | `/admin/upgrade` | Foydalanuvchini Pro'ga o'tkazish |

---

## 🌍 Production Deploy (Railway)

```bash
# 1. GitHub'ga push qiling
git push origin main

# 2. railway.app da yangi loyiha oching
# 3. GitHub repo'ni ulang
# 4. PostgreSQL plugin qo'shing
# 5. Environment variables kiriting:
#    - DATABASE_URL (Railway avtomatik beradi)
#    - ADMIN_SECRET
# 6. Deploy bosing
# 7. Custom domain: Settings → Networking → uzlaunch.uz
```

---

## 🗺️ Yo'l xaritasi

### v1.0 — Hozir ✅
- [x] Pre-launch sahifa yaratish
- [x] Email ro'yxatga olish
- [x] Asoschi dashboard
- [x] Bepul/Pro reja tizimi
- [x] Docker deploy

### v2.0 — Keyingi bosqich
- [ ] Email xabarnoma yuborish (abonentlarga)
- [ ] Payme va Click to'lov integratsiyasi
- [ ] CSV eksport
- [ ] Sahifa ko'rishlar statistikasi
- [ ] A/B sarlavha sinovi

### v3.0 — Kelajak
- [ ] Mobil ilova (iOS va Android)
- [ ] API — boshqa platformalar bilan integratsiya
- [ ] Korporativ paket
- [ ] O'zbek SMS xabarnomasi (Playmobile)

---

## 📊 Raqobatchilar bilan taqqoslash

| Xususiyat | Launchrock | Carrd | **UZLaunch** |
|-----------|-----------|-------|-------------|
| O'zbek tili | ❌ | ❌ | ✅ |
| Payme / Click | ❌ | ❌ | ✅ (v2.0) |
| Narx | $19/oy | $19/oy | $5/oy |
| O'zbekiston qo'llab-quvvatlash | ❌ | ❌ | ✅ |
| Lokal deploy | ❌ | ❌ | ✅ |
| Ochiq manba | ❌ | ❌ | ✅ |

---

## 🤝 Jamoa

| Rol | Mas'uliyat |
|-----|-----------|
| Founder & Backend Developer | Java/Spring, deploy, arxitektura |
| Growth & Marketing | Foydalanuvchilar, marketing, sotuv |

---

## 📞 Aloqa

- 🌐 Sayt: [uzlaunch.uz](https://uzlaunch.uz)
- 💬 Telegram: [@uzlaunch](https://t.me/uzlaunch)

---

## 📄 Litsenziya

MIT litsenziyasi — batafsil [LICENSE](LICENSE) faylini ko'ring.

---

*UZLaunch — O'zbekistonda ideangizni haqiqatga aylantiring* 🇺🇿