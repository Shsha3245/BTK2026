import os
import fitz

def get_pdf_knowledge():
    combined_knowledge=""
    docs_path = "documents"
    if not os.path.exists(docs_path):
        return "HATA: mevzuat bulunmadı"
    
    files = [f for f in os.listdir(docs_path) if f.endswith('.pdf')]

    if not files:
        return "HATA : kalsörde pdf dökümanı bulunamadı"
    
    for file_name in files:
        file_path = os.path.join(docs_path, file_name)
        try:
            doc = fitz.open(file_path)
            # Döküman başlığını net bir şekilde belirtiyoruz
            combined_knowledge += f"\n\n=== DÖKÜMAN: {file_name} BAŞLANGICI ===\n"
            
            for page_num, page in enumerate(doc):
                # Sayfa numaralarını ekliyoruz ki AI "Sayfa X'e göre" diyebilsin
                text = page.get_text("text")
                # Gereksiz boşlukları temizleyerek token tasarrufu sağlıyoruz
                clean_text = " ".join(text.split()) 
                combined_knowledge += f"\n[Dosya: {file_name}, Sayfa: {page_num + 1}]\n{clean_text}\n"
                
            combined_knowledge += f"=== DÖKÜMAN: {file_name} SONU ===\n"
            doc.close()
            
        except Exception as e:
            print(f"HATA: {file_name} işlenirken sorun oluştu: {e}")

    # AI'ya dökümanlar arasında nasıl bağ kuracağını hatırlatan bir not ekliyoruz
    return combined_knowledge
