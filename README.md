# 🚀 NEO-ADVICE AI — Yapay Zekâ Destekli Stratejik Varlık Dağılımı ve Portföy Optimizasyon Platformu

**2026 BTK Hackathonu** kapsamında geliştirilen **NEO-ADVICE AI**, yatırımcıların yaş, hedef bütçe ve risk toleranslarını analiz ederek onlara canlı piyasa verileri ve gelişmiş AI algoritmalarıyla optimize edilmiş stratejik varlık dağılım önerileri sunan tam katmanlı (Full-Stack) bir finansal teknoloji çözümüdür.

Platform, modern bir **Next.js** frontend arayüzü ile güçlü ve asenkron bir **FastAPI** backend mimarisini monorepo yapısında bir araya getirir.

---

## 🌟 Öne Çıkan Özellikler

- **Kişiselleştirilmiş Yatırım Analizi:** Yatırımcının yaşına, hedef bütçesine ve risk profiline (Düşük, Dengeli, Yüksek) göre dinamik portföy modellemesi.
- **Stratejik Varlık Dağılım Önerisi:** BIST Hisse Senedi Payları (Model Portföy), Yatırım Fonları (Emtia & Para Piyasası) ve Altın / Devlet Tahvili / Nakit varlık grupları arasında akıllı ağırlıklandırma.
- **Yapay Zekâ Entegrasyonu:** Portföy seçimlerinin arkasındaki rasyoneli açıklayan, tamamen Gemini API tabanlı dinamik uzman analiz raporları.
- **Gelişmiş Veri Görselleştirme:** Portföy ağırlıklarını, risk limitlerini ve tarihsel analiz geçmişini canlı grafikler ve ilerleme çubukları (progress bars) ile sunan karanlık mod odaklı modern UI.
- **Geçmiş Analiz Yönetimi:** Kullanıcının geçmiş simülasyonlarını veri tabanında (SQLAlchemy tabanlı) saklayan ve dilediğinde detaylı paneliyle incelemesine olanak tanıyan asenkron geçmiş sistemi.

---

## 📁 Proje Klasör Yapısı (Monorepo)

```text
2026HACKATHONBTK/
├── backend/               # FastAPI Backend Uygulaması
│   ├── main.py            # API Giriş Noktası ve Endpoint Tanımları
│   ├── requirements.txt   # Python Bağımlılıkları
│   └── ...                # Veri Tabanı Modelleri ve AI Entegrasyon Kodları
├── frontend/              # Next.js Frontend Uygulaması
│   ├── app/               # Next.js App Router (Dashboard, Sayfalar, Bileşenler)
│   ├── public/            # Statik Varlıklar (Görseller, İkonlar)
│   ├── package.json       # Node.js Bağımlılıkları
│   └── tsconfig.json      # TypeScript Yapılandırması
├── venv/                  # Python Sanal Ortamı (Git tarafından yoksayılır)
└── .gitignore             # Tüm Monorepo için Ortak Git Yoksayma Dosyası
