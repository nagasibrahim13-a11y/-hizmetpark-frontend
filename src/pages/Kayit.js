import React, { useState } from 'react';
import './Giris.css';

function Kayit({ onGirisGit }) {
  const [form, setForm] = useState({ ad: '', soyad: '', email: '', sifre: '', telefon: '', rol: 'musteri' });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const kayitOl = async () => {
    if (!form.ad || !form.email || !form.sifre) {
      setHata('Ad, email ve şifre zorunlu');
      return;
    }
    setYukleniyor(true);
    setHata('');
    try {
      const cevap = await fetch('http://localhost:5000/api/kullanicilar/kayit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const veri = await cevap.json();
      if (!cevap.ok) {
        setHata(veri.hata);
      } else {
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        onGirisGit();
      }
    } catch (err) {
      setHata('Sunucuya bağlanılamadı');
    }
    setYukleniyor(false);
  };

  const guncelle = (alan, deger) => setForm({ ...form, [alan]: deger });

  return (
    <div className="giris-sayfa">
      <div className="giris-kutu card">
        <div className="giris-logo">
          <span className="logo-icon">✂️</span>
          <h1>HizmetPark</h1>
          <p>Hesap oluştur</p>
        </div>
        {hata && <div className="hata">{hata}</div>}
        <div className="input-group">
          <label>Ad</label>
          <input placeholder="Adın" value={form.ad} onChange={e => guncelle('ad', e.target.value)} />
        </div>
        <div className="input-group">
          <label>Soyad</label>
          <input placeholder="Soyadın" value={form.soyad} onChange={e => guncelle('soyad', e.target.value)} />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="ornek@gmail.com" value={form.email} onChange={e => guncelle('email', e.target.value)} />
        </div>
        <div className="input-group">
          <label>Şifre</label>
          <input type="password" placeholder="••••••" value={form.sifre} onChange={e => guncelle('sifre', e.target.value)} />
        </div>
        <div className="input-group">
          <label>Telefon</label>
          <input placeholder="0532 111 2233" value={form.telefon} onChange={e => guncelle('telefon', e.target.value)} />
        </div>
        <div className="input-group">
          <label>Hesap Türü</label>
          <select value={form.rol} onChange={e => guncelle('rol', e.target.value)}>
            <option value="musteri">Müşteri</option>
            <option value="isletme">İşletme Sahibi</option>
          </select>
        </div>
        <button className="btn-primary" onClick={kayitOl} disabled={yukleniyor}>
          {yukleniyor ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
        </button>
        <p className="kayit-link">
          Zaten hesabın var mı? <span onClick={onGirisGit}>Giriş yap</span>
        </p>
      </div>
    </div>
  );
}

export default Kayit;