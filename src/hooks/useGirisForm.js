import { useState } from 'react';

export function useGirisForm(onBasari) {
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
        setHata(veri.hata || 'Giriş başarısız');
      } else {
        onBasari(veri.kullanici);
      }
    } catch {
      setHata('Sunucuya bağlanılamadı');
    }
    setYukleniyor(false);
  };

  return { email, setEmail, sifre, setSifre, hata, yukleniyor, girisYap };
}
