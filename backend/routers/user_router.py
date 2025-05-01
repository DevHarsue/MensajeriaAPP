from fastapi import APIRouter,status,Query,HTTPException
from fastapi.responses import JSONResponse
# from typing import List
from ..models.user_model import UserRequest,UserResponse,UsersResponse
from ..models.validations import validate_email
from ..actions.user_actions import UserActions
from ..actions.code_actions import CodeActions

user_router = APIRouter()

@user_router.post("/",status_code=status.HTTP_201_CREATED)
def create_user(user: UserRequest) -> UserResponse:
    
    code_actions = CodeActions()
    if not code_actions.validate_code(email=user.email,code=user.code):
        return JSONResponse("Code Incorrect", status_code=status.HTTP_409_CONFLICT)
    
    actions = UserActions()
    user_response = actions.create_user(user)
    if isinstance(user_response,str):
        return JSONResponse(content=user_response,status_code=status.HTTP_409_CONFLICT)
    
    if not user_response:
        return JSONResponse(content="User not Created",status_code=status.HTTP_400_BAD_REQUEST)
    
    return JSONResponse(content=user_response.model_dump(),status_code=status.HTTP_201_CREATED)


@user_router.get("/",status_code=status.HTTP_200_OK)
def get_search_users(
        text: str = Query(min_length=2),
        page: int = Query(1,ge=1), 
        limit: int = Query(10,le=100)
    ) -> UsersResponse:
    actions = UserActions()
    users_response = actions.search_users(text=text,page=page,limit=limit)
    
    return JSONResponse(content=users_response.model_dump(),status_code=status.HTTP_200_OK)

@user_router.get("/get_user_by_email",status_code=status.HTTP_200_OK)
def get_user_by_email(email: str = Query(example="example@example.com")) -> UsersResponse:
    email = email.upper()
    if not validate_email(email=email):
        raise HTTPException(detail="Invalid Email",status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
    
    actions = UserActions()
    user_response = actions.search_user_by_email(email=email)
    
    if not user_response:
        return JSONResponse(content="User not Found",status_code=status.HTTP_404_NOT_FOUND)
        
    return JSONResponse(content=user_response.model_dump(),status_code=status.HTTP_200_OK)