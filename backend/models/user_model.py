from pydantic import BaseModel,field_validator,Field
from re import fullmatch
from typing import List
from .validations import validate_email

class UserRequest(BaseModel):
    username: str
    email: str
    password: str
    code: int = Field(ge=100000,le=999999)
    
    @field_validator("username")
    def validate_username(cls,value:str):
        if len(value) < 3:
            raise ValueError("The username must be at least 3 characters long.")
        if " " in value:
            raise ValueError("The username cannot have spaces.")
        return value.upper()
    
    @field_validator("email")
    def validate_email(cls,value:str):
        if not validate_email(value):
            raise ValueError("Invalid Email")
        
        return value.upper()
    
    @field_validator("password")
    def validate_password(cls, value: str):
        regex = r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$'
        if not fullmatch(regex, value):
            raise ValueError(
                "Password must have at least one number, one special character, "
                "one uppercase letter, one lowercase letter, and be at least 8 characters long"
            )
        
        return value
    

class UserResponse(BaseModel):
    username: str
    email: str

class UserDataResponse(UserResponse):
    ws_token: str

class MetaRegisters(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int

class UsersResponse(BaseModel):
    users: List[UserResponse]
    meta: MetaRegisters
    