# 📘 Инструкция по размещению в репозиториях

## Шаг 1: Создание публичного репозитория (фронтенд)

### На GitHub:

1. Перейдите на https://github.com/new
2. Заполните:
   - **Repository name:** `skln-sea-battle`
   - **Description:** `Морской бой онлайн - фронтенд`
   - **Public** ✅
   - **Add a README** ✅ (уже создан)
   - **Add .gitignore:** Node
   - **License:** MIT
3. Нажмите **Create repository**

### Локально:

```bash
# Перейдите в папку проекта
cd /путь/к/проекту

# Инициализация Git
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: SKLN Морской бой v1.0"

# Добавление удаленного репозитория
git remote add origin https://github.com/ВАШ_USERNAME/skln-sea-battle.git

# Отправка на GitHub
git branch -M main
git push -u origin main
```

## Шаг 2: Создание приватного репозитория (бэкенд + данные)

### На GitHub:

1. Перейдите на https://github.com/new
2. Заполните:
   - **Repository name:** `skln-backend-private`
   - **Description:** `SKLN Backend - приватный репозиторий`
   - **Private** ✅ (ВАЖНО!)
   - **Add a README** ✅
3. Нажмите **Create repository**

### Локально:

```bash
# Создайте новую папку для бэкенда
mkdir skln-backend
cd skln-backend

# Скопируйте BACKEND_ARCHITECTURE.md из текущего проекта
# или создайте новую структуру

# Инициализация Git
git init
git add .
git commit -m "Initial backend architecture"

# Добавление удаленного репозитория
git remote add origin https://github.com/ВАШ_USERNAME/skln-backend-private.git

# Отправка на GitHub
git branch -M main
git push -u origin main
```

## Шаг 3: Настройка доступа

### Для приватного репозитория:

1. Перейдите в **Settings** → **Collaborators**
2. Добавьте доверенных разработчиков
3. Настройте **Branch protection rules**:
   - Требуйте pull request перед merge
   - Требуйте минимум 1 review
   - Запретите force push в main

## Шаг 4: Настройка CI/CD (опционально)

### GitHub Actions для публичного репо:

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Шаг 5: Деплой фронтенда

### Вариант A: GitHub Pages (бесплатно)

```bash
# Установите gh-pages
npm install --save-dev gh-pages

# Добавьте в package.json:
"scripts": {
  "deploy": "gh-pages -d dist"
}

# Деплой
npm run build
npm run deploy
```

### Вариант B: Vercel (рекомендуется)

1. Зарегистрируйтесь на https://vercel.com
2. Импортируйте репозиторий
3. Vercel автоматически настроит деплой

### Вариант C: Netlify

1. Зарегистрируйтесь на https://netlify.com
2. Подключите GitHub репозиторий
3. Настройте build command: `npm run build`
4. Publish directory: `dist`

## 📋 Checklist перед публикацией

### Публичный репозиторий:
- [ ] Удалены все пароли и секреты
- [ ] Обновлен README.md
- [ ] Добавлен .gitignore
- [ ] Проверена лицензия
- [ ] Протестирована сборка (`npm run build`)
- [ ] Проверена работа на мобильных устройствах

### Приватный репозиторий:
- [ ] Настроены права доступа
- [ ] Добавлена документация по API
- [ ] Настроены переменные окружения
- [ ] Добавлены тесты
- [ ] Настроена база данных
- [ ] Настроены бэкапы

## 🔐 Что НЕЛЬЗЯ публиковать в публичном репо:

❌ Пароли пользователей
❌ API ключи
❌ JWT секреты
❌ Данные базы
❌ .env файлы
❌ Приватные ключи
❌ Логи с персональными данными

## ✅ Что МОЖНО публиковать:

✅ Исходный код фронтенда
✅ README с инструкциями
✅ Конфигурационные файлы (без секретов)
✅ Документацию
✅ Тесты (без тестовых данных)

## 📞 Поддержка

Если возникли вопросы:
- Email: support@skln.ru
- GitHub Issues: создайте issue в репозитории

---

**Удачи с публикацией! 🚀**
