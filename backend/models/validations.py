from re import fullmatch

regex_email = r"^(?!.*\+\d@)(?:[^@]+@[^@]+\.[^@]+)$"
def validate_email(email: str) -> bool:
    return bool(fullmatch(regex_email, email.upper()))