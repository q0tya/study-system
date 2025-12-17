# Деплой на Vercel

1. **Загрузка на GitHub**:
   - Убедитесь, что ваш проект находится в репозитории GitHub.
   - Выполните команды:
     ```bash
     git add .
     git commit -m "Ready for deploy"
     git push
     ```

2. **Подключение к Vercel**:
   - Перейдите на [vercel.com](https://vercel.com/new).
   - Импортируйте ваш репозиторий.

3. **Настройка переменных окружения (Environment Variables)**:
   Добавьте следующие переменные в настройках проекта на Vercel (Settings -> Environment Variables):
   - `DATABASE_URL`: (Из Supabase -> Transaction Pooler). **Важно**: добавьте `?pgbouncer=true` в конце строки!
   - `DIRECT_URL`: (Из Supabase -> Session/Direct).
   - `AUTH_SECRET`: (Сгенерируйте случайную строку командой: `openssl rand -base64 32`).
   - `NEXTAUTH_URL`: `https://ваш-проект.vercel.app` (Добавьте это ПОСЛЕ деплоя, или используйте домен, который выдаст Vercel).

4. **Настройки сборки (Build Settings)**:
   - Framework Preset: Next.js (Automatic).
   - Build Command: `npx prisma generate && next build` (Обычно просто `next build` достаточно, если настроен `postinstall`, но прямой вызов prisma generate надежнее).
   - *Совет*: Добавьте `"postinstall": "prisma generate"` в `package.json` в раздел scripts.

5. **Деплой (Deploy)**:
   - Нажмите кнопку **Deploy**.

6. **Проверка**:
   - Перейдите по полученному URL.
   - Войдите как администратор: `admin@example.com` / `admin123`.

## Локальный запуск
- `npm run dev`
- Откройте http://localhost:3000
