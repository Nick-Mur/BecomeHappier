from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class QuestionSet(Base):
    __tablename__ = "question_sets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Связь с вопросами
    questions = relationship("Question", back_populates="question_set")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    question_set_id = Column(Integer, ForeignKey("question_sets.id"))
    
    # Связи
    question_set = relationship("QuestionSet", back_populates="questions")
    answers = relationship("Answer", back_populates="question") 