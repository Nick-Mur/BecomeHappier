from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from .database import engine, get_db
from .models.base import Base
from .models import mood, question_set, answer
from .schemas import mood as mood_schema
from .schemas import question_set as question_set_schema
from .schemas import answer as answer_schema

# Создаем таблицы при запуске
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роуты для настроения
@app.post("/moods/", response_model=mood_schema.Mood)
def create_mood(mood_data: mood_schema.MoodCreate, db: Session = Depends(get_db)):
    db_mood = mood.Mood(**mood_data.dict())
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)
    return db_mood

@app.get("/moods/", response_model=List[mood_schema.Mood])
def read_moods(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    moods = db.query(mood.Mood).offset(skip).limit(limit).all()
    return moods

@app.get("/moods/{mood_id}", response_model=mood_schema.Mood)
def read_mood(mood_id: int, db: Session = Depends(get_db)):
    db_mood = db.query(mood.Mood).filter(mood.Mood.id == mood_id).first()
    if db_mood is None:
        raise HTTPException(status_code=404, detail="Mood not found")
    return db_mood

# Роуты для наборов вопросов
@app.post("/question-sets/", response_model=question_set_schema.QuestionSet)
def create_question_set(question_set_data: question_set_schema.QuestionSetCreate, db: Session = Depends(get_db)):
    db_question_set = question_set.QuestionSet(
        name=question_set_data.name,
        is_active=question_set_data.is_active
    )
    db.add(db_question_set)
    db.commit()
    db.refresh(db_question_set)
    
    # Создаем вопросы
    for question_data in question_set_data.questions:
        db_question = question_set.Question(
            text=question_data.text,
            question_set_id=db_question_set.id
        )
        db.add(db_question)
    
    db.commit()
    db.refresh(db_question_set)
    return db_question_set

@app.get("/question-sets/", response_model=List[question_set_schema.QuestionSet])
def read_question_sets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    question_sets = db.query(question_set.QuestionSet).offset(skip).limit(limit).all()
    return question_sets

@app.get("/question-sets/{question_set_id}", response_model=question_set_schema.QuestionSet)
def read_question_set(question_set_id: int, db: Session = Depends(get_db)):
    db_question_set = db.query(question_set.QuestionSet).filter(question_set.QuestionSet.id == question_set_id).first()
    if db_question_set is None:
        raise HTTPException(status_code=404, detail="Question set not found")
    return db_question_set

# Роуты для ответов
@app.post("/answers/", response_model=answer_schema.Answer)
def create_answer(answer_data: answer_schema.AnswerCreate, db: Session = Depends(get_db)):
    db_answer = answer.Answer(**answer_data.dict())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

@app.get("/answers/", response_model=List[answer_schema.Answer])
def read_answers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    answers = db.query(answer.Answer).offset(skip).limit(limit).all()
    return answers

# Статистика
@app.get("/stats/mood-average")
def get_mood_average(days: int = 7, db: Session = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(days=days)
    moods = db.query(mood.Mood).filter(mood.Mood.date >= start_date).all()
    
    if not moods:
        return {"average": 0, "count": 0}
    
    total = sum(mood.mood_level for mood in moods)
    return {"average": total / len(moods), "count": len(moods)} 