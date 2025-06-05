from pydantic import BaseModel
from datetime import datetime

class AnswerBase(BaseModel):
    text: str
    question_id: int
    mood_id: int

class AnswerCreate(AnswerBase):
    pass

class Answer(AnswerBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True 