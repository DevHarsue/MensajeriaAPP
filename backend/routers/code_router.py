from fastapi import APIRouter,status,Query,HTTPException,Body
from fastapi.responses import JSONResponse
from ..models.validations import validate_email
from ..actions.code_actions import CodeActions
from ..utils.encrypt import generate_code
from ..utils.email import SenderEmail

code_router = APIRouter()


@code_router.get("/",status_code=status.HTTP_200_OK)
def validate_code(code: int = Query(ge=100000,le=999999),email: str = Query(example="example@example.com")) -> JSONResponse:
    email = email.upper()
    if not validate_email(email=email):
        raise HTTPException(detail="Invalid Email",status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
    actions = CodeActions()
    if not actions.validate_code(email=email,code=code):
        return JSONResponse("Code Incorrect", status_code=status.HTTP_409_CONFLICT)
    
    return JSONResponse(content="Code Correct", status_code=status.HTTP_200_OK)

@code_router.post("/",status_code=status.HTTP_201_CREATED)
def create_code(email: str = Body(example="example@example.com")) -> JSONResponse:
    email = email.upper()
    if not validate_email(email=email):
        raise HTTPException(detail="Invalid Email",status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
    code = generate_code()
    actions = CodeActions()
    
    code = actions.create_code(email=email,code=code)
    
    if not code:
        JSONResponse(content="Code not Created",status_code=status.HTTP_400_BAD_REQUEST)
    
    sender = SenderEmail()
    sender.send_email_code(code=code,receiver=email)
    
    return JSONResponse(content={"code":code},status_code=status.HTTP_201_CREATED)