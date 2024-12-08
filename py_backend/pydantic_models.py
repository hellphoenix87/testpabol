from pydantic import BaseModel, Field
from typing import List, Dict

class Movie(BaseModel):
    genre: int
    attributes: List[str]
    audience: int
    title: str
    scenes: list[dict[str, str]]