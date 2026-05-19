import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from services.bist_service import get_bist_stock_price

# .env dosyasındaki GEMINI_API_KEY'i yüklüyoruz
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_ai_analysis(user_data: dict, mevzuat_data: str, assets_data: list, image_bytes: bytes = None) -> dict:
    """
    Kullanıcı verilerini, SPK mevzuatını, genel asset havuzunu ve 
    canlı BIST fiyatlarını birleştirerek Gemini modelinden derinlemesine analiz alır.
    Eğer image_bytes varsa, Gemini 2.5 Flash modeline multimodal (görsel) olarak besler.
    """
    
    is_ocr_mode = "Portföy Doktoru" in user_data.get("investment_goal", "") or image_bytes is not None

    # 1. Canlı BIST Verilerini Toplama
    populer_hisseler = ["THYAO", "EREGL", "ASELS", "TUPRS", "BIMAS", "GARAN"]
    bist_canli_havuz = {}
    
    for ticker in populer_hisseler:
        fiyat = get_bist_stock_price(ticker)
        if fiyat:
            bist_canli_havuz[ticker] = f"{fiyat} TL"
        else:
            bist_canli_havuz[ticker] = "Veri alınamadı"

    # 2. Sistem ve Kullanıcı Prompt Yapısını Kurgulama (Derinlemesine Analiz Zorunluluğu ile)
    if is_ocr_mode:
        prompt = f"""
        Sen SPK mevzuatına tam uyumlu çalışan kıdemli bir Portföy Doktoru ve OCR Analistisin.
        Kullanıcı sana mevcut yatırım hesabının veya varlık dağılımının bir ekran görüntünü yükledi.
        
        GÖREVİN (Kestirip atmadan, jüriye sunulacak derinlikte detaylıca açıkla):
        1. Ekteki görselde tespit ettiğin tüm fonları, hisse kodlarını ve varlıkları TEK TEK ismen zikrederek yapısal analiz et.
        2. "Bu portföy SPK'ya uygundur" deyip geçme! Kullanıcının risk toleransına ({user_data.get('risk_tolerance')}) ve yaşına ({user_data.get('age')}) göre mevcut dağılımı sertçe eleştir. Hangi fonun/hissenin neden aşırı yoğunlaştığını veya eksik kaldığını gerekçelendir.
        3. Paylaşılan CANLI BIST PİYASA VERİLERİ'ni ({json.dumps(bist_canli_havuz, ensure_ascii=False)}) baz alarak, eldeki BIST varlıklarının güncel fiyat durumlarını rasyonel olarak yorumla.
        4. SPK kuralları çerçevesinde riskleri dağıtmak için kullanıcının yapması gereken net bir re-balans (yeniden dengeleme) stratejisi sun. Hangi enstrümanlara kayması gerektiğini açıkla.
        
        Aşağıdaki Güncel Verileri Kesinlikle Referans Al:
        - Canlı BIST Fiyat Havuzu: {json.dumps(bist_canli_havuz, ensure_ascii=False)}
        - Referans Alacağın Yasal Mevzuat Özet Bilgisi: {mevzuat_data}
        - Öneride Kullanabileceğin Alternatif Yatırım Enstrümanları: {json.dumps(assets_data, ensure_ascii=False)}
        
        Kullanıcı Bilgileri:
        - Yaş: {user_data.get('age')}
        - Risk Toleransı: {user_data.get('risk_tolerance')}
        """
    else:
        prompt = f"""
        Sen SPK mevzuatına tam uyumlu çalışan kıdemli bir Robotik Portföy Yatırım Danışmanısın.
        Kullanıcı sana yatırım hedeflerini form doldurarak manuel iletti.
        
        GÖREVİN (Kestirip atmadan, derinlemesine ve profesyonelce açıkla):
        1. Sıfırdan, kullanıcının bütçesine ({user_data.get('amount')} TL) ve hedeflerine tam oturan optimize bir varlık sepeti (% oranlarıyla) oluştur.
        2. Önerdiğin sepetin içindeki enstrümanları (Para piyasası fonu, hisse senedi yoğun fon, Eurobond, altın vs.) TEK TEK alt alta listele. "Yasal mevzuata uygundur" deyip geçiştirme! Her bir enstrümanın ismini açıkça yazarak; "Bu fonu/hisseyi şu finansal gerekçeyle, risk profilinizle olan şu uyumu nedeniyle ve SPK'nın çeşitlendirme kuralları gereği sepetimize %X oranında ekliyoruz" şeklinde her birini detaylıca anlat.
        3. Sepete BIST hisseleri serpiştireceksen, aşağıdaki canlı fiyat havuzunu referans alarak tahmini adet/maliyet simülasyonu fısılda.
        
        Aşağıdaki Güncel Verileri Kesinlikle Referans Al:
        - Canlı BIST Fiyat Havuzu: {json.dumps(bist_canli_havuz, ensure_ascii=False)}
        - Referans Alacağın Yasal Mevzuat Özet Bilgisi: {mevzuat_data}
        - Kullanabileceğin Enstrüman Havuzu: {json.dumps(assets_data, ensure_ascii=False)}
        
        Kullanıcı Form Verileri:
        - Yaş: {user_data.get('age')}
        - Risk Toleransı: {user_data.get('risk_tolerance')}
        - Yatırım Amacı / Hedef: {user_data.get('investment_goal')}
        - Yatırım Tutarı: {user_data.get('amount')} TL
        """

    try:
        # 3. Gemini 2.5 Flash Model Tanımı
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        
        contents = [prompt]
        
        if image_bytes:
            contents.append({
                "mime_type": "image/png",
                "data": image_bytes
            })
            
        response = model.generate_content(contents)
        ai_text_output = response.text
        
        # 4. Frontend Grafik Barlarını Risk Profiline Göre Dinamik Hesaplama
        hisse_orani = 50 if user_data.get('risk_tolerance') == 'Yüksek' else (25 if user_data.get('risk_tolerance') == 'Düşük' else 35)
        fon_orani = 30 if user_data.get('risk_tolerance') == 'Yüksek' else (45 if user_data.get('risk_tolerance') == 'Düşük' else 40)
        defansif_oran = 100 - (hisse_orani + fon_orani)

        return {
            "status": "completed",
            "mode": "ocr" if is_ocr_mode else "manual",
            "analysis": ai_text_output,
            "portfoy": [
                {
                    "varlik": "BIST Hisse Senedi Payları (Model Portföy)", 
                    "oran": hisse_orani, 
                    "neden": "Canlı BIST havuzundaki güçlü şirketlerle büyüme odaklı yaklaşım."
                },
                {
                    "varlik": "Yatırım Fonları (Emtia & Para Piyasası)", 
                    "oran": fon_orani, 
                    "neden": "Mevzuat sınırlarına takılmamak ve sepet çeşitliliğiyle riski dağıtmak amacıyla dengeli dağılım."
                },
                {
                    "varlik": "Altın / Devlet Tahvili / Nakit", 
                    "oran": defansif_oran, 
                    "neden": "Olası piyasa düzeltmelerine karşı portföyü sigortalama ve defansif güç oluşturma."
                }
            ]
        }
        
    except Exception as e:
        print(f"Gemini API Hatası: {str(e)}")
        return {
            "status": "completed",
            "analysis": f"Analiz oluşturulurken teknik bir hata yaşandı: {str(e)}",
            "portfoy": [{"varlik": "Genel Dağılım", "oran": 100, "neden": "Yedek mod devrede."}]
        }