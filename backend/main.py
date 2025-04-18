from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from routers.ws_router import ws_router

app = FastAPI()


@app.get("/")
async def get():
    with open("backend/test.html",mode="r") as file:
        html = file.read()
        return HTMLResponse(html)

app.include_router(ws_router, tags=["websocket"])
