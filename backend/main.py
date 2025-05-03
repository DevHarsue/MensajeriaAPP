from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.ws_router import ws_router
from .routers.user_router import user_router
from .routers.code_router import code_router
from .routers.token_router import token_router

app = FastAPI(
    title="API MESSAGING-APP",
    version="1.2.1"
)

origins = [
    "http://localhost",
    "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return "API RUNNING"

app.include_router(token_router, tags=["token"])
app.include_router(ws_router, tags=["websocket"])
app.include_router(user_router, tags=["users"], prefix="/users")
app.include_router(code_router, tags=["codes"], prefix="/codes")
