# Бэкенд приложения "Я готов стать счастливее"

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
```

2. Активируйте виртуальное окружение:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

## Миграция данных

1. Экспортируйте данные из localStorage:
   - Откройте консоль разработчика в браузере (F12)
   - Вставьте и выполните код из файла `export_local_storage.js`
   - Сохраните скачанный файл `local_storage_data.json` в корневой директории бэкенда

2. Запустите миграцию данных:
```bash
python migrate_data.py
```

## Запуск сервера

```bash
uvicorn app.main:app --reload
```

Сервер будет доступен по адресу: http://localhost:8000

## API Endpoints

- GET /sets - получить все наборы вопросов
- POST /sets - создать новый набор вопросов
- PUT /sets/{set_id} - обновить набор вопросов
- DELETE /sets/{set_id} - удалить набор вопросов
- POST /sets/{set_id}/toggle - активировать/деактивировать набор
- GET /answers - получить все ответы
- POST /answers - создать новый ответ
- GET /statistics - получить статистику ответов

## Документация API

После запуска сервера документация доступна по адресам:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 