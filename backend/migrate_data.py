import json
import os
from app.database import SessionLocal, engine
from app.models import Base, QuestionSet, Question, Answer
from datetime import datetime

def migrate_data():
    # Создаем таблицы
    Base.metadata.create_all(bind=engine)
    
    # Получаем сессию базы данных
    db = SessionLocal()
    
    try:
        # Загружаем данные из localStorage (предполагается, что они сохранены в JSON файле)
        with open('local_storage_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Мигрируем наборы вопросов
        user_sets = data.get('userSets', {})
        active_sets = data.get('activeMoodSets', [])
        answers = data.get('moodAnswers', {})
        
        # Создаем наборы вопросов
        for set_name, questions in user_sets.items():
            # Создаем набор
            db_set = QuestionSet(
                name=set_name,
                is_active=set_name in active_sets
            )
            db.add(db_set)
            db.flush()  # Получаем ID набора
            
            # Создаем вопросы
            for question_text in questions:
                db_question = Question(
                    text=question_text,
                    set_id=db_set.id
                )
                db.add(db_question)
                db.flush()  # Получаем ID вопроса
                
                # Создаем ответы для этого вопроса
                if set_name in answers and question_text in answers[set_name]:
                    rating = answers[set_name][question_text]
                    db_answer = Answer(
                        question_id=db_question.id,
                        rating=float(rating),
                        date=datetime.utcnow()  # Используем текущую дату, так как в localStorage нет дат
                    )
                    db.add(db_answer)
        
        # Сохраняем изменения
        db.commit()
        print("Миграция данных успешно завершена!")
        
    except Exception as e:
        print(f"Ошибка при миграции данных: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_data() 