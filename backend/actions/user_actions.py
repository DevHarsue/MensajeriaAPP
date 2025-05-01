from .with_session import with_session
from ..models.user_model import UserRequest,UserResponse,UsersResponse,MetaRegisters
from ..utils.encrypt import hash_password,verify_password
from sqlalchemy.orm.session import Session
from sqlalchemy import select
from sqlalchemy.sql.operators import ilike_op
from sqlalchemy.sql.functions import count
from sqlalchemy.exc import IntegrityError
from ..db.db_models import User

class UserActions:
    
    @with_session
    def create_user(self,session: Session, user_request: UserRequest) -> UserResponse:
        try:
            user_db = User(
                    username=user_request.username,
                    email=user_request.email,
                    password=hash_password(user_request.password)
                )
            session.add(user_db)
            session.commit()
        except IntegrityError:
            return "Username or email is already in use"
        except Exception as e:
            return False
        
        return UserResponse(
            username=user_db.username,
            email=user_db.email
        )
    
    @with_session
    def search_users(self, session: Session, text: str, page: int, limit: int) -> UsersResponse:
        """
            text: str // Text to filter
            page: int // Number of Page
            limit: int // Limit per Page
        """
        offset = (page-1) * limit
        
        try:
            query = select(count(User.user_id)).where(
                (ilike_op(User.username,f"%{text}%")) |
                (ilike_op(User.email,f"%{text}%")) 
            )
            
            total = session.execute(query).fetchone()[0]
            total_pages = (total + limit - 1) // limit
            
            query = select(User).where(
                (ilike_op(User.username,f"%{text}%")) |
                (ilike_op(User.email,f"%{text}%")) 
            ).offset(offset).limit(limit)
            
            result = session.execute(query).all()
            
            users = [UserResponse(
                    username=user[0].username,
                    email=user[0].email
                ) for user in result]
            
            
            return UsersResponse(
                users=users,
                meta=MetaRegisters(
                    total=total,
                    total_pages=total_pages,
                    page=page,
                    limit=limit
                )
            )
            
        except Exception as e:
            print(e)
            print(e.__class__)
        return False
    
    @with_session
    def search_user_by_email(self, session: Session, email: str) -> UserResponse | None:
        try:
            query = select(User).where(User.email==email)
            user_db = session.execute(query).fetchone()
            if user_db:
                return UserResponse(
                    username=user_db[0].username,
                    email=user_db[0].email
                )
        except Exception as e:
            print(e)
            print(e.__class__)
            
        return None

    @with_session
    def validate_user(self,session: Session, username: str, password: str) -> UserResponse | None:
        try:
            query = select(User).where(User.username==username)
            user_db = session.execute(query).fetchone()
            if not user_db:
                return None
            if verify_password(password=password,hashed_password=user_db[0].password):
                return UserResponse(username=username,email=user_db[0].email)
        except Exception as e:
            print(e)
            print(e.__class__)
            
        return None