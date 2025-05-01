from pydantic import BaseModel,field_serializer
from datetime import datetime

class Message(BaseModel):
    date: datetime
    sender: str
    content: str

    @field_serializer('date')
    def date_to_isoformat(self, value: datetime) -> str:
        return value.isoformat()