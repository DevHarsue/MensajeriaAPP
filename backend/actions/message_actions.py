from sqlalchemy.orm.session import Session
from sqlalchemy import text,select,or_,join,desc
from sqlalchemy.sql.functions import count
from .with_session import with_session
from ..db.db_models import Message,Participant,User
from typing import Tuple,List
from ..models.message_model import MessageResponse

class MessageActions:
    @with_session
    def create_chat(self,session: Session,user_ids: Tuple[int]) -> int:
        try:
            text_sql = text("SELECT create_chat(:id_1,:id_2)")
            chat_id = session.execute(text_sql,{
                "id_1":user_ids[0],
                "id_2":user_ids[1]
            }).fetchone()[0]
            session.commit()
            return chat_id
        except Exception as e:
            print(e)
            print(e.__class__)
            
    @with_session
    def exist_chat(self,session: Session,user_ids: Tuple[int]) -> int:
        try:
            query = (select(Participant.chat_id)
                        .where(
                                or_(Participant.user_id==user_ids[0],
                                    Participant.user_id==user_ids[1])
                            )
                        .group_by(Participant.chat_id)
                        .order_by(desc(count(Participant.chat_id)))
                        .limit(1)
                    )
            print(query)
            chat_id = session.execute(query).fetchone()[0]
            return chat_id
        except Exception as e:
            print(e)
            print(e.__class__)
            
    @with_session
    def create_message(self, session:Session, chat_id:int, user_id: int, content:str):
        try:
            query = select(Participant.participant_id).where(Participant.user_id==user_id)
            participant_id = session.execute(query).fetchone()[0]
            message_db = Message(
                            chat_id=chat_id,
                            participant_id=participant_id,
                            content=content,
                            status="sent"
                        )
            session.add(message_db)
            session.commit()
        except Exception as e:
            print(e)
            print(e.__class__)
    
    @with_session
    def get_chat(self,session: Session, chat_id: int) -> List[MessageResponse]:
        try:
            j_1 = (
                    select(Message,Participant.user_id)
                    .select_from(
                        join(Message,Participant,Message.participant_id==Participant.participant_id)
                    )
                    .where(Message.chat_id==chat_id)
                )
            j = join(j_1,User,j_1.columns.user_id==User.user_id)
            query = select(User.username,j_1.columns.content,j_1.columns.timestamp).select_from(j).order_by(j_1.columns.timestamp)
            messages = session.execute(query).fetchall()
            messages = [MessageResponse(
                sender=m[0],
                content=m[1],
                date=m[2]
            ) for m in messages]
            return messages
        except Exception as e:
            print(e)
            print(e.__class__)
        
        return None