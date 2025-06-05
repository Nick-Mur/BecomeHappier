from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    question_id = Column(Integer, ForeignKey("questions.id"))
    mood_id = Column(Integer, ForeignKey("moods.id"))
    
    # Связи
    question = relationship("Question", back_populates="answers")
    mood = relationship("Mood", back_populates="answers") 