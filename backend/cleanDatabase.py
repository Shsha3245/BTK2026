import os
from sqlalchemy import create_engine, MetaData
from database import SQLALCHEMY_DATABASE_URL  # database.py içindeki URL tanımına göre

def clear_database():
    # local.db yolunu kontrol et veya direkt mevcut URL'i kullan
    print("Veritabanı temizleme işlemi başlatılıyor...")
    
    try:
        engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
        meta = MetaData()
        meta.reflect(bind=engine)
        
        # Veritabanındaki tüm tabloları sırayla siler
        meta.drop_all(bind=engine)
        print("🚀 Tüm eski tablolar ve test kayıtları başarıyla silindi!")
        print("Uvicorn'u yeniden başlattığında tabloların temiz bir şekilde sıfırdan kurulacak.")
        
    except Exception as e:
        print(f"Temizleme esnasında bir hata oluştu: {str(e)}")

if __name__ == "__main__":
    clear_database()
    