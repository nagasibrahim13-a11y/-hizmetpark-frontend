import React, { useState } from 'react';
import './Giris.css';

function Giris({ onGiris, onKayitGit }) {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const girisYap = async () => {
    if (!email || !sifre) {
      setHata('Email ve şifre gerekli');
      return;
    }

    setYukleniyor(true);
    setHata('');

    try {
      const cevap = await fetch('http://localhost:5000/api/kullanicilar/giris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sifre })
      });

      const veri = await cevap.json();

      if (!cevap.ok) {
        setHata(veri.hata);
      } else {
        onGiris(veri.kullanici);
      }
    } catch (err) {
      setHata('Sunucuya bağlanılamadı');
    }

    setYukleniyor(false);
  };

  return (
    <div className="giris-sayfa">
      <div className="giris-kutu card">

        <div className="giris-logo">
          <span className="logo-icon">✂️</span>
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
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Şifre</label>
          <input
            type="password"
            placeholder="••••••"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && girisYap()}
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