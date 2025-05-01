import bcrypt
import random

def hash_password(password: str):
    return (bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12))).decode("utf-8")

def verify_password(password: str, hashed_password: str):
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

def generate_code()-> int:
    return int(random.randrange(100000,999999))