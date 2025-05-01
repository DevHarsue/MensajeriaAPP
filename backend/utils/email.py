import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from .env import EMAIL,KEY_EMAIL
from fastapi.exceptions import HTTPException
from fastapi import status
from premailer import transform
import mimetypes
import os

class SenderEmail:
    def __init__(self):
        self.smtp_server = 'smtp.gmail.com'
        self.smtp_port = 587
        self.smtp_user = EMAIL
        self.smtp_password = KEY_EMAIL
    
    def send_email(self,receiver: str, subject: str, body: dict, html_path: str,images:dict):
        # Creación del mensaje de correo electrónico
        msg = MIMEMultipart("related")
        msg['From'] = self.smtp_user
        msg['To'] = receiver
        msg['Subject'] = subject
        
        
        with open(html_path,encoding="utf-8") as f:
            html = f.read()
        
        body_html = transform(html)
        for key,value in body.items():
            body_html = body_html.replace(key,str(value))
        
        # Cuerpo del mensaje
        msg.attach(MIMEText(body_html, 'html','utf-8'))
        
        for cid, image_path in images.items():
            with open(image_path, 'rb') as img_file:
                img_data = img_file.read()
            
            mime_type, _ = mimetypes.guess_type(image_path)
            if mime_type and mime_type.startswith('image/'):
                subtype = mime_type.split('/')[1]
            else:
                subtype = 'jpeg'  # Default
        
            img_part = MIMEImage(img_data, _subtype=subtype)
            img_part.add_header('Content-ID', f'<{cid}>')
            img_part.add_header('Content-Disposition', 'inline', filename=os.path.basename(image_path))
            msg.add_header('Content-Type', 'text/html; charset=UTF-8')
            msg.attach(img_part)

        # Enviar el correo electrónico
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.sendmail(self.smtp_user, receiver, msg.as_string())
            server.quit()
            return True
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error sender email: {str(e)}")
    
    def send_email_code(self, code:int, receiver:str):
        images = {
            "logo": "backend/utils/model_email/logo.png"
        }
        return self.send_email(
                receiver=receiver,
                subject="Codigo de Verificación",
                body={"{{ code }}":code},
                html_path="backend/utils/model_email/code.html",
                images=images
            )
        