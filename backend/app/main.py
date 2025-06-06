from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/sets", response_model=List[schemas.QuestionSet])
def get_sets(db: Session = Depends(get_db)):
    sets = db.query(models.QuestionSet).all()
    return sets

@app.post("/sets", response_model=schemas.QuestionSet)
def create_set(set: schemas.QuestionSetCreate, db: Session = Depends(get_db)):
    db_set = models.QuestionSet(name=set.name, is_active=set.is_active)
    db.add(db_set)
    db.commit()
    db.refresh(db_set)
    
    for question in set.questions:
        db_question = models.Question(text=question.text, set_id=db_set.id)
        db.add(db_question)
    
    db.commit()
    db.refresh(db_set)
    return db_set

@app.put("/sets/{set_id}", response_model=schemas.QuestionSet)
def update_set(set_id: int, set: schemas.QuestionSetUpdate, db: Session = Depends(get_db)):
    db_set = db.query(models.QuestionSet).filter(models.QuestionSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Set not found")
    
    db_set.name = set.name
    db_set.is_active = set.is_active
    
    if set.questions is not None:
        # Удаляем старые вопросы
        for question in db_set.questions:
            db.delete(question)
        
        # Добавляем новые вопросы
        for question in set.questions:
            db_question = models.Question(text=question.text, set_id=set_id)
            db.add(db_question)
    
    db.commit()
    db.refresh(db_set)
    return db_set

@app.delete("/sets/{set_id}")
def delete_set(set_id: int, db: Session = Depends(get_db)):
    db_set = db.query(models.QuestionSet).filter(models.QuestionSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Set not found")
    
    db.delete(db_set)
    db.commit()
    return {"message": "Set deleted successfully"}

@app.post("/sets/{set_id}/toggle")
def toggle_set(set_id: int, db: Session = Depends(get_db)):
    db_set = db.query(models.QuestionSet).filter(models.QuestionSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Set not found")
    
    db_set.is_active = not db_set.is_active
    db.commit()
    return {"message": f"Set {'activated' if db_set.is_active else 'deactivated'} successfully"}

@app.get("/answers", response_model=List[schemas.Answer])
def get_answers(db: Session = Depends(get_db)):
    answers = db.query(models.Answer).all()
    return answers

@app.post("/answers", response_model=schemas.Answer)
def create_answer(answer: schemas.AnswerCreate, db: Session = Depends(get_db)):
    db_answer = models.Answer(**answer.dict())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

@app.get("/statistics", response_model=schemas.Statistics)
def get_statistics(db: Session = Depends(get_db)):
    answers = db.query(models.Answer).all()
    if not answers:
        return schemas.Statistics(average=0, positive=0, neutral=0, negative=0)
    
    total = len(answers)
    ratings = [answer.rating for answer in answers]
    average = sum(ratings) / total
    
    positive = sum(1 for r in ratings if r >= 4)
    neutral = sum(1 for r in ratings if 2 <= r < 4)
    negative = sum(1 for r in ratings if r < 2)
    
    return schemas.Statistics(
        average=round(average, 2),
        positive=positive,
        neutral=neutral,
        negative=negative
    ) 