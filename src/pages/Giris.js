import React from 'react';
import { useGirisForm } from '../hooks/useGirisForm';
import './Giris.css';

function Giris({ onGiris, onKayitGit }) {
  const { email, setEmail, sifre, setSifre, hata, yukleniyor, girisYap } = useGirisForm(onGiris);

  return (
    <div className="giris-sayfa">
      <div className="giris-kutu card">
        <div className="giris-logo">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 2px' }}>
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="#4F46E5" strokeWidth="1.75"/>
            <path d="M3 9h18" stroke="#4F46E5" strokeWidth="1.75"/>
            <path d="M8 2.5v3M16 2.5v3" stroke="#4F46E5" strokeWidth="1.75" strokeLinecap="round"/>
            <circle cx="8" cy="14" r="1.5" fill="#4F46E5"/>
            <circle cx="12" cy="14" r="1.5" fill="#4F46E5"/>
            <circle cx="16" cy="14" r="1.5" fill="#4F46E5"/>
          </svg>
          <h1>HizmetPark</h1>
          <p>Türkiye'nin Hizmet Marketplace'i</p>
        </div>

        {hata && <div className="hata">{hata}</div>}

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="ornek@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Şifre</label>
          <input
            type="password"
            placeholder="••••••"
            value={sifre}
            onChange={e => setSifre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && girisYap()}
          />
        </div>

        <button className="btn-primary" onClick={girisYap} disabled={yukleniyor}>
          {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>

        <p className="kayit-link">
          Hesabın yok mu?{' '}
          <span onClick={onKayitGit}>Kayıt ol</span>
        </p>
      </div>
    </div>
  );
}

export default Giris;
