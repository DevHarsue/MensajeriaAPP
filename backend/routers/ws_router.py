from fastapi import APIRouter, WebSocket, WebSocketDisconnect,status
from ..actions import message_actions as mA, user_actions as uA
from typing import Dict
from .token_router import validate_token

active_connections: Dict[str, WebSocket] = {}

ws_router = APIRouter()

def validate_session(ws: WebSocket) -> dict | None:
    cookies = ws._cookies 
    token = cookies.get("token")
    data = validate_token(token=token)
    return data

@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    data_user = validate_session(websocket)
    if not data_user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    
    try:
        if active_connections.get(data_user["username"]):
            await websocket.send_json({
                    "type": "alert",
                    "content": "Ya tienes una sesion abierta."
                })
            await websocket.close()
            return
        
        active_connections[data_user["username"]] = websocket
        await broadcast_user_list()
        while True:
            data = await websocket.receive_json()
            if not data.get("type"):
                await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
            
            message_actions = mA.MessageActions()   
            user_actions = uA.UserActions()
            id_users = user_actions.get_id_users_by_username(username_1=data_user["username"],username_2=data["recipient"])
            ids = tuple(id[1] for id in id_users.items())
            chat_id = message_actions.exist_chat(user_ids=ids)
            match data["type"]:
                case "fetch_chat":
                    user_ws = active_connections.get(data_user['username'])
                    chat = message_actions.get_chat(chat_id=chat_id)
                    await user_ws.send_json({
                        "type": "chat_response",
                        "content": [m.model_dump() for m in chat] if chat else None
                    })
                case "send_message":
                    recipient_ws = active_connections.get(data['recipient'])
                    if recipient_ws:
                        await recipient_ws.send_json({
                            "type": "message",
                            "sender": data_user["username"],
                            "content": data['content']
                        })
                    # Para registrar en la BD
                    if not chat_id:
                        chat_id = message_actions.create_chat(user_ids=ids)
                    message_actions.create_message(chat_id=chat_id,user_id=id_users[data_user["username"]],content=data["content"])
                    
                case _:
                    await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
    except WebSocketDisconnect as e:
        print(e)
        if data_user:
            del active_connections[data_user["username"]]
            await broadcast_user_list()

async def broadcast_user_list():
    user_list = list(active_connections.keys())
    for connection in active_connections.values():
        await connection.send_json({
            "type": "user_list",
            "users": user_list
        })