from dotenv import load_dotenv
import os

load_dotenv()

USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
DATABASE = os.getenv("DATABASE")

ALGORITHM = os.getenv("ALGORITHM")
SECRET_KEY = os.getenv("SECRET_KEY")

URL_FRONTEND = os.getenv("URL_FRONTEND") 
ENV = os.getenv("ENV") 

EMAIL = os.getenv("EMAIL")
KEY_EMAIL = os.getenv("KEY_EMAIL")