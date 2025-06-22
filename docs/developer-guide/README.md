# Руководство разработчика

## Требования

- Python 3.8+
- Node.js 14+
- Git

## Установка и настройка

### Бэкенд (Django)

Основной сервер написан на Django REST Framework. В каталоге `backend/app` находится дополнительный сервис FastAPI, используемый для миграции и вспомогательных задач.

1. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Примените миграции:
```bash
python manage.py migrate
```

4. Запустите сервер разработки:
```bash
python manage.py runserver
```

### Фронтенд

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер разработки:
```bash
npm run dev
```

## Структура проекта

```
├── backend/              # Django проект
│   ├── api/             # API приложение
│   ├── app/             # Сервис FastAPI
│   ├── core/            # Основные настройки
│   └── manage.py        # Скрипт управления Django
├── src/                 # Фронтенд
│   ├── js/             # JavaScript файлы
│   ├── css/            # Стили
│   └── components/     # Компоненты
└── docs/               # Документация
```

## Разработка

### Бэкенд

1. Создание новых моделей:
```bash
python manage.py makemigrations
python manage.py migrate
```

2. Создание суперпользователя:
```bash
python manage.py createsuperuser
```

3. Запуск тестов:
```bash
python manage.py test
```

### Фронтенд

1. Сборка для продакшена:
```bash
npm run build
```

2. Запуск линтера:
```bash
npm run lint
```

## API Разработка

### Добавление новых эндпоинтов

1. Создайте сериализатор в `backend/api/serializers.py`
2. Добавьте представление в `backend/api/views.py`
3. Зарегистрируйте URL в `backend/api/urls.py`

### Тестирование API

1. Используйте Django REST Framework тесты
2. Проверяйте все возможные коды ответа
3. Тестируйте валидацию данных

## Развертывание

### Подготовка к продакшену

1. Настройте `settings.py`:
   - Установите `DEBUG = False`
   - Настройте `ALLOWED_HOSTS`
   - Настройте статические файлы

2. Соберите статические файлы:
```bash
python manage.py collectstatic
```

3. Соберите фронтенд:
```bash
npm run build
```

### Рекомендации по безопасности

1. Используйте HTTPS
2. Настройте CORS
3. Добавьте rate limiting
4. Настройте backup базы данных

## Отладка

### Логирование

1. Настройте логирование в `settings.py`
2. Используйте `logging` модуль
3. Мониторьте логи в продакшене

### Отладка фронтенда

1. Используйте DevTools в браузере
2. Включите source maps
3. Используйте console.log для отладки

## CI/CD

### GitHub Actions

1. Настройте автоматические тесты
2. Настройте линтинг
3. Настройте деплой

## Мониторинг

1. Настройте мониторинг ошибок
2. Настройте метрики производительности
3. Настройте алерты 