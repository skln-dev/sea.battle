# 🔒 Приватный репозиторий - SKLN Backend

**ВНИМАНИЕ:** Этот репозиторий содержит конфиденциальные данные и логику аутентификации.
Доступ только для разработчиков проекта.

## 📁 Структура проекта

```
skln-backend/
├── src/
│   ├── auth/           # Аутентификация и авторизация
│   │   ├── jwt.ts
│   │   ├── bcrypt.ts
│   │   └── middleware.ts
│   ├── models/         # Модели данных
│   │   ├── User.ts
│   │   ├── Clan.ts
│   │   ├── Federation.ts
│   │   ├── School.ts
│   │   └── Game.ts
│   ├── routes/         # API endpoints
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── clans.ts
│   │   ├── games.ts
│   │   └── admin.ts
│   ├── services/       # Бизнес-логика
│   │   ├── gameLogic.ts
│   │   ├── ratingService.ts
│   │   └── tournamentService.ts
│   └── utils/          # Утилиты
│       ├── validation.ts
│       └── logger.ts
├── database/
│   ├── migrations/     # Миграции БД
│   └── seeds/          # Начальные данные
├── tests/              # Тесты
├── .env.example        # Пример переменных окружения
├── docker-compose.yml  # Docker конфигурация
└── package.json
```

## 🔐 Безопасность

### Хранение паролей

```typescript
// ❌ НЕПРАВИЛЬНО (текущая реализация)
user.password = 'plain_password';

// ✅ ПРАВИЛЬНО
import bcrypt from 'bcrypt';
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### JWT токены

```typescript
// Генерация токена
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

// Проверка токена
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

## 🗄️ База данных

### PostgreSQL схема

```sql
-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'player',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  school_id UUID REFERENCES schools(id),
  clan_id UUID REFERENCES clans(id),
  federation_id UUID REFERENCES federations(id),
  banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  ban_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Кланы
CREATE TABLE clans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  tag VARCHAR(5) UNIQUE NOT NULL,
  logo VARCHAR(10) DEFAULT '⚔️',
  color VARCHAR(7) DEFAULT '#00ffff',
  creator_id UUID REFERENCES users(id),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Игры
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  winner_id UUID REFERENCES users(id),
  is_draw BOOLEAN DEFAULT FALSE,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  room_id UUID REFERENCES rooms(id)
);

-- Школы
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  region VARCHAR(100),
  area VARCHAR(100),
  city VARCHAR(100),
  address VARCHAR(200),
  building_number VARCHAR(20),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Переменные окружения (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skln
DATABASE_TEST_URL=postgresql://user:password@localhost:5432/skln_test

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-domain.com

# Email (для восстановления пароля)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📡 API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Users

```
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id
GET    /api/users?school_id=xxx
POST   /api/users/:id/friends
DELETE /api/users/:id/friends/:friendId
```

### Games

```
POST   /api/games
GET    /api/games/:id
POST   /api/games/:id/shot
POST   /api/games/:id/surrender
POST   /api/games/:id/draw-offer
```

### Clans

```
POST   /api/clans
GET    /api/clans/:id
PUT    /api/clans/:id
DELETE /api/clans/:id
POST   /api/clans/:id/join
POST   /api/clans/:id/leave
POST   /api/clans/:id/invite
```

### Admin

```
GET    /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/:id/ban
POST   /api/admin/users/:id/unban
GET    /api/admin/schools/pending
POST   /api/admin/schools/:id/approve
POST   /api/admin/schools/:id/reject
```

## 🧪 Тестирование

```bash
# Unit тесты
npm test

# Integration тесты
npm run test:integration

# E2E тесты
npm run test:e2e

# Покрытие кода
npm run test:coverage
```

## 📊 Мониторинг

- Логи: Winston + ELK Stack
- Метрики: Prometheus + Grafana
- Ошибки: Sentry
- APM: New Relic

## 🔒 Безопасность

### Checklist

- [ ] HTTPS только
- [ ] Rate limiting
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (sanitize inputs)
- [ ] CSRF tokens
- [ ] Password hashing (bcrypt, min 10 rounds)
- [ ] JWT with expiration
- [ ] Environment variables (never commit secrets)
- [ ] Database backups (daily)
- [ ] Audit logs for admin actions
- [ ] 2FA for admin accounts

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // лимит 100 запросов
  message: 'Слишком много запросов, попробуйте позже'
});

app.use('/api/', limiter);
```

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- Initial release
- Basic game mechanics
- User authentication
- Clan system
- Rating system

---

**Контакты:**
- Email: admin@skln.ru
- Telegram: @skln_support
