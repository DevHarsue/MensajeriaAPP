from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict,List,FrozenSet
from pydantic import BaseModel,field_serializer
from datetime import datetime


active_connections: Dict[str, WebSocket] = {}

class Message(BaseModel):
    date: datetime
    sender: str
    content: str
    
    @field_serializer('date')
    def date_to_isoformat(self, value: datetime) -> str:
        return value.isoformat()
    
chats: Dict[FrozenSet,List[Message]] = {}

ws_router = APIRouter()

@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # El cliente envía su nombre de usuario
        username = await websocket.receive_text()
        username = username.upper()
        if active_connections.get(username):
            await websocket.send_json({
                    "type": "alert",
                    "content": "Ya hay un usuario con ese nombre."
                })
            await websocket.close()
            return
        
        # Guardar la conexión activa con el nombre de usuario
        active_connections[username] = websocket
        
        # Notificar a todos la nueva lista de usuarios
        await broadcast_user_list()
        
        while True:
            # Recibir mensajes y reenviar al destinatario
            data = await websocket.receive_json()
            if data["type"] == "fetch_chat":
                user_ws = active_connections.get(data['username'])
                chat = chats.get(frozenset({data["username"],data["recipient"]}))
                print(chat)
                await user_ws.send_json({
                    "type": "chat_response",
                    "content": [m.model_dump() for m in chat] if chat else None
                })
                print({
                    "type": "chat_response",
                    "content": [m.model_dump() for m in chat] if chat else None
                })
                continue
            
            recipient_ws = active_connections.get(data['recipient'])
            if recipient_ws:
                await recipient_ws.send_json({
                    "type": "message",
                    "sender": username,
                    "content": data['content']
                })
                key = frozenset({data["username"],data["recipient"]})
                message = Message(date=datetime.now(),sender=data["username"],content=data['content'])
                if not chats.get(key):
                    chats[key] = [message]
                else:
                    chats[key].append(message)
                
    except WebSocketDisconnect as e:
        print(e)
        del active_connections[username]
        await broadcast_user_list()

async def broadcast_user_list():
    user_list = list(active_connections.keys())
    for connection in active_connections.values():
        await connection.send_json({
            "type": "user_list",
            "users": user_list
        })