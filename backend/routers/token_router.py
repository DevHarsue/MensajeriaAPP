from jose import jwt
from fastapi import HTTPException,status,Depends,APIRouter,Form
from fastapi.responses import JSONResponse
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer
from jose.exceptions import JWTError,ExpiredSignatureError
import json
from datetime import datetime,UTC,timedelta
from ..utils.env import ALGORITHM,SECRET_KEY,ENV
from ..actions.user_actions import UserActions

oauth2_scheme = OAuth2PasswordBearer("/token")

def validate_token(token:str) -> dict | None:
    try:
        data = json.loads(verify_token(token))
    except Exception as e:
        return None
    return data


def get_data_token(access_token: str = Depends(oauth2_scheme)):
    data = validate_token(token=access_token)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token"
            )
    
    return data

token_depend = Annotated[dict,Depends(get_data_token)]

def verify_token(token: str):
    try:
        payload = jwt.decode(token=token,algorithms=ALGORITHM,key=SECRET_KEY)
        sub = payload["sub"]
        return sub
    except ExpiredSignatureError:
        raise HTTPException(detail="TOKEN HAS EXPIRED",status_code=status.HTTP_401_UNAUTHORIZED)
    except JWTError:
        raise HTTPException(detail="TOKEN IS INVALID",status_code=status.HTTP_401_UNAUTHORIZED)


def encode_token(username:str,email:str):
    try:
        payload = {
            "sub": json.dumps(
                    {
                        "username":username,
                        "email":email
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
def login(form_data: RequestForm = Depends()) -> JSONResponse:
    actions = UserActions()
    user = actions.validate_user(username=form_data.username,password=form_data.password)
    if not user:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="INVALID CREDENTIALS",
            )
    token = encode_token(user.username,user.email)
    response = JSONResponse(content={"access_token": token, "token_type": "bearer"},status_code=status.HTTP_200_OK)
    
    return response

