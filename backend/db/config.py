from sqlalchemy import create_engine,text
from sqlalchemy.orm import declarative_base,sessionmaker
from ..utils.env import USER,HOST,PASSWORD,DATABASE

engine = create_engine(f"postgresql+psycopg://{USER}:{PASSWORD}@{HOST}/{DATABASE}")

SessionMaker = sessionmaker(bind=engine)

Base = declarative_base()