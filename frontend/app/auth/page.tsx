"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      // 1. DÜZELTME: localhost yerine 127.0.0.1 IP'sini doğrudan vererek 
      // Next.js (IPv6) ve FastAPI (IPv4) arasındaki köprü kopukluğunu çözüyoruz.
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Backend'e JSON beklediğimizi açıkça beyan ediyoruz
        },
        body: JSON.stringify({ 
          email: email.trim(), // Kopyala yapıştırda oluşabilecek boşlukları temizler
          password: password 
        })
      });

      // 2. DÜZELTME: Yanıtın JSON olup olmadığını güvenle kontrol ediyoruz
      const contentType = response.headers.get("content-type");
      let data: any = {};
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        // Backend'den gelen detay mesajını yakala (örn: "Bu email zaten kayıtlı.")
        throw new Error(data.detail || 'İşlem gerçekleştirilemedi.');
      }

      if (isLogin) {
        // JWT token'ı güvenle localStorage'a yaz
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          router.push('/dashboard');
        } else {
          throw new Error('Sunucudan token alınamadı.');
        }
      } else {
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsLogin(true); // Kullanıcıyı otomatik giriş moduna geçir
      }
    } catch (err: any) {
      console.error("İletişim Hatası Detayı:", err);
      // Eğer sunucu tamamen kapalıysa veya ağ çöktüyse kullanıcıya net bilgi verelim
      if (err.message.includes("Failed to fetch")) {
        setError("Backend sunucusu (Port 8000) çalışmıyor veya ulaşılamıyor.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white flex flex-col justify-center items-center px-4 font-sans">
      
      {/* Üst Logo */}
      <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => router.push('/')}>
        <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
          <ShieldCheck className="text-black w-4 h-4" fill="currentColor" />
        </div>
        <span className="text-lg font-bold tracking-tighter">NEO-ADVICE <span className="text-emerald-500">AI</span></span>
      </div>

      {/* Auth Kart Alanı */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">
          {isLogin ? 'Tekrar Hoş Geldiniz' : 'Hesabınızı Oluşturun'}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          {isLogin ? 'Yatırımlarınızı optimize etmeye devam edin.' : '19 Mayıs ruhuyla geleceğinize yatırım yapın.'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl mb-4 text-center whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">E-Posta</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="isim@domain.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-white text-black py-3 rounded-xl text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Giriş / Kayıt Modu Değiştirici Buton */}
        <div className="mt-6 text-center">
          <button 
            type="button" // DÜZELTME: submit tetiklememesi için type="button" yapıldı
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
          >
            {isLogin ? 'Bir hesabınız yok mu? Kayıt Olun' : 'Zaten üye misiniz? Giriş Yapın'}
          </button>
        </div>
      </div>
    </div>
  );
}