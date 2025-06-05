from pydantic import BaseModel
from typing import List, Optional

class QuestionBase(BaseModel):
    text: str

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    question_set_id: int

    class Config:
        from_attributes = True

class QuestionSetBase(BaseModel):
    name: str
    is_active: bool = True

class QuestionSetCreate(QuestionSetBase):
    questions: List[QuestionCreate]

class QuestionSet(QuestionSetBase):
    id: int
    questions: List[Question] = []

    class Config:
        from_attributes = True 