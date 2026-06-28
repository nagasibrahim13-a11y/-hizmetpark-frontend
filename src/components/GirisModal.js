import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useGirisForm } from '../hooks/useGirisForm';
import './GirisModal.css';

function GirisModal({ onKayitGit }) {
  const { girisYap, modalKapat } = useAuth();
  const { email, setEmail, sifre, setSifre, hata, yukleniyor, girisYap: submitGiris } = useGirisForm(girisYap);
  const [googleHata, setGoogleHata] = useState('');

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') modalKapat(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalKapat]);

  const handleGoogleBasari = async (credentialResponse) => {
    setGoogleHata('');
    try {
      const cevap = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const veri = await cevap.json();
      if (cevap.ok) {
        girisYap(veri.kullanici);
      } else {
        setGoogleHata(veri.hata || 'Google ile giriş başarısız');
      }
    } catch {
      setGoogleHata('Sunucuya bağlanılamadı');
    }
  };

  return (
    <div className="giris-modal-overlay" onClick={modalKapat}>
      <div className="giris-modal" onClick={e => e.stopPropagation()}>
        <button className="giris-modal-kapat" onClick={modalKapat}>✕</button>

        <div className="giris-modal-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="#1B1D3A" strokeWidth="2"/>
            <path d="M3 9h18" stroke="#1B1D3A" strokeWidth="2"/>
            <path d="M8 2.5v3M16 2.5v3" stroke="#1B1D3A" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="8" cy="14" r="1.5" fill="#1B1D3A"/>
            <circle cx="12" cy="14" r="1.5" fill="#1B1D3A"/>
            <circle cx="16" cy="14" r="1.5" fill="#1B1D3A"/>
          </svg>
          HizmetPark
        </div>

        <div className="giris-modal-baslik">
          <h2>Giriş Yap</h2>
          <p>Devam etmek için hesabınıza giriş yapın</p>
        </div>

        {hata && <div className="hata">{hata}</div>}

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="ornek@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>

        <div className="input-group">
          <label>Şifre</label>
          <input
            type="password"
            placeholder="••••••"
            value={sifre}
            onChange={e => setSifre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitGiris()}
          />
        </div>

        <button className="btn-primary" onClick={submitGiris} disabled={yukleniyor}>
          {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>

        <div className="giris-ayrac"><span>veya</span></div>

        {googleHata && <div className="hata">{googleHata}</div>}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleBasari}
            onError={() => setGoogleHata('Google ile giriş başarısız')}
            text="signin_with"
            locale="tr"
          />
        </div>

        <p className="giris-modal-kayit">
          Hesabın yok mu?{' '}
          <span onClick={onKayitGit}>Kayıt Ol</span>
        </p>
      </div>
    </div>
  );
}

export default GirisModal;
