import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def send_welcome_mail(user_email: str):
    """
    Kayıt olan kullanıcıya Neo-Advice AI sistemine hoş geldin 
    mesajı içeren şık bir HTML maili gönderir.
    """
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD") # Gmail kullanıyorsan "Uygulama Şifresi" gelmeli
    
    # .env konfigürasyonu eksikse sistemin çökmesini engelle
    if not sender_email or not sender_password:
        print("E-posta gönderim ayarları eksik (.env kontrol et). Mail gönderilemedi.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Neo-Advice AI Dünyasına Hoş Geldiniz! 🚀"
    msg["From"] = f"Neo-Advice AI Team <{sender_email}>"
    msg["To"] = user_email

    # Frontend koyu temasına uygun şık HTML şablonu
    html_content = f"""
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0e14; color: #ffffff; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f141c; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -1px;">
              NEO-ADVICE <span style="color: #10b981;">AI</span>
            </h2>
          </div>
          
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
          
          <p style="font-size: 16px; line-height: 1.6; color: #d1d5db;">
            Merhaba, 
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            <strong>Neo-Advice AI</strong> platformuna başarıyla kayıt oldunuz! SPK mevzuatlarına tam uyumlu yapay zeka modülümüz ve canlı BIST veri entegrasyonumuzla yatırımlarınızı optimize etmeye hazırsınız.
          </p>
          
          <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #10b981; margin-top: 0; margin-bottom: 10px;">Şimdi Ne Yapabilirsiniz?</h4>
            <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.5;">
              <li><strong>Soru-Cevap Sihirbazı:</strong> Risk toleransınıza göre model portföy üretin.</li>
              <li><strong>Portföy Doktoru (OCR):</strong> Portföy ekran görüntünüzü yükleyip yapay zekaya analiz ettirin.</li>
              <li><strong>Canlı BIST Takibi:</strong> Gerçek zamanlı borsa rasyolarıyla hareket edin.</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #9ca3af; line-height: 1.6;">
            Uygulamaya hemen giriş yapmak için panelinizi ziyaret edebilirsiniz.
          </p>
          
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 30px; margin-bottom: 15px;">
          
          <p style="text-align: center; font-size: 12px; color: #6b7280; margin: 0;">
            Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.<br>
            © 2026 Neo-Advice AI. Tüm Hakları Saklıdır.
          </p>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:

            server.ehlo()
            server.starttls()
            server.ehlo()  # TLS güvenliğini başlatıyoruz
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, user_email, msg.as_string())
        
        print(f"Hoş geldin e-postası başarıyla gönderildi: {user_email}")
        return True
    except Exception as e:
        print(f"E-posta gönderilirken hata oluştu: {str(e)}")
        return False