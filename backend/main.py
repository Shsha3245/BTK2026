from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
import json
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

# Senin importların
from models.schemas import UserProfile, UserLogin, UserRegister
from services.ai_service import get_ai_analysis
from services.auth_service import verify_password, get_password_hash, create_access_token
from database import get_db, User, AnalysisHistory
from services.email_service import send_welcome_mail

app = FastAPI(title="Neo-Advice AI Backend")

# CORS Katmanı
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GLOBAL_MEVZUAT_DATA = None

def load_mevzuat_and_assets():
    """
    Mevzuat ve varlık dökümanlarını yükleyen yardımcı fonksiyon.
    Hata veren ve yüksek token tüketen PDF okuyucu devreden çıkarıldı, 
    yerine hafifletilmiş ve optimize SPK Özet Mevzuatı entegre edildi.
    """
    global GLOBAL_MEVZUAT_DATA
    if GLOBAL_MEVZUAT_DATA is None:
        print("Mevzuat dökümanları analiz için hazırlanıyor...")
        GLOBAL_MEVZUAT_DATA = """
        [SPK Yatırım Hizmetleri ve Varlık Çeşitlendirme Tebliği - ÖZET REHBER]
        1. Çeşitlendirme İlkesi: Risk yönetimi gereği tek bir hisse senedi veya yatırım fonuna toplam portföy bütçesinin %20'sinden fazlası bağlanamaz.
        2. Düşük Risk Uyumluluğu: Defansif profillerde portföyün en az %50'si korumacı enstrümanlarda (Para Piyasası Fonları, Kısa Vadeli Tahviller, Altın) tutulmalıdır. Kaldıraçlı ve yüksek volatilite içeren işlemler önerilemez.
        3. Yüksek Risk Uyumluluğu: Dinamik ve büyüme odaklı portföylerde, BIST payları ve hisse yoğun fonların ağırlığı %70'e kadar çıkabilir. Ancak olası düzeltmeler için en az %10 nakit veya likit defansif varlık tamponu zorunludur.
        4. Bilgilendirme Yükümlülüğü: Üretilen dağılımlar algoritmik model portföy simülasyonu olup, kesin yatırım tavsiyesi taahhüdü barındırmaz.
        """
        print("Mevzuat yükleme başarılı!")
    
    with open('assets.json', 'r', encoding='utf-8') as f:
        assets = json.load(f)
    
    return GLOBAL_MEVZUAT_DATA, assets


@app.post("/analyze")
async def analyze_investment_profile(profile: UserProfile, db: Session = Depends(get_db)):
    try:
        mevzuat, assets = load_mevzuat_and_assets()
        
        try:
            user_data = profile.model_dump()
        except AttributeError:
            user_data = profile.dict()

        print(f"Soru-Cevap İşleniyor: {user_data.get('age')} yaşında, {user_data.get('risk_tolerance')} risk profili.")
        
        # AI Servisini çağır
        analysis_result = get_ai_analysis(user_data, mevzuat, assets)
        
        # SQLite veritabanına kaydet
        new_history = AnalysisHistory(
            age=user_data.get('age'),
            risk_tolerance=user_data.get('risk_tolerance'),
            investment_goal=user_data.get('investment_goal', 'Genel Yatırım'),
            amount=user_data.get('amount', 0),
            result_json=analysis_result
        )
        db.add(new_history)
        db.commit()
        db.refresh(new_history)
        
        return analysis_result

    except Exception as e:
        print(f"HATA OLUŞTU (/analyze): {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    age: int = Form(...),
    risk_tolerance: str = Form("Orta"),
    db: Session = Depends(get_db)
):
    try:
        mevzuat, assets = load_mevzuat_and_assets()
        image_bytes = await file.read()
        
        user_data = {
            "age": age,
            "risk_tolerance": risk_tolerance,
            "investment_goal": f"Portföy Doktoru Taraması ({file.filename})",
            "amount": 0
        }
        
        print(f"Görsel/OCR İşleniyor: {file.filename}, {age} Yaş, {risk_tolerance} Risk")
        
        # Resim baytlarını ve yeni modeli tetikliyoruz
        analysis_result = get_ai_analysis(user_data, mevzuat, assets, image_bytes=image_bytes) 
        
        new_history = AnalysisHistory(
            age=user_data["age"],
            risk_tolerance=user_data["risk_tolerance"],
            investment_goal=user_data["investment_goal"],
            amount=user_data["amount"],
            result_json=analysis_result
        )
        db.add(new_history)
        db.commit()
        db.refresh(new_history)
        
        return analysis_result

    except Exception as e:
        print(f"HATA OLUŞTU (/analyze-image): {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
async def get_analysis_history(db: Session = Depends(get_db)):
    try:
        history_records = db.query(AnalysisHistory).order_by(AnalysisHistory.id.desc()).all()
        return history_records
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geçmiş yüklenirken hata: {str(e)}")


@app.post("/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı.")
    
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_pw) 
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    try:
        send_welcome_mail(user_data.email)
    except Exception as e:
        print(f"E-posta gönderim hatası: {str(e)}")

    return {"message": "Kayıt başarılı, hoş geldiniz!"}


@app.post("/login")
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Hatalı email veya şifre.")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"} 


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)