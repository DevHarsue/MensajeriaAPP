from jose import jwt
from fastapi import HTTPException,status,Depends,APIRouter,Form,Request,Response
from fastapi.responses import JSONResponse
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer
from jose.exceptions import JWTError,ExpiredSignatureError
import json
from datetime import datetime,UTC,timedelta
from ..utils.env import ALGORITHM,SECRET_KEY,ENV
from ..actions.user_actions import UserActions

oauth2_scheme = OAuth2PasswordBearer("/token",auto_error=False)

def validate_token(token:str) -> dict | None:
    try:
        data = json.loads(verify_token(token))
    except Exception as e:
        return None
    return data

async def get_token_from_cookie_or_header(request: Request,access_token_header: str = Depends(oauth2_scheme)) -> str:
    access_token_cookie = request.cookies.get("access_token")
    if access_token_cookie:
        return access_token_cookie
    
    return access_token_header

def get_data_token(access_token: str = Depends(get_token_from_cookie_or_header)):
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

def get_domain(request: Request) -> str | None:
    host = request.headers.get("x-forwarded-host", "")
    print(host)
    if not host:
        host = request.headers.get("host", "").split(":")[0]
        print(host)
        
    cookie_domain = f".{host}" if not host.startswith("localhost") else None
    
    return cookie_domain

class RequestForm:
    def __init__(self,username: str = Form(...), password: str = Form(...)):
        self.username = username.upper()
        self.password = password

@token_router.post("/token")
def login(request: Request, form_data: RequestForm = Depends()) -> JSONResponse:
    actions = UserActions()
    user = actions.validate_user(username=form_data.username,password=form_data.password)
    if not user:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="INVALID CREDENTIALS",
            )
    token = encode_token(user.username,user.email)
    response = JSONResponse(content={"access_token": token, "token_type": "bearer"},status_code=status.HTTP_200_OK)
    # cookie_domain = get_domain(request=request)
    # response.set_cookie(
    #     key="access_token",
    #     value=token,
    #     max_age=86400*7,  
    #     httponly=True,  
    #     secure=ENV=="production",
    #     samesite="none" if ENV=="production" else "lax",
    #     partitioned=True,
    #     # domain=cookie_domain,
    # )
    cookie_value = (
        f"access_token={token}; "
        f"Secure={ENV=="production"}; "
        f"HttpOnly; "
        f"SameSite={"none" if ENV=="production" else "lax"}; "
        f"Partitioned; "  
        f"Max-Age={86400*7}; "
        f"Path=/; "
    )
    
    response.headers.append("Set-Cookie", cookie_value)
    
    return response

