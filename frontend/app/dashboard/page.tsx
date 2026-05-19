"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, PlusCircle, History, User, ChevronRight, X, Camera, Sparkles, Loader2, Briefcase, HelpCircle, Upload, CheckCircle2, FileText } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Modal ve Form State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(null);
  const [formData, setFormData] = useState({ age: 22, risk_tolerance: 'Orta', investment_goal: '', amount: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        if (selectedAnalysis) {
          const updatedSelected = data.find((i: any) => i.id === selectedAnalysis.id);
          if (updatedSelected) setSelectedAnalysis(updatedSelected);
        }
      }
    } catch (err) {
      console.error("Geçmiş çekilirken hata oluştu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
    fetchHistory();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  // Dosya Seçim Kontrolü
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Form veya Görsel Gönderim Mekanizması
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let response;
      
      if (analysisMode === 'image') {
        // GÖRSEL ANALİZ (OCR) AKIŞI
        if (!selectedFile) {
          alert("Lütfen önce bir portföy ekran görüntüsü yükleyin.");
          setSubmitting(false);
          return;
        }
        
        const multipartData = new FormData();
        multipartData.append('file', selectedFile);
        multipartData.append('age', String(formData.age));
        multipartData.append('risk_tolerance', formData.risk_tolerance);

        response = await fetch('http://127.0.0.1:8000/analyze-image', {
          method: 'POST',
          body: multipartData,
        });
      } else {
        // KLASİK SORU-CEVAP AKIŞI
        response = await fetch('http://127.0.0.1:8000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response && response.ok) {
        alert("Yapay Zeka Analizi Başarıyla Tamamlandı!");
        setIsModalOpen(false);
        setSelectedFile(null);
        await fetchHistory();
      } else {
        alert("Backend analizi işlerken bir hata bildirdi.");
      }
    } catch (err) {
      alert("Analiz sırasında bir ağ veya sistem hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Düz Metin Gelen Cevapları Güzelleştiren Yardımcı Fonksiyon
  const formatTextResponse = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      let styledLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-emerald-400 font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : styledLine;

      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return <li key={index} className="ml-4 list-disc text-gray-300 my-1 leading-relaxed text-sm">{line.trim().substring(1).trim()}</li>;
      }
      return <p key={index} className="text-gray-300 my-2 leading-relaxed text-sm min-h-[1rem]">{content}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white font-sans selection:bg-emerald-500/30">
      {/* Üst Panel */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0a0e14]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center">
            <ShieldCheck className="text-black w-4 h-4" fill="currentColor" />
          </div>
          <span className="text-md font-bold tracking-tighter">NEO-ADVICE <span className="text-emerald-500">AI</span></span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <User size={14} className="text-emerald-500" />
            <span>seckindalgic9@gmail.com</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm font-medium transition-colors flex items-center gap-1">
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        
        {/* Karşılama Kartı */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent border border-emerald-500/20 shadow-xl shadow-emerald-950/5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Hoş Geldin, Seçkin 👋</h1>
            <p className="text-gray-400 text-sm max-w-xl">
              SPK mevzuatına tam uyumlu yapay zeka modülüyle yeni bir analiz başlatabilir veya mevcut portföyünün sağlığını test edebilirsin.
            </p>
          </div>
          <button 
            onClick={() => { setIsModalOpen(true); setAnalysisMode(null); setSelectedFile(null); }}
            className="bg-white text-black px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 shadow-lg shadow-black/20 whitespace-nowrap self-start md:self-center group"
          >
            <PlusCircle size={18} className="group-hover:rotate-95 transition-transform" /> Yeni Analiz Başlat
          </button>
        </div>

        {/* Analiz Geçmişi */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <History size={20} className="text-gray-400" /> Analiz Geçmişi ve Portföy Reçeteleri
          </h2>
          
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm border border-white/5 rounded-2xl bg-white/5 flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-emerald-500" size={18} /> Veriler güncelleniyor...
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm border border-dashed border-white/10 rounded-2xl bg-white/5">
                Henüz kayıtlı bir analiz raporun bulunmuyor.
              </div>
            ) : history.map((item: any) => {
              const isSelected = selectedAnalysis?.id === item.id;
              
              return (
                <div 
                  key={item.id}
                  className={`border transition-all duration-300 rounded-2xl overflow-hidden bg-white/5 ${isSelected ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20' : 'border-white/10'}`}
                >
                  {/* Satır Başlığı */}
                  <div 
                    onClick={() => setSelectedAnalysis(isSelected ? null : item)}
                    className={`p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer ${isSelected ? 'bg-emerald-500/[0.02]' : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-xs text-gray-500 font-mono bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        Rapor #{item.id}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-200">{item.investment_goal || "Görsel Portföy Analizi"}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Risk Profili: <span className="text-amber-400 font-medium">{item.risk_tolerance}</span> • Yaş: {item.age}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-base font-bold text-emerald-400">{(item.amount || 0).toLocaleString('tr-TR')} TL</span>
                      <ChevronRight size={18} className={`text-gray-500 transition-transform duration-300 ${isSelected ? 'rotate-90 text-emerald-400' : ''}`} />
                    </div>
                  </div>

                  {/* Altta Açılan Detay Paneli */}
                  {isSelected && (
                    <div className="border-t border-white/10 bg-[#0c121a] p-6 space-y-6">
                      {/* Özet Metrikler */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                        <div>
                          <span className="text-[11px] text-gray-400 block uppercase tracking-wider">Hedef Bütçe</span>
                          <span className="font-bold text-base text-white">{(item.amount || 0).toLocaleString('tr-TR')} TL</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-gray-400 block uppercase tracking-wider">Risk Limiti</span>
                          <span className="font-bold text-base text-amber-400">{item.risk_tolerance}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[11px] text-gray-400 block uppercase tracking-wider">Yatırımcı Yaşı</span>
                          <span className="font-bold text-base text-gray-300">{item.age} Yaşında</span>
                        </div>
                      </div>

                      {/* Yapay Zeka Çıktısı */}
                      <div className="space-y-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Briefcase size={14} className="text-emerald-400" /> Stratejik Varlık Dağılım Önerisi
                        </span>

                        {/* SENARYO A: Yapılandırılmış JSON Verisi Gelirse */}
                        {item.result_json && item.result_json.portfoy ? (
                          <div className="grid grid-cols-1 gap-3">
                            {item.result_json.portfoy.map((asset: any, idx: number) => (
                              <div key={idx} className="bg-white/[0.02] p-5 rounded-xl border border-white/5 space-y-3 hover:border-white/10 transition-all">
                                <div className="flex justify-between items-start">
                                  <div className="text-sm font-bold text-gray-100 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {asset.varlik}
                                  </div>
                                  <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono px-2.5 py-1 rounded-md border border-emerald-500/20">
                                    %{asset.oran} Ağırlık
                                  </div>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${asset.oran}%` }} />
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/[0.02] flex items-start gap-2">
                                  <HelpCircle size={14} className="text-gray-500 shrink-0 mt-0.5" />
                                  <span>{asset.neden}</span>
                                </p>
                              </div>
                            ))}

                            {/* [EKSTRA DÜZELTME ALANI]: Barlar bittikten sonra Gemini'ın ürettiği detaylı text analiz raporunu buraya basıyoruz */}
                            {item.result_json.analysis && (
                              <div className="mt-4 space-y-3">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                                  <FileText size={14} className="text-emerald-400" /> Detaylı Uzman Doktor Raporu
                                </span>
                                <div className="bg-black/30 p-5 rounded-xl border border-white/5 font-sans space-y-1">
                                  {formatTextResponse(item.result_json.analysis)}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : item.result_json ? (
                          /* SENARYO B: Yapılandırılmamış Metin Veya Eski Tip Detay Yazısı Gelirse */
                          <div className="bg-black/30 p-5 rounded-xl border border-white/5 font-sans space-y-1">
                            {typeof item.result_json === 'object'
                              ? formatTextResponse(item.result_json.analysis || JSON.stringify(item.result_json, null, 2))
                              : formatTextResponse(item.result_json)}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic bg-black/20 p-4 rounded-xl text-center border border-white/5">
                            Yapay zeka analiz rapor içeriği bulunamadı.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ANALİZ SEÇİM VE FORM MODAL BÖLÜMÜ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f141c] border border-white/10 w-full max-w-xl rounded-3xl p-6 relative space-y-6">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>

            {analysisMode === null ? (
              <>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">Nasıl Analiz Etmek İstersiniz?</h3>
                  <p className="text-gray-400 text-xs">Yapay zekanın portföyünüzü işlemesi için bir yöntem seçin.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button onClick={() => setAnalysisMode('form')} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/50 text-left space-y-3 transition-all group">
                    <Sparkles className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-sm">Soru-Cevap Sihirbazı</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">Hedef ve risk tercihlerinizi form doldurarak manuel iletin.</p>
                  </button>
                  <button onClick={() => setAnalysisMode('image')} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-400/50 text-left space-y-3 transition-all group">
                    <Camera className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-sm">Portföy Doktoru (OCR)</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">Banka veya aracı kurum uygulamasından portföy ekran görüntüsü yükleyin.</p>
                  </button>
                </div>
              </>
            ) : analysisMode === 'image' ? (
              /* FOTOĞRAF YÜKLEME (OCR) ARAYÜZÜ */
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Camera size={20} />
                  <h3 className="text-xl font-bold">Portföy Doktoru (OCR)</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Mevcut yatırım hesabınızın, hisse senetlerinizin veya fon dağılımınızın ekran görüntüsünü yükleyin. Yapay zeka varlıkları otomatik tarayıp optimize edecektir.
                </p>

                {/* Gizli Input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />

                {/* Sürükle Bırak / Tıklama Alanı */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${selectedFile ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : 'border-white/10 bg-black/20 hover:border-cyan-500/30'}`}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2 text-emerald-400 animate-fade-in">
                      <CheckCircle2 size={36} />
                      <span className="text-sm font-bold">Görsel Başarıyla Eklendi</span>
                      <span className="text-xs text-gray-400 max-w-xs truncate font-mono">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 group">
                      <Upload size={36} className="group-hover:text-cyan-400 transition-colors" />
                      <span className="text-sm font-medium pt-1">Ekran Görüntüsü Seçmek İçin Tıklayın</span>
                      <span className="text-[11px] text-gray-500">PNG, JPG veya JPEG formatları desteklenir</span>
                    </div>
                  )}
                </div>

                {/* İsteğe Bağlı Ek Risk Bilgisi */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Yaşınız</label>
                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-white" value={formData.age} onChange={(e)=>setFormData({...formData, age: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Risk Tercihi</label>
                    <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-white" value={formData.risk_tolerance} onChange={(e)=>setFormData({...formData, risk_tolerance: e.target.value})}>
                      <option value="Düşük">Düşük (Dengeli)</option>
                      <option value="Orta">Orta (Standart)</option>
                      <option value="Yüksek">Yüksek (Agresif)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setAnalysisMode(null); setSelectedFile(null); }} className="w-1/3 bg-white/5 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">Geri</button>
                  <button type="submit" disabled={submitting || !selectedFile} className="w-2/3 bg-cyan-500 text-black font-bold py-3 rounded-xl text-sm hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="animate-spin" size={18}/> : "Görseli Analiz Et"}
                  </button>
                </div>
              </form>
            ) : (
              /* STANDART METİN FORMU SİHİRBAZI */
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><Sparkles size={18}/> Soru-Cevap Sihirbazı</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Yaşınız</label>
                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" value={formData.age} onChange={(e)=>setFormData({...formData, age: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Risk Toleransı</label>
                    <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 text-white" value={formData.risk_tolerance} onChange={(e)=>setFormData({...formData, risk_tolerance: e.target.value})}>
                      <option value="Düşük">Düşük (Muhafazakar)</option>
                      <option value="Orta">Orta (Dengeli)</option>
                      <option value="Yüksek">Yüksek (Agresif Büyüme)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Yatırım Amacınız / Hedefiniz</label>
                  <input type="text" required placeholder="Örn: 2 yıl vadeli ev peşinatı biriktirme" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" value={formData.investment_goal} onChange={(e)=>setFormData({...formData, investment_goal: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Yatırım Tutarı (TL)</label>
                  <input type="number" required placeholder="Örn: 100000" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" value={formData.amount} onChange={(e)=>setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAnalysisMode(null)} className="w-1/3 bg-white/5 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">Geri</button>
                  <button type="submit" disabled={submitting} className="w-2/3 bg-emerald-500 text-black font-bold py-3 rounded-xl text-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="animate-spin" size={18}/> : "Analizi Başlat"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}