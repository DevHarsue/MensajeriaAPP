from ..db.config import SessionMaker
from functools import wraps

def with_session(func):
    @wraps(func)
    def wrapper(self,*args,**kwargs):
        with SessionMaker() as session:
            try:
                result = func(self, session, *args, **kwargs) 
                return result
            except Exception:  
                session.rollback()  
                raise 
    
    return wrapper