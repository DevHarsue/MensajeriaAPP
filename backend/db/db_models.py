from sqlalchemy import Column, Integer,ForeignKey,Text,CHAR,TIMESTAMP,Enum,text
from .config import Base,engine,SessionMaker

status = ("sent","delivered","read")

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True,autoincrement=True)
    username = Column(Text, unique=True, nullable=False)
    email = Column(Text, nullable=False,unique=True)
    password = Column(CHAR(60), nullable=False)

class UserToken(Base):
    __tablename__ = 'users_token'
    user_token_id = Column(Integer, primary_key=True,autoincrement=True)
    user_id = Column(Integer,ForeignKey("users.user_id"),nullable=False)
    token = Column(Text, nullable=False)

class Code(Base):
    __tablename__ = 'codes'
    code_id = Column(Integer, primary_key=True,autoincrement=True)
    email = Column(Text, nullable=False,unique=True)
    code = Column(Integer, nullable=False)

class Chat(Base):
    __tablename__ = 'chats'
    chat_id = Column(Integer, primary_key=True,autoincrement=True)
    
class Participant(Base):
    __tablename__ = 'participants'
    participant_id = Column(Integer, primary_key=True,autoincrement=True)
    chat_id = Column(Integer,ForeignKey("chats.chat_id"),nullable=False)
    user_id = Column(Integer,ForeignKey("users.user_id"),nullable=False)

class Message(Base):
    __tablename__ = 'messages'
    message_id = Column(Integer, primary_key=True,autoincrement=True)
    chat_id = Column(Integer,ForeignKey("chats.chat_id"),nullable=False)
    participant_id = Column(Integer,ForeignKey("participants.participant_id"),nullable=False)
    content = Column(Text,nullable=False)
    status = Column(Enum(*status,name="status_enum"),nullable=False)
    timestamp = Column(TIMESTAMP,nullable=False,server_default=text("CURRENT_TIMESTAMP"))

# Create tables
Base.metadata.create_all(bind=engine)

# Create triggers and functions
with open("backend/db/db.sql","r") as file:
    sql = text(file.read())
    
with SessionMaker() as session:
    session.execute(sql)
    session.commit()
