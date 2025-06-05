from sqlalchemy import Column, Integer, DateTime, String, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Mood(Base):
    __tablename__ = "moods"

    id = Column(Integer, primary_key=True, index=True)
    mood_level = Column(Integer)  # 1-5 или другая шкала
    date = Column(DateTime, default=datetime.utcnow)
    note = Column(String, nullable=True)
    
    # Связь с ответами на вопросы
    answers = relationship("Answer", back_populates="mood") 