"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Sparkles, Camera, BarChart3, Lock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Giriş kontrolü
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0a0e14]/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center">
            <ShieldCheck className="text-black w-4 h-4" fill="currentColor" />
          </div>
          <span className="text-md font-bold tracking-tighter">NEO-ADVICE <span className="text-emerald-500">AI</span></span>
        </div>
        <div>
          <button 
            onClick={() => router.push(isLoggedIn ? '/dashboard' : '/auth')}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold px-5 py-2 rounded-xl transition-all"
          >
            {isLoggedIn ? 'Panoya Git' : 'Giriş Yap'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 max-w-5xl mx-auto px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400 animate-pulse">
          <Sparkles size={12} /> SPK Mevzuatına Tam Uyumlu Yapay Zeka
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-[1.15]">
          Portföyünüzü Yapay Zeka ile <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Optimize Edin</span>
        </h1>
        
        <p className="text-gray-400 text-sm md:text-md max-w-xl mx-auto leading-relaxed">
          Geleneksel yatırım danışmanlığını geride bırakın. Risk toleransınızı test edin veya banka/aracı kurum ekran görüntünüzü yükleyerek saniyeler içinde Portföy Doktoru analizini alın.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => router.push(isLoggedIn ? '/dashboard' : '/auth')}
            className="w-full sm:w-auto bg-emerald-500 text-black font-bold px-8 py-4 rounded-xl text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 group"
          >
            Hemen Ücretsiz Başla <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Özellikler (Features) Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Camera className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-lg font-bold">Portföy Doktoru (OCR)</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Yatırım hesabınızın ekran görüntüsünü yükleyin. Yapay zekamız varlıkları, adetleri ve fon dağılımlarını anında analiz etsin.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <BarChart3 className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-lg font-bold">Stratejik Varlık Dağılımı</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Yaşınıza, finansal hedefinize ve risk eşiğinize en uygun sepet ağırlıklarını güncel piyasa verileri ve algoritmalarla hesaplayın.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Lock className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-lg font-bold">Yasal Uyum Kalkanı</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Tüm tavsiyeler, arka planda taranan resmi SPK mevzuat dökümanları ve yatırım kısıtlamaları süzgecinden geçirilerek üretilir.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-500">
        © 2026 Neo-Advice AI. Tüm hakları saklıdır. Yatırım tavsiyesi değildir.
      </footer>
    </div>
  );
}