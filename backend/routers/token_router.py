from jose import jwt
from fastapi import HTTPException,status,Depends,APIRouter,Form
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer
from jose.exceptions import JWTError,ExpiredSignatureError
import json
from datetime import datetime,UTC,timedelta
from ..utils.env import ALGORITHM,SECRET_KEY
from ..actions.user_actions import UserActions

oauth2_scheme = OAuth2PasswordBearer("/token")

def validate_token(token: str = Depends(oauth2_scheme)) -> None:
    try:
        data = json.loads(verify_token(token))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
            )
    
    return data

token_depend = Annotated[dict,Depends(validate_token)]

def verify_token(token: str):
    try:
        payload = jwt.decode(token=token,algorithms=ALGORITHM,key=SECRET_KEY)
        sub = payload["sub"]
        return sub
    except ExpiredSignatureError:
        raise HTTPException(detail="TOKEN HAS EXPIRED",status_code=status.HTTP_401_UNAUTHORIZED)
    except JWTError:
        raise HTTPException(detail="TOKEN IS INVALID",status_code=status.HTTP_401_UNAUTHORIZED)


def encode_token(username:str):
    try:
        payload = {
            "sub": json.dumps(
                    {
                        "username":username
                    }),
            "exp": datetime.now(UTC) + timedelta(days=30)
        }
        token = jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)
        return token
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    

token_router = APIRouter()

class RequestForm:
    def __init__(self,username: str = Form(...), password: str = Form(...)):
        self.username = username.upper()
        self.password = password

@token_router.post("/token")
def login(form_data: RequestForm = Depends()):
    actions = UserActions()
    if not actions.validate_user(username=form_data.username,password=form_data.password):
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="INVALID CREDENTIALS",
            )
    token = encode_token(form_data.username)
    
    return {"access_token": token, "token_type": "bearer"}