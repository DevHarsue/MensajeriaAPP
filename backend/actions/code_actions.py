from .with_session import with_session
from sqlalchemy.orm.session import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from ..db.db_models import Code

class CodeActions:
        
    @with_session
    def create_code(self,session: Session,email: str,code:int) -> int:
        try:
            query = select(Code).where(Code.email==email)
            code_db = session.execute(query).fetchone()
            if code_db:
                session.delete(code_db[0])
                session.flush()
                
            code_db = Code(email=email,code=code)
            session.add(code_db)
            session.commit()
            
            return code
        except Exception as e:
            print(e)
            print(e.__class__)
        return False
    
    @with_session
    def validate_code(self,session: Session, email:str, code:int) -> bool:
        try:
            query = select(Code).where(Code.email==email)
            code_db = session.execute(query).fetchone()
            if code_db:
                return code_db[0].code == code
            
        except Exception as e:
            print(e)
            print(e.__class__)
            
        return False