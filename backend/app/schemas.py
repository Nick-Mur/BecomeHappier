from typing import List, Optional
from datetime import datetime

class Question:
    def __init__(self, id: int, text: str, set_id: int):
        self.id = id
        self.text = text
        self.set_id = set_id

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            text=obj.text,
            set_id=obj.set_id
        )

class QuestionSet:
    def __init__(self, id: int, name: str, is_active: bool, questions: List[Question]):
        self.id = id
        self.name = name
        self.is_active = is_active
        self.questions = questions

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            name=obj.name,
            is_active=obj.is_active,
            questions=[Question.from_orm(q) for q in obj.questions]
        )

class Answer:
    def __init__(self, id: int, question_id: int, rating: float, date: datetime):
        self.id = id
        self.question_id = question_id
        self.rating = rating
        self.date = date

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            question_id=obj.question_id,
            rating=obj.rating,
            date=obj.date
        )

class Statistics:
    def __init__(self, average: float, positive: int, neutral: int, negative: int):
        self.average = average
        self.positive = positive
        self.neutral = neutral
        self.negative = negative 