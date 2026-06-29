import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Giris.css';
import './Kayit.css';

function Kayit({ onGirisGit }) {
  const { girisYap } = useAuth();
  const [adim, setAdim] = useState(1);
  const [kayitToken, setKayitToken] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const [form, setForm] = useState({
    ad: '', soyad: '', email: '', sifre: '', telefon: '', rol: 'musteri'
  });

  const [isletmeForm, setIsletmeForm] = useState({
    isletmeAdi: '',
    kategori: 'berber',
    telefon: '',
    adres: { il: '', ilce: '', acikAdres: '' },
    calismaGunleri: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    calismaBaslangic: '09:00',
    calismaBitis: '19:00',
    hizmetler: [{ ad: '', sure: '', fiyat: '' }]
  });

  const guncelle = (alan, deger) => setForm({ ...form, [alan]: deger });

  const handleGoogleBasari = async (credentialResponse) => {
    setHata('');
    try {
      const cevap = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const veri = await cevap.json();
      if (cevap.ok) {
        girisYap(veri.kullanici, veri.token);
        onGirisGit();
      } else {
        setHata(veri.hata || 'Google ile giriş başarısız');
      }
    } catch {
      setHata('Sunucuya bağlanılamadı');
    }
  };

  const adim1Tamamla = async () => {
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
        if (form.rol === 'isletme') {
          setKayitToken(veri.token);
          setAdim(2);
        } else {
          girisYap(veri.kullanici, veri.token);
          onGirisGit();
        }
      }
    } catch (err) {
      setHata('Sunucuya bağlanılamadı');
    }
    setYukleniyor(false);
  };

  const hizmetEkle = () => {
    setIsletmeForm({
      ...isletmeForm,
      hizmetler: [...isletmeForm.hizmetler, { ad: '', sure: '', fiyat: '' }]
    });
  };

  const hizmetSil = (index) => {
    const yeni = isletmeForm.hizmetler.filter((_, i) => i !== index);
    setIsletmeForm({ ...isletmeForm, hizmetler: yeni });
  };

  const hizmetGuncelle = (index, alan, deger) => {
    const yeni = [...isletmeForm.hizmetler];
    yeni[index] = { ...yeni[index], [alan]: deger };
    setIsletmeForm({ ...isletmeForm, hizmetler: yeni });
  };

  const adim2Tamamla = async () => {
    if (!isletmeForm.isletmeAdi || !isletmeForm.adres.il || !isletmeForm.adres.ilce) {
      setHata('İşletme adı, il ve ilçe zorunlu');
      return;
    }
    const doluHizmetler = isletmeForm.hizmetler.filter(h => h.ad && h.sure && h.fiyat);
    if (doluHizmetler.length === 0) {
      setHata('En az bir hizmet ekleyin');
      return;
    }
    setYukleniyor(true);
    setHata('');
    try {
      const cevap = await fetch('http://localhost:5000/api/isletmeler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${kayitToken}`,
        },
        body: JSON.stringify({
          ...isletmeForm,
          telefon: isletmeForm.telefon || form.telefon,
          hizmetler: doluHizmetler.map(h => ({
            ad: h.ad,
            sure: Number(h.sure),
            fiyat: Number(h.fiyat)
          }))
        })
      });
      const veri = await cevap.json();
      if (!cevap.ok) {
        setHata(veri.hata);
      } else {
        girisYap(veri.kullanici, veri.token);
        onGirisGit();
      }
    } catch (err) {
      setHata('Sunucuya bağlanılamadı');
    }
    setYukleniyor(false);
  };

  const kategoriler = [
    { deger: 'berber', label: '✂️ Berber' },
    { deger: 'kuafor', label: '💅 Kuaför' },
    { deger: 'guzellik', label: '💆 Güzellik Salonu' },
    { deger: 'halisaha', label: '⚽ Halısaha' },
  ];

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #E0E0E0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#FAFAFA',
    color: '#1A1A1A',
    marginBottom: '12px'
  };

  return (
    <div className="giris-sayfa">
      <div className="kayit-kutu card">

        {/* ADIM GÖSTERGESİ */}
        {form.rol === 'isletme' && (
          <div className="adim-gosterge">
            <div className={`adim-nokta ${adim >= 1 ? 'aktif' : ''}`}>1</div>
            <div className={`adim-cizgi ${adim >= 2 ? 'aktif' : ''}`} />
            <div className={`adim-nokta ${adim >= 2 ? 'aktif' : ''}`}>2</div>
          </div>
        )}

        {/* ADIM 1 — KİŞİSEL BİLGİLER */}
        {adim === 1 && (
          <>
            <div className="giris-logo">
              <span className="logo-icon">✂️</span>
              <h1>HizmetPark</h1>
              <p>Hesap oluştur</p>
            </div>

            {hata && <div className="hata">{hata}</div>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Ad</label>
                <input style={inputStyle} placeholder="Adın" value={form.ad} onChange={e => guncelle('ad', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Soyad</label>
                <input style={inputStyle} placeholder="Soyadın" value={form.soyad} onChange={e => guncelle('soyad', e.target.value)} />
              </div>
            </div>

            <label className="input-label">Email</label>
            <input style={inputStyle} type="email" placeholder="ornek@gmail.com" value={form.email} onChange={e => guncelle('email', e.target.value)} />

            <label className="input-label">Şifre</label>
            <input style={inputStyle} type="password" placeholder="••••••" value={form.sifre} onChange={e => guncelle('sifre', e.target.value)} />

            <label className="input-label">Telefon</label>
            <input style={inputStyle} placeholder="0532 111 2233" value={form.telefon} onChange={e => guncelle('telefon', e.target.value)} />

            <label className="input-label">Hesap Türü</label>
            <div className="rol-secim">
              <div
                className={`rol-kart ${form.rol === 'musteri' ? 'secili' : ''}`}
                onClick={() => guncelle('rol', 'musteri')}
              >
                <div className="rol-emoji">👤</div>
                <div className="rol-adi">Müşteri</div>
                <div className="rol-aciklama">Randevu al, yorum yap</div>
              </div>
              <div
                className={`rol-kart ${form.rol === 'isletme' ? 'secili' : ''}`}
                onClick={() => guncelle('rol', 'isletme')}
              >
                <div className="rol-emoji">🏪</div>
                <div className="rol-adi">İşletme Sahibi</div>
                <div className="rol-aciklama">İşletmeni yönet</div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={adim1Tamamla}
              disabled={yukleniyor}
              style={{ marginTop: '8px' }}
            >
              {yukleniyor ? 'Bekleyin...' : form.rol === 'isletme' ? 'Devam Et →' : 'Kayıt Ol'}
            </button>

            <div className="giris-ayrac"><span>veya</span></div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleBasari}
                onError={() => setHata('Google ile giriş başarısız')}
                text="continue_with"
                locale="tr"
              />
            </div>

            <p className="kayit-link">
              Zaten hesabın var mı? <span onClick={onGirisGit}>Giriş yap</span>
            </p>
          </>
        )}

        {/* ADIM 2 — İŞLETME BİLGİLERİ */}
        {adim === 2 && (
          <>
            <div className="giris-logo">
              <span className="logo-icon">🏪</span>
              <h1>İşletme Bilgileri</h1>
              <p>İşletmenizi tanıtalım</p>
            </div>

            {hata && <div className="hata">{hata}</div>}

            <label className="input-label">İşletme Adı</label>
            <input style={inputStyle} placeholder="Örn: Ahmet Berber Salonu" value={isletmeForm.isletmeAdi} onChange={e => setIsletmeForm({ ...isletmeForm, isletmeAdi: e.target.value })} />

            <label className="input-label">Kategori</label>
            <div className="kategori-secim">
              {kategoriler.map(k => (
                <div
                  key={k.deger}
                  className={`kategori-kart ${isletmeForm.kategori === k.deger ? 'secili' : ''}`}
                  onClick={() => setIsletmeForm({ ...isletmeForm, kategori: k.deger })}
                >
                  {k.label}
                </div>
              ))}
            </div>

            <label className="input-label">Telefon</label>
            <input style={inputStyle} placeholder="0532 111 2233" value={isletmeForm.telefon} onChange={e => setIsletmeForm({ ...isletmeForm, telefon: e.target.value })} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">İl</label>
                <input style={inputStyle} placeholder="İstanbul" value={isletmeForm.adres.il} onChange={e => setIsletmeForm({ ...isletmeForm, adres: { ...isletmeForm.adres, il: e.target.value } })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">İlçe</label>
                <input style={inputStyle} placeholder="Kadıköy" value={isletmeForm.adres.ilce} onChange={e => setIsletmeForm({ ...isletmeForm, adres: { ...isletmeForm.adres, ilce: e.target.value } })} />
              </div>
            </div>

            <label className="input-label">Açık Adres</label>
            <input style={inputStyle} placeholder="Cadde, sokak, no..." value={isletmeForm.adres.acikAdres} onChange={e => setIsletmeForm({ ...isletmeForm, adres: { ...isletmeForm.adres, acikAdres: e.target.value } })} />

            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'8px'}}>Çalışma Günleri</label>
              <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                {['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'].map(gun => {
                  const secili = isletmeForm.calismaGunleri.includes(gun);
                  return (
                    <button
                      key={gun}
                      type="button"
                      onClick={() => {
                        const gunler = isletmeForm.calismaGunleri.includes(gun)
                          ? isletmeForm.calismaGunleri.filter(g => g !== gun)
                          : [...isletmeForm.calismaGunleri, gun];
                        setIsletmeForm(prev => ({ ...prev, calismaGunleri: gunler }));
                      }}
                      style={{
                        padding:'6px 12px',
                        borderRadius:'20px',
                        border: secili ? 'none' : '1px solid #E2E8F0',
                        background: secili ? '#4F46E5' : 'white',
                        color: secili ? 'white' : '#374151',
                        fontSize:'13px',
                        cursor:'pointer',
                        fontWeight: secili ? '600' : '400'
                      }}
                    >
                      {gun.slice(0,3)}
                    </button>
                  );
                })}
              </div>
              <div style={{fontSize:'12px', color:'#94A3B8', marginTop:'6px'}}>
                {isletmeForm.calismaGunleri.length} gün seçili
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Açılış Saati</label>
                <input style={inputStyle} type="time" value={isletmeForm.calismaBaslangic} onChange={e => setIsletmeForm({ ...isletmeForm, calismaBaslangic: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Kapanış Saati</label>
                <input style={inputStyle} type="time" value={isletmeForm.calismaBitis} onChange={e => setIsletmeForm({ ...isletmeForm, calismaBitis: e.target.value })} />
              </div>
            </div>

            <label className="input-label">Hizmetler</label>
            {isletmeForm.hizmetler.map((h, i) => (
              <div key={i} className="hizmet-satir-kayit">
                <input
                  style={{ ...inputStyle, flex: 3, marginBottom: 0 }}
                  placeholder="Hizmet adı"
                  value={h.ad}
                  onChange={e => hizmetGuncelle(i, 'ad', e.target.value)}
                />
                <input
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                  type="number"
                  placeholder="Süre dk"
                  value={h.sure}
                  onFocus={e => e.target.select()}
                  onChange={e => hizmetGuncelle(i, 'sure', e.target.value)}
                />
                <input
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                  type="number"
                  placeholder="Fiyat ₺"
                  value={h.fiyat}
                  onFocus={e => e.target.select()}
                  onChange={e => hizmetGuncelle(i, 'fiyat', e.target.value)}
                />
                {isletmeForm.hizmetler.length > 1 && (
                  <button onClick={() => hizmetSil(i)} className="hizmet-sil-btn">✕</button>
                )}
              </div>
            ))}

            <button onClick={hizmetEkle} className="hizmet-ekle-btn">+ Hizmet Ekle</button>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => setAdim(1)}
                style={{ flex: 1, padding: '12px', border: '1.5px solid #E0E0E0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#555' }}
              >
                ← Geri
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2 }}
                onClick={adim2Tamamla}
                disabled={yukleniyor}
              >
                {yukleniyor ? 'Kaydediliyor...' : 'İşletmeyi Oluştur ✓'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Kayit;