from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class MoodBase(BaseModel):
    mood_level: int
    note: Optional[str] = None

class MoodCreate(MoodBase):
    pass

class Mood(MoodBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True 