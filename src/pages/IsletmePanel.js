import React, { useState, useEffect } from 'react';
import IsletmeProfil from './IsletmeProfil';
import './IsletmePanel.css';

function IsletmePanel({ kullanici, onCikis }) {
  const [randevular, setRandevular] = useState([]);
  const [isletme, setIsletme] = useState(null);
  const [aktifSekme, setAktifSekme] = useState('randevular');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [sadakatListesi, setSadakatListesi] = useState([]);
  const [hedefZiyaret, setHedefZiyaret] = useState(5);
  const [hediye, setHediye] = useState('Ücretsiz Hizmet');
  const [sadakatKayitBasari, setSadakatKayitBasari] = useState('');
  const [duzenleModal, setDuzenleModal] = useState(false);
  const [duzenleHizmet, setDuzenleHizmet] = useState(null);
  const [yeniHizmetModal, setYeniHizmetModal] = useState(false);
  const [yeniHizmet, setYeniHizmet] = useState({ ad: '', sure: '', fiyat: '' });
  const [profilForm, setProfilForm] = useState({});
  const [profilBasari, setProfilBasari] = useState('');
  const [reklamlar, setReklamlar] = useState([]);
  const [yeniReklamModal, setYeniReklamModal] = useState(false);
  const [yeniReklam, setYeniReklam] = useState({
    tip: 'sponsorlu',
    baslik: '',
    aciklama: '',
    gorsel: '',
    gun: 7
  });
  const [reklamBasari, setReklamBasari] = useState('');
  const [musaitlikTarih, setMusaitlikTarih] = useState('');
  const [musaitlikTumGun, setMusaitlikTumGun] = useState(true);
  const [musaitlikSaatler, setMusaitlikSaatler] = useState([]);
  const [musaitlikAciklama, setMusaitlikAciklama] = useState('');
  const [musaitlikBasari, setMusaitlikBasari] = useState('');
  const [duzenleModuAcik, setDuzenleModuAcik] = useState(false);
  const [profilAnahtar, setProfilAnahtar] = useState(0);
  const [manuelModal, setManuelModal] = useState(false);
  const [manuelForm, setManuelForm] = useState({ musteriAdi: '', musteriTelefon: '', tarih: '', saat: '', hizmetler: [] });
  const [manuelBasari, setManuelBasari] = useState('');
  const [manuelHata, setManuelHata] = useState('');
  const [personelListesi, setPersonelListesi] = useState([]);
  const [personelFiltre, setPersonelFiltre] = useState('hepsi');
  const [yeniPersonelAd, setYeniPersonelAd] = useState('');
  const [yeniPersonelUnvan, setYeniPersonelUnvan] = useState('');
  const [personelYukleniyor, setPersonelYukleniyor] = useState(false);
  const [analitik, setAnalitik] = useState(null);
  const [analitikYukleniyor, setAnalitikYukleniyor] = useState(false);
  const [vipHedef, setVipHedef] = useState(10);
  const [vipHediye, setVipHediye] = useState('VIP Özel Hizmet');

  const fiyatlar = {
    slider: { haftalik: 400, aylik: 1200 },
    one_cikma: { haftalik: 250, aylik: 800 },
    sponsorlu: { haftalik: 150, aylik: 500 }
  };

  const tipLabel = {
    slider: '📢 Ana Sayfa Slider',
    one_cikma: '📍 Öne Çıkarma',
    sponsorlu: '🃏 Sponsorlu Kart'
  };

  const saatler = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30'
  ];

  const bugunTarih = new Date().toISOString().split('T')[0];

  useEffect(() => { isletmeyiGetir(); }, []);
  useEffect(() => { if (isletme) { personelGetir(); analitikGetir(); } }, [isletme]);

  const isletmeyiGetir = async () => {
    try {
      const cevap = await fetch('http://localhost:5000/api/isletmeler');
      const veri = await cevap.json();
      const benim = veri.find(i => i.sahip._id === kullanici.id || i.sahip === kullanici.id);
      if (benim) {
        setIsletme(benim);
        setProfilForm({
          isletmeAdi: benim.isletmeAdi,
          telefon: benim.telefon || '',
          slogan: benim.slogan || '',
          hakkinda: benim.hakkinda || '',
          fotograf: benim.fotograf || '',
          calismaBaslangic: benim.calismaBaslangic,
          calismaBitis: benim.calismaBitis,
          adres: { ...benim.adres }
        });
        randevulariGetir(benim._id);
        sadakatListesiGetir(benim._id);
        reklamlariGetir(benim._id);
      }
    } catch (err) { console.error(err); }
    setYukleniyor(false);
  };

  const analitikGetir = async () => {
    if (!isletme?._id) return;
    setAnalitikYukleniyor(true);
    try {
      const cevap = await fetch(`http://localhost:5000/api/randevular/isletme/${isletme._id}/analitik`);
      const veri = await cevap.json();
      setAnalitik(veri);
    } catch (err) { console.error(err); }
    setAnalitikYukleniyor(false);
  };

  const personelGetir = async () => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/personel`);
      const veri = await cevap.json();
      setPersonelListesi(veri);
    } catch (err) { console.error(err); }
  };

  const personelEkle = async () => {
    if (!yeniPersonelAd.trim()) return;
    setPersonelYukleniyor(true);
    try {
      const cevap = await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/personel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad: yeniPersonelAd, unvan: yeniPersonelUnvan || 'Çalışan' })
      });
      const veri = await cevap.json();
      setPersonelListesi(veri.personel);
      setYeniPersonelAd('');
      setYeniPersonelUnvan('');
    } catch (err) { console.error(err); }
    setPersonelYukleniyor(false);
  };

  const personelSil = async (personelId) => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/personel/${personelId}`, { method: 'DELETE' });
      const veri = await cevap.json();
      setPersonelListesi(veri.personel);
    } catch (err) { console.error(err); }
  };

  const randevulariGetir = async (isletmeId) => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/randevular/isletme/${isletmeId}`);
      const veri = await cevap.json();
      setRandevular(veri);
    } catch (err) { console.error(err); }
  };

  const sadakatListesiGetir = async (isletmeId) => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/sadakat/isletme/${isletmeId}`);
      const veri = await cevap.json();
      setSadakatListesi(veri);
      if (veri.length > 0) {
        setHedefZiyaret(veri[0].odul.hedefZiyaret);
        setHediye(veri[0].odul.hediye);
      }
    } catch (err) { console.error(err); }
  };

  const reklamlariGetir = async (isletmeId) => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/reklamlar/isletme/${isletmeId}`);
      const veri = await cevap.json();
      setReklamlar(veri);
    } catch (err) { console.error(err); }
  };

  const durumGuncelle = async (randevuId, durum) => {
    try {
      await fetch(`http://localhost:5000/api/randevular/${randevuId}/durum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durum })
      });
      randevulariGetir(isletme._id);
    } catch (err) { console.error(err); }
  };

  const sadakatKaydet = async () => {
    try {
      await fetch(`http://localhost:5000/api/sadakat/isletme/${isletme._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hedefZiyaret: Number(hedefZiyaret), hediye, vipHedef: Number(vipHedef), vipHediye })
      });
      setSadakatKayitBasari('Sadakat ayarları kaydedildi!');
      setTimeout(() => setSadakatKayitBasari(''), 2000);
    } catch (err) { console.error(err); }
  };

  const hizmetDuzenleKaydet = async () => {
    try {
      await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/hizmet/${duzenleHizmet._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad: duzenleHizmet.ad, sure: Number(duzenleHizmet.sure), fiyat: Number(duzenleHizmet.fiyat) })
      });
      setDuzenleModal(false);
      isletmeyiGetir();
    } catch (err) { console.error(err); }
  };

  const hizmetSil = async (hizmetId) => {
    if (!window.confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/hizmet/${hizmetId}`, { method: 'DELETE' });
      isletmeyiGetir();
    } catch (err) { console.error(err); }
  };

  const hizmetEkle = async () => {
    if (!yeniHizmet.ad || !yeniHizmet.sure || !yeniHizmet.fiyat) { alert('Lütfen tüm alanları doldurun'); return; }
    try {
      await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/hizmet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad: yeniHizmet.ad, sure: Number(yeniHizmet.sure), fiyat: Number(yeniHizmet.fiyat) })
      });
      setYeniHizmetModal(false);
      setYeniHizmet({ ad: '', sure: '', fiyat: '' });
      isletmeyiGetir();
    } catch (err) { console.error(err); }
  };

  const profilKaydet = async () => {
    try {
      await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilForm)
      });
      setProfilBasari('Profil güncellendi!');
      isletmeyiGetir();
      setTimeout(() => {
        setProfilBasari('');
        setDuzenleModuAcik(false);
        setProfilAnahtar(k => k + 1);
      }, 1200);
    } catch (err) { console.error(err); }
  };

  const fotografYukle = (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    if (dosya.size > 2 * 1024 * 1024) { alert('Fotoğraf 2MB\'dan küçük olmalı'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfilForm({ ...profilForm, fotograf: reader.result });
    reader.readAsDataURL(dosya);
  };

  const reklamGorselYukle = (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    if (dosya.size > 2 * 1024 * 1024) { alert('Görsel 2MB\'dan küçük olmalı'); return; }
    const reader = new FileReader();
    reader.onload = () => setYeniReklam({ ...yeniReklam, gorsel: reader.result });
    reader.readAsDataURL(dosya);
  };

  const reklamOlustur = async () => {
    if (!yeniReklam.baslik) { alert('Başlık zorunlu'); return; }
    try {
      const baslangic = new Date();
      const bitis = new Date();
      bitis.setDate(bitis.getDate() + Number(yeniReklam.gun));
      await fetch('http://localhost:5000/api/reklamlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isletme: isletme._id,
          tip: yeniReklam.tip,
          baslik: yeniReklam.baslik,
          aciklama: yeniReklam.aciklama,
          gorsel: yeniReklam.gorsel,
          baslangicTarihi: baslangic,
          bitisTarihi: bitis,
          aktif: true
        })
      });
      setReklamBasari('Reklam oluşturuldu!');
      setYeniReklamModal(false);
      setYeniReklam({ tip: 'sponsorlu', baslik: '', aciklama: '', gorsel: '', gun: 7 });
      reklamlariGetir(isletme._id);
      setTimeout(() => setReklamBasari(''), 2000);
    } catch (err) { console.error(err); }
  };

  const reklamIptal = async (reklamId) => {
    if (!window.confirm('Reklamı iptal etmek istiyor musunuz?')) return;
    try {
      await fetch(`http://localhost:5000/api/reklamlar/${reklamId}/iptal`, { method: 'PUT' });
      reklamlariGetir(isletme._id);
    } catch (err) { console.error(err); }
  };

  const kapaliTarihEkle = async () => {
    if (!musaitlikTarih) { alert('Lütfen tarih seçin'); return; }
    if (!musaitlikTumGun && musaitlikSaatler.length === 0) { alert('Lütfen kapalı saatleri seçin'); return; }
    try {
      const cevap = await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/kapali-tarih`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarih: musaitlikTarih,
          tumGun: musaitlikTumGun,
          saatler: musaitlikTumGun ? [] : musaitlikSaatler,
          aciklama: musaitlikAciklama
        })
      });
      const veri = await cevap.json();
      if (!cevap.ok) { alert(veri.hata || 'Bir hata oluştu'); return; }
      setIsletme(veri.isletme);
      setMusaitlikBasari('Kapalı tarih eklendi!');
      setMusaitlikTarih('');
      setMusaitlikSaatler([]);
      setMusaitlikAciklama('');
      setMusaitlikTumGun(true);
      setTimeout(() => setMusaitlikBasari(''), 2000);
    } catch (err) { console.error(err); alert('Sunucuya bağlanılamadı'); }
  };

  const kapaliTarihKaldir = async (tarihId) => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/kapali-tarih/${tarihId}`, { method: 'DELETE' });
      if (cevap.ok) {
        setIsletme(prev => ({
          ...prev,
          kapaliTarihler: prev.kapaliTarihler.filter(kt => kt._id !== tarihId)
        }));
      }
    } catch (err) { console.error(err); }
  };

  const manuelRandevuOlustur = async () => {
    if (!manuelForm.musteriAdi.trim()) { setManuelHata('Müşteri adı zorunlu'); return; }
    if (manuelForm.hizmetler.length === 0) { setManuelHata('En az bir hizmet seçin'); return; }
    if (!manuelForm.tarih) { setManuelHata('Tarih seçin'); return; }
    if (!manuelForm.saat) { setManuelHata('Saat seçin'); return; }
    const kapaliKt = isletme?.kapaliTarihler?.find(kt => {
      const kStr = new Date(kt.tarih).toISOString().split('T')[0];
      return kStr === manuelForm.tarih;
    });
    if (kapaliKt?.tumGun) { setManuelHata('Bu tarih kapalı'); return; }
    if (kapaliKt?.saatler?.includes(manuelForm.saat)) { setManuelHata('Bu saat kapalı'); return; }
    setManuelHata('');
    try {
      const hizmetDetaylari = manuelForm.hizmetler
        .map(hAd => isletme.hizmetler.find(h => h.ad === hAd))
        .filter(Boolean);
      const cevap = await fetch('http://localhost:5000/api/randevular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          musteriAdi: manuelForm.musteriAdi,
          musteriTelefon: manuelForm.musteriTelefon,
          isletme: isletme._id,
          hizmet: hizmetDetaylari,
          tarih: manuelForm.tarih,
          saat: manuelForm.saat,
          durum: 'onaylandi',
          manuelMi: true
        })
      });
      const veri = await cevap.json();
      if (!cevap.ok) { setManuelHata(veri.hata || 'Bir hata oluştu'); return; }
      setManuelBasari('Manuel randevu oluşturuldu!');
      randevulariGetir(isletme._id);
      setTimeout(() => {
        setManuelModal(false);
        setManuelBasari('');
        setManuelForm({ musteriAdi: '', musteriTelefon: '', tarih: '', saat: '', hizmetler: [] });
      }, 1500);
    } catch (err) { setManuelHata('Sunucuya bağlanılamadı'); }
  };

  const durumRenk = (durum) => {
    if (durum === 'onaylandi') return { bg: '#F1F8E9', color: '#2E7D32', border: '#C8E6C9' };
    if (durum === 'reddedildi') return { bg: '#FFF5F5', color: '#B91C1C', border: '#FFCDD2' };
    if (durum === 'tamamlandi') return { bg: '#E3F2FD', color: '#1565C0', border: '#BBDEFB' };
    return { bg: '#FFF8E1', color: '#F57F17', border: '#FFE082' };
  };

  const durumLabel = (durum) => {
    if (durum === 'onaylandi') return '✅ Onaylandı';
    if (durum === 'reddedildi') return '❌ Reddedildi';
    if (durum === 'tamamlandi') return '🏁 Tamamlandı';
    return '⏳ Bekliyor';
  };

  const kategoriEmoji = (kat) => {
    if (kat === 'berber') return '✂️';
    if (kat === 'kuafor') return '💅';
    if (kat === 'guzellik') return '💆';
    return '⚽';
  };

  const bugunRandevular = randevular.filter(r => {
    const bugun = new Date().toISOString().split('T')[0];
    return r.tarih?.split('T')[0] === bugun;
  });

  const reklamFiyat = (tip, gun) => {
    const f = fiyatlar[tip];
    if (!f) return 0;
    return gun <= 7 ? f.haftalik : f.aylik;
  };

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', outline: 'none', marginBottom: '12px', background: '#F8FAFC', color: '#111827', transition: 'border-color 0.15s', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' };

  if (yukleniyor) return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
  if (!isletme) return <div style={{ padding: '40px', textAlign: 'center' }}><h2>Henüz işletmeniz yok</h2><button onClick={onCikis}>Çıkış</button></div>;

  return (
    <div className="panel-sayfa">
      <header className="header">
        <div className="header-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="#DC2626" strokeWidth="2"/>
            <path d="M3 9h18" stroke="#DC2626" strokeWidth="2"/>
            <path d="M8 2.5v3M16 2.5v3" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="8" cy="14" r="1.5" fill="#DC2626"/>
            <circle cx="12" cy="14" r="1.5" fill="#DC2626"/>
            <circle cx="16" cy="14" r="1.5" fill="#DC2626"/>
          </svg>
          HizmetPark
        </div>
        <div className="header-orta">
          <span className="isletme-adi">{isletme.isletmeAdi}</span>
          <span className="panel-badge">Yönetim Paneli</span>
        </div>
        <button onClick={onCikis} className="cikis-btn">Çıkış</button>
      </header>

      <div className="metrik-row">
        <div className="metrik-kart">
          <div className="metrik-ikon">📅</div>
          <div className="metrik-sayi">{randevular.length}</div>
          <div className="metrik-label">Toplam Randevu</div>
        </div>
        <div className="metrik-kart">
          <div className="metrik-ikon">☀️</div>
          <div className="metrik-sayi">{bugunRandevular.length}</div>
          <div className="metrik-label">Bugün</div>
        </div>
        <div className="metrik-kart">
          <div className="metrik-ikon">⏳</div>
          <div className="metrik-sayi">{randevular.filter(r => r.durum === 'bekliyor').length}</div>
          <div className="metrik-label">Bekleyen</div>
        </div>
        <div className="metrik-kart">
          <div className="metrik-ikon">⭐</div>
          <div className="metrik-sayi">{isletme.ortalamaPuan || '0'}</div>
          <div className="metrik-label">Ortalama Puan</div>
        </div>
      </div>

      <div className="panel-icerik">
        <div className="sekme-row">
          <button className={`sekme-btn ${aktifSekme === 'randevular' ? 'aktif' : ''}`} onClick={() => setAktifSekme('randevular')}>📅 Randevular</button>
          <button className={`sekme-btn ${aktifSekme === 'sadakat' ? 'aktif' : ''}`} onClick={() => setAktifSekme('sadakat')}>🎁 Sadakat</button>
          <button className={`sekme-btn ${aktifSekme === 'hizmetler' ? 'aktif' : ''}`} onClick={() => setAktifSekme('hizmetler')}>✂️ Hizmetler</button>
          <button className={`sekme-btn ${aktifSekme === 'reklamlar' ? 'aktif' : ''}`} onClick={() => setAktifSekme('reklamlar')}>📢 Reklamlar</button>
          <button className={`sekme-btn ${aktifSekme === 'profil' ? 'aktif' : ''}`} onClick={() => setAktifSekme('profil')}>🏪 Profilim</button>
          <button className={`sekme-btn ${aktifSekme === 'musaitlik' ? 'aktif' : ''}`} onClick={() => setAktifSekme('musaitlik')}>📆 Müsaitlik</button>
          <button className={`sekme-btn ${aktifSekme === 'personel' ? 'aktif' : ''}`} onClick={() => setAktifSekme('personel')}>👥 Personel</button>
          <button className={`sekme-btn ${aktifSekme === 'premium' ? 'aktif' : ''}`} onClick={() => setAktifSekme('premium')}>
            👑 {isletme?.premium?.aktif ? 'Premium ✓' : 'Premium'}
          </button>
          {isletme?.premium?.aktif && (
            <button className={`sekme-btn ${aktifSekme === 'analitik' ? 'aktif' : ''}`} onClick={() => setAktifSekme('analitik')}>
              📊 Analitik
            </button>
          )}
        </div>

        {/* RANDEVULAR */}
        {aktifSekme === 'randevular' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button onClick={() => { setManuelModal(true); setManuelHata(''); setManuelBasari(''); }} style={{ background: '#1565C0', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>+ Manuel Randevu Ekle</button>
            </div>
            {personelListesi.length > 0 && (
              <div style={{display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap'}}>
                <button
                  onClick={() => setPersonelFiltre('hepsi')}
                  style={{padding:'6px 14px', borderRadius:'20px', border: personelFiltre==='hepsi' ? 'none' : '1px solid #E2E8F0', background: personelFiltre==='hepsi' ? '#4F46E5' : 'white', color: personelFiltre==='hepsi' ? 'white' : '#374151', fontSize:'13px', cursor:'pointer', fontWeight:'600'}}>
                  👥 Hepsi
                </button>
                <button
                  onClick={() => setPersonelFiltre('atanmamis')}
                  style={{padding:'6px 14px', borderRadius:'20px', border: personelFiltre==='atanmamis' ? 'none' : '1px solid #E2E8F0', background: personelFiltre==='atanmamis' ? '#4F46E5' : 'white', color: personelFiltre==='atanmamis' ? 'white' : '#374151', fontSize:'13px', cursor:'pointer'}}>
                  — Personelsiz
                </button>
                {personelListesi.map(p => (
                  <button key={p._id}
                    onClick={() => setPersonelFiltre(p._id)}
                    style={{padding:'6px 14px', borderRadius:'20px', border: personelFiltre===p._id ? 'none' : '1px solid #E2E8F0', background: personelFiltre===p._id ? '#4F46E5' : 'white', color: personelFiltre===p._id ? 'white' : '#374151', fontSize:'13px', cursor:'pointer'}}>
                    👤 {p.ad}
                  </button>
                ))}
              </div>
            )}
            {randevular.length === 0 ? <div className="bos-mesaj">Henüz randevu yok</div> : (() => {
              const filtreliRandevular = personelFiltre === 'hepsi'
                ? randevular
                : personelFiltre === 'atanmamis'
                  ? randevular.filter(r => !r.personel)
                  : randevular.filter(r => r.personel === personelFiltre || r.personel?._id === personelFiltre);
              return filtreliRandevular.map(r => {
                const stil = durumRenk(r.durum);
                const hizmetler = Array.isArray(r.hizmet) ? r.hizmet.map(h => h.ad).join(', ') : r.hizmet?.ad || '-';
                const toplam = Array.isArray(r.hizmet) ? r.hizmet.reduce((t, h) => t + (h.fiyat || 0), 0) : r.hizmet?.fiyat || 0;
                return (
                  <div key={r._id} className="randevu-kart">
                    <div className="randevu-sol">
                      <div className="randevu-saat">{r.saat}</div>
                      <div className="randevu-tarih">{new Date(r.tarih).toLocaleDateString('tr-TR')}</div>
                    </div>
                    <div className="randevu-orta">
                      <div className="randevu-musteri">
                        {r.musteri ? `${r.musteri.ad} ${r.musteri.soyad}` : (r.musteriAdi || '—')}
                        {r.manuelMi && <span style={{ fontSize: '11px', background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE', borderRadius: '10px', padding: '2px 7px', marginLeft: '6px', fontWeight: '600' }}>📞 Manuel</span>}
                      </div>
                      {r.musteriTelefon && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>📞 {r.musteriTelefon}</div>}
                      {r.personel && (
                        <div style={{fontSize:'12px', color:'#4F46E5', marginTop:'2px'}}>
                          👤 {personelListesi.find(p => p._id === r.personel || p._id === r.personel?._id)?.ad || 'Personel'}
                        </div>
                      )}
                      <div className="randevu-hizmet">{hizmetler}</div>
                      {r.hediyeMi ? <div style={{ fontSize: '12px', color: '#F57F17', fontWeight: '600' }}>🎁 Hediye — Ücretsiz</div>
                        : toplam > 0 ? <div className="randevu-fiyat">{toplam} ₺</div> : null}
                    </div>
                    <div className="randevu-sag">
                      <span className="durum-badge" style={{ background: stil.bg, color: stil.color, border: `1px solid ${stil.border}` }}>{durumLabel(r.durum)}</span>
                      {r.durum === 'bekliyor' && (
                        <div className="aksiyon-butonlar">
                          <button className="onayla-btn" onClick={() => durumGuncelle(r._id, 'onaylandi')}>Onayla</button>
                          <button className="reddet-btn" onClick={() => durumGuncelle(r._id, 'reddedildi')}>Reddet</button>
                        </div>
                      )}
                      {r.durum === 'onaylandi' && <button className="tamamla-btn" onClick={() => durumGuncelle(r._id, 'tamamlandi')}>Tamamlandı</button>}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* SADAKAT */}
        {aktifSekme === 'sadakat' && (
          <div>
            <div className="sadakat-ayar-kart">
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🎁 Sadakat Programı Ayarları</h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '120px' }}>
                  <label style={labelStyle}>Kaç ziyarette ödül?</label>
                  <input type="number" min="1" max="20" value={hedefZiyaret} onChange={e => setHedefZiyaret(e.target.value)} onFocus={e => e.target.select()} style={inputStyle} />
                </div>
                <div style={{ flex: '3', minWidth: '200px' }}>
                  <label style={labelStyle}>Hediye ne olsun?</label>
                  <input type="text" value={hediye} onChange={e => setHediye(e.target.value)} placeholder="Örn: Ücretsiz Saç Yıkama" style={inputStyle} />
                </div>
                <button onClick={sadakatKaydet} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>Kaydet</button>
              </div>
              {sadakatKayitBasari && <div style={{ background: '#F1F8E9', color: '#2E7D32', padding: '10px', borderRadius: '8px', fontSize: '13px', border: '1px solid #C8E6C9' }}>✅ {sadakatKayitBasari}</div>}
              <div style={{ background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '10px 14px', marginTop: '8px', fontSize: '13px', color: '#DC2626' }}>
                🎁 Her <strong>{hedefZiyaret}</strong> ziyarette müşteriye <strong>{hediye}</strong> hediye edilecek
              </div>
              {isletme?.premium?.aktif && (
                <div style={{marginTop:'20px', padding:'16px', background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', borderRadius:'12px', border:'1px solid #F59E0B'}}>
                  <div style={{fontWeight:'700', fontSize:'14px', marginBottom:'12px'}}>👑 VIP Müşteri Ayarları <span style={{fontSize:'12px', color:'#92400E', background:'#FEF3C7', padding:'2px 8px', borderRadius:'20px', marginLeft:'6px'}}>Premium</span></div>
                  <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'10px'}}>
                    <div style={{flex:1, minWidth:'120px'}}>
                      <label style={{fontSize:'12px', color:'#92400E', fontWeight:'600', display:'block', marginBottom:'4px'}}>VIP Hedef Ziyaret</label>
                      <input
                        type="number" min="1" max="20"
                        value={vipHedef}
                        onChange={e => setVipHedef(e.target.value)}
                        style={{width:'100%', padding:'8px 12px', borderRadius:'8px', border:'1px solid #F59E0B', fontSize:'14px', background:'white'}}
                      />
                    </div>
                    <div style={{flex:2, minWidth:'180px'}}>
                      <label style={{fontSize:'12px', color:'#92400E', fontWeight:'600', display:'block', marginBottom:'4px'}}>VIP Hediye</label>
                      <input
                        type="text"
                        value={vipHediye}
                        onChange={e => setVipHediye(e.target.value)}
                        placeholder="örn: Ücretsiz Saç Boyama"
                        style={{width:'100%', padding:'8px 12px', borderRadius:'8px', border:'1px solid #F59E0B', fontSize:'14px', background:'white'}}
                      />
                    </div>
                  </div>
                  <div style={{fontSize:'12px', color:'#92400E'}}>
                    👑 Her <strong>{vipHedef}</strong> ziyarette VIP müşteriye <strong>{vipHediye}</strong> hediye edilecek
                  </div>
                </div>
              )}
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '20px 0 12px' }}>Sadakat Müşterileri ({sadakatListesi.length})</h3>
            {sadakatListesi.length === 0 ? <div className="bos-mesaj">Henüz sadakat müşterisi yok</div> : (
              sadakatListesi.map((s, i) => {
                const bekleyenOdul = s.kazanilanOduller?.filter(o => !o.kullanildi).length || 0;
                return (
                  <div key={i} className="randevu-kart">
                    <div className="randevu-sol" style={{ minWidth: '50px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF5F5', border: '2px solid #FFCDD2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#DC2626' }}>
                        {s.musteri?.ad?.[0]}{s.musteri?.soyad?.[0]}
                      </div>
                    </div>
                    <div className="randevu-orta">
                      <div className="randevu-musteri">
                        {s.musteri?.ad} {s.musteri?.soyad}
                        {s.toplamZiyaret >= vipHedef && (
                          <span style={{background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', marginLeft:'6px'}}>👑 VIP</span>
                        )}
                      </div>
                      <div className="randevu-hizmet">{s.musteri?.email}</div>
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: '1', height: '6px', background: '#F0F0F0', borderRadius: '20px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min((s.mevcutPuan / s.odul.hedefZiyaret) * 100, 100)}%`, background: '#DC2626', borderRadius: '20px' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: '700' }}>{s.mevcutPuan}/{s.odul.hedefZiyaret}</span>
                      </div>
                    </div>
                    <div className="randevu-sag">
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#999' }}>Toplam</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#DC2626' }}>{s.toplamZiyaret} ziyaret</div>
                      </div>
                      {bekleyenOdul > 0 && <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', color: '#F57F17', marginTop: '4px' }}>🎁 {bekleyenOdul} ödül bekliyor</div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* HİZMETLER */}
        {aktifSekme === 'hizmetler' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button onClick={() => setYeniHizmetModal(true)} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>+ Yeni Hizmet Ekle</button>
            </div>
            {isletme.hizmetler.map((h, i) => (
              <div key={i} className="hizmet-satir-panel">
                <div style={{ flex: 1 }}>
                  <div className="hizmet-adi-panel">{h.ad}</div>
                  <div className="hizmet-sure">⏱ {h.sure} dk</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="hizmet-fiyat-panel">{h.fiyat} ₺</div>
                  <button onClick={() => { setDuzenleHizmet({ ...h }); setDuzenleModal(true); }} style={{ background: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>✏️ Düzenle</button>
                  <button onClick={() => hizmetSil(h._id)} style={{ background: '#FFF5F5', color: '#B91C1C', border: '1px solid #FFCDD2', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>🗑️ Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REKLAMLAR */}
        {aktifSekme === 'reklamlar' && (
          <div>
            {reklamBasari && <div style={{ background: '#F1F8E9', color: '#2E7D32', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #C8E6C9' }}>✅ {reklamBasari}</div>}

            {/* Fiyat tablosu */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #F0F0F0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1A1A1A' }}>💰 Reklam Fiyatları</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {[
                  { tip: 'slider', baslik: '📢 Ana Sayfa Slider', aciklama: 'En yüksek görünürlük', renk: '#FF7043' },
                  { tip: 'one_cikma', baslik: '📍 Öne Çıkarma', aciklama: 'Aramada ilk sıra', renk: '#7C3AED' },
                  { tip: 'sponsorlu', baslik: '🃏 Sponsorlu Kart', aciklama: 'Feed\'de görün', renk: '#F59E0B' }
                ].map(f => (
                  <div key={f.tip} style={{ border: `2px solid ${f.renk}22`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: f.renk, marginBottom: '6px' }}>{f.baslik}</div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>{f.aciklama}</div>
                    <div style={{ fontSize: '13px', color: '#555' }}>7 gün: <strong style={{ color: f.renk }}>{fiyatlar[f.tip].haftalik} ₺</strong></div>
                    <div style={{ fontSize: '13px', color: '#555' }}>30 gün: <strong style={{ color: f.renk }}>{fiyatlar[f.tip].aylik} ₺</strong></div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={() => setYeniReklamModal(true)} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                + Yeni Reklam Oluştur
              </button>
            </div>

            {reklamlar.length === 0 ? (
              <div className="bos-mesaj">Henüz reklam yok</div>
            ) : (
              reklamlar.map((r, i) => {
                const bitis = new Date(r.bitisTarihi);
                const simdi = new Date();
                const kaliyor = Math.ceil((bitis - simdi) / (1000 * 60 * 60 * 24));
                const aktif = r.aktif && bitis > simdi;
                return (
                  <div key={i} className="randevu-kart" style={{ borderLeft: `4px solid ${aktif ? '#2E7D32' : '#BDBDBD'}` }}>
                    <div className="randevu-orta">
                      <div className="randevu-musteri">{tipLabel[r.tip]}</div>
                      <div className="randevu-hizmet">{r.baslik}</div>
                      {r.aciklama && <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{r.aciklama}</div>}
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        {new Date(r.baslangicTarihi).toLocaleDateString('tr-TR')} — {bitis.toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <div className="randevu-sag" style={{ alignItems: 'flex-end' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: aktif ? '#F1F8E9' : '#F5F5F5', color: aktif ? '#2E7D32' : '#999', border: `1px solid ${aktif ? '#C8E6C9' : '#E0E0E0'}` }}>
                          {aktif ? `✅ Aktif (${kaliyor} gün)` : '⛔ Bitti'}
                        </span>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>👁 {r.tiklama} tıklama</div>
                      </div>
                      {aktif && (
                        <button onClick={() => reklamIptal(r._id)} style={{ background: '#FFF5F5', color: '#B91C1C', border: '1px solid #FFCDD2', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
                          İptal Et
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PROFİLİM */}
        {aktifSekme === 'profil' && (
          <div>
            {!duzenleModuAcik ? (
              /* MÜŞTERİ GÖRÜNÜMÜ ÖNİZLEMESİ */
              <IsletmeProfil
                key={profilAnahtar}
                isletmeId={isletme._id}
                isOwnerView={true}
                onDuzenle={() => setDuzenleModuAcik(true)}
                onGeri={null}
              />
            ) : (
              /* DÜZENLEME FORMU */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setDuzenleModuAcik(false)}
                    style={{ background: 'transparent', border: '1.5px solid #E2E8F0', color: '#374151', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s' }}
                  >
                    ← Önizlemeye Dön
                  </button>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>✏️ Profili Düzenle</h3>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0', maxWidth: '680px' }}>
                  <label style={labelStyle}>İşletme Adı</label>
                  <input style={inputStyle} value={profilForm.isletmeAdi || ''} onChange={e => setProfilForm({ ...profilForm, isletmeAdi: e.target.value })} />

                  <label style={labelStyle}>Slogan</label>
                  <input style={inputStyle} placeholder="20 yıllık deneyimle hizmetinizdeyiz" value={profilForm.slogan || ''} onChange={e => setProfilForm({ ...profilForm, slogan: e.target.value })} />

                  <label style={labelStyle}>Hakkında</label>
                  <textarea style={{ ...inputStyle, height: '100px', resize: 'none', fontFamily: 'inherit' }} placeholder="İşletmenizi tanıtın..." value={profilForm.hakkinda || ''} onChange={e => setProfilForm({ ...profilForm, hakkinda: e.target.value })} />

                  <label style={labelStyle}>Telefon</label>
                  <input style={inputStyle} value={profilForm.telefon || ''} onChange={e => setProfilForm({ ...profilForm, telefon: e.target.value })} />

                  <label style={labelStyle}>Açık Adres</label>
                  <input style={inputStyle} value={profilForm.adres?.acikAdres || ''} onChange={e => setProfilForm({ ...profilForm, adres: { ...profilForm.adres, acikAdres: e.target.value } })} />

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>İl</label>
                      <input style={inputStyle} value={profilForm.adres?.il || ''} onChange={e => setProfilForm({ ...profilForm, adres: { ...profilForm.adres, il: e.target.value } })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>İlçe</label>
                      <input style={inputStyle} value={profilForm.adres?.ilce || ''} onChange={e => setProfilForm({ ...profilForm, adres: { ...profilForm.adres, ilce: e.target.value } })} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Açılış Saati</label>
                      <input style={inputStyle} type="time" value={profilForm.calismaBaslangic || ''} onChange={e => setProfilForm({ ...profilForm, calismaBaslangic: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Kapanış Saati</label>
                      <input style={inputStyle} type="time" value={profilForm.calismaBitis || ''} onChange={e => setProfilForm({ ...profilForm, calismaBitis: e.target.value })} />
                    </div>
                  </div>

                  <label style={labelStyle}>İşletme Fotoğrafı</label>
                  {profilForm.fotograf && (
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <img src={profilForm.fotograf} alt="işletme" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button onClick={() => setProfilForm({ ...profilForm, fotograf: '' })} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                    </div>
                  )}
                  <input type="file" accept="image/*" style={{ display: 'none' }} id="fotograf-input" onChange={fotografYukle} />
                  <label htmlFor="fotograf-input" style={{ display: 'block', padding: '12px', border: '1.5px dashed #E2E8F0', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', color: '#9CA3AF', marginBottom: '16px' }}>
                    📷 {profilForm.fotograf ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'} (max 2MB)
                  </label>

                  {profilBasari && <div style={{ background: '#ECFDF5', color: '#065F46', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid #A7F3D0' }}>✅ {profilBasari}</div>}
                  <button onClick={profilKaydet} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>Kaydet</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MÜSAİTLİK */}
        {aktifSekme === 'musaitlik' && (
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #F0F0F0', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>📆 Kapalı Tarih Ekle</h3>
              <label style={labelStyle}>Tarih</label>
              <input type="date" min={bugunTarih} value={musaitlikTarih} onChange={e => setMusaitlikTarih(e.target.value)} style={inputStyle} />
              <label style={labelStyle}>Açıklama (opsiyonel)</label>
              <input type="text" placeholder="Örn: Tatil, Öğle arası" value={musaitlikAciklama} onChange={e => setMusaitlikAciklama(e.target.value)} style={inputStyle} />
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={musaitlikTumGun} onChange={e => { setMusaitlikTumGun(e.target.checked); if (e.target.checked) setMusaitlikSaatler([]); }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>Tüm gün kapalı</span>
                </label>
              </div>
              {!musaitlikTumGun && (
                <div>
                  <label style={labelStyle}>Kapalı Saatler</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {saatler.map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px', border: `1.5px solid ${musaitlikSaatler.includes(s) ? '#DC2626' : '#E0E0E0'}`, borderRadius: '8px', cursor: 'pointer', background: musaitlikSaatler.includes(s) ? '#FFF5F5' : 'white', fontSize: '13px', fontWeight: '500', color: musaitlikSaatler.includes(s) ? '#DC2626' : '#555', transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={musaitlikSaatler.includes(s)} onChange={e => setMusaitlikSaatler(e.target.checked ? [...musaitlikSaatler, s] : musaitlikSaatler.filter(x => x !== s))} style={{ display: 'none' }} />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {musaitlikBasari && <div style={{ background: '#F1F8E9', color: '#2E7D32', padding: '10px', borderRadius: '8px', fontSize: '13px', border: '1px solid #C8E6C9', marginBottom: '12px' }}>✅ {musaitlikBasari}</div>}
              <button onClick={kapaliTarihEkle} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                + Ekle
              </button>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px' }}>Kapalı Tarihler ({(isletme.kapaliTarihler || []).length})</h3>
            {(isletme.kapaliTarihler || []).length === 0 ? (
              <div className="bos-mesaj">Kapalı tarih yok</div>
            ) : (
              (isletme.kapaliTarihler || []).map((kt, i) => (
                <div key={kt._id || i} className="randevu-kart">
                  <div className="randevu-sol">
                    <div className="randevu-saat" style={{ fontSize: '20px' }}>🚫</div>
                    <div className="randevu-tarih">{new Date(kt.tarih).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <div className="randevu-orta">
                    <div className="randevu-musteri">{kt.tumGun ? 'Tüm Gün Kapalı' : `${kt.saatler?.length || 0} saat kapalı`}</div>
                    {!kt.tumGun && kt.saatler?.length > 0 && <div className="randevu-hizmet">{kt.saatler.join(', ')}</div>}
                    {kt.aciklama && <div className="randevu-hizmet">{kt.aciklama}</div>}
                  </div>
                  <div className="randevu-sag">
                    <button onClick={() => kapaliTarihKaldir(kt._id)} style={{ background: '#FFF5F5', color: '#B91C1C', border: '1px solid #FFCDD2', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      🗑 Kaldır
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PERSONEL */}
        {aktifSekme === 'personel' && (
          <div className="sekme-icerik">
            <h3>👥 Personel Yönetimi</h3>
            <div style={{display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap'}}>
              <input
                placeholder="Personel adı *"
                value={yeniPersonelAd}
                onChange={e => setYeniPersonelAd(e.target.value)}
                style={{padding:'8px 12px', borderRadius:'8px', border:'1px solid #E2E8F0', fontSize:'14px', flex:1, minWidth:'140px'}}
              />
              <input
                placeholder="Ünvan (örn: Usta Berber)"
                value={yeniPersonelUnvan}
                onChange={e => setYeniPersonelUnvan(e.target.value)}
                style={{padding:'8px 12px', borderRadius:'8px', border:'1px solid #E2E8F0', fontSize:'14px', flex:1, minWidth:'140px'}}
              />
              <button onClick={personelEkle} disabled={personelYukleniyor}
                style={{padding:'8px 16px', background:'#4F46E5', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>
                + Ekle
              </button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {personelListesi.length === 0 && <p style={{color:'#94A3B8'}}>Henüz personel eklenmemiş.</p>}
              {personelListesi.map(p => (
                <div key={p._id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#F8FAFC', borderRadius:'10px', border:'1px solid #E2E8F0'}}>
                  <div>
                    <div style={{fontWeight:'600', fontSize:'14px'}}>👤 {p.ad}</div>
                    <div style={{fontSize:'12px', color:'#64748B'}}>{p.unvan}</div>
                  </div>
                  <button onClick={() => personelSil(p._id)}
                    style={{padding:'6px 12px', background:'white', color:'#EF4444', border:'1px solid #EF4444', borderRadius:'8px', cursor:'pointer', fontSize:'13px'}}>
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREMİUM */}
        {aktifSekme === 'premium' && (
          <div className="sekme-icerik">
            {isletme?.premium?.aktif ? (
              <div>
                <div style={{background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:'16px', padding:'24px', color:'white', marginBottom:'24px'}}>
                  <div style={{fontSize:'28px', marginBottom:'4px'}}>👑 Premium Aktif</div>
                  <div style={{opacity:0.85, fontSize:'14px'}}>Paket: {isletme.premium.paket === 'yillik' ? 'Yıllık' : 'Aylık'}</div>
                  <div style={{opacity:0.85, fontSize:'14px'}}>Bitiş: {new Date(isletme.premium.bitis).toLocaleDateString('tr-TR')}</div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                  <div
                    key="analitik"
                    onClick={() => setAktifSekme('analitik')}
                    style={{background:'#F8FAFC', borderRadius:'12px', padding:'16px', border:'1px solid #E2E8F0', cursor:'pointer', transition:'box-shadow 0.2s'}}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(79,70,229,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                  >
                    <div style={{fontSize:'24px', marginBottom:'6px'}}>📊</div>
                    <div style={{fontWeight:'600', fontSize:'14px', marginBottom:'4px'}}>Analitik Dashboard</div>
                    <div style={{fontSize:'12px', color:'#64748B'}}>Ciro, müşteri ve randevu istatistikleri</div>
                    <div style={{marginTop:'8px', fontSize:'12px', color:'#10B981', fontWeight:'600'}}>✓ Aç →</div>
                  </div>
                  {[
                    {ikon:'👑', baslik:'VIP Müşteri Sistemi', aciklama:'Özel hediye ve indirimler'},
                    {ikon:'🎨', baslik:'Yoğunluk Göstergesi', aciklama:'Takvimde dolu/boş saat renkleri'},
                    {ikon:'⭐', baslik:'Öne Çıkma', aciklama:'Anasayfada üst sırada görün'},
                    {ikon:'🎁', baslik:'Gelişmiş Hediyeler', aciklama:'VIP müşterilere özel ödüller'},
                    {ikon:'📈', baslik:'Segment Analizi', aciklama:'Müşteri segmentlerini görüntüle'},
                  ].map(f => (
                    <div key={f.baslik} style={{background:'#F8FAFC', borderRadius:'12px', padding:'16px', border:'1px solid #E2E8F0'}}>
                      <div style={{fontSize:'24px', marginBottom:'6px'}}>{f.ikon}</div>
                      <div style={{fontWeight:'600', fontSize:'14px', marginBottom:'4px'}}>{f.baslik}</div>
                      <div style={{fontSize:'12px', color:'#64748B'}}>{f.aciklama}</div>
                      <div style={{marginTop:'8px', fontSize:'12px', color:'#10B981', fontWeight:'600'}}>✓ Aktif</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{textAlign:'center', padding:'32px 16px'}}>
                <div style={{fontSize:'48px', marginBottom:'12px'}}>👑</div>
                <h3 style={{fontSize:'20px', fontWeight:'700', marginBottom:'8px'}}>Premium'a Geçin</h3>
                <p style={{color:'#64748B', marginBottom:'24px', fontSize:'14px'}}>Analitik, VIP müşteri sistemi, yoğunluk göstergesi ve daha fazlası</p>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px', textAlign:'left'}}>
                  {[
                    {ikon:'📊', baslik:'Analitik Dashboard', aciklama:'Ciro ve istatistikler'},
                    {ikon:'👑', baslik:'VIP Müşteri', aciklama:'Özel hediye ve indirimler'},
                    {ikon:'🎨', baslik:'Yoğunluk Göstergesi', aciklama:'Takvim renk kodlaması'},
                    {ikon:'⭐', baslik:'Öne Çıkma', aciklama:'Anasayfada üst sıra'},
                    {ikon:'🎁', baslik:'Gelişmiş Hediyeler', aciklama:'VIP ödül sistemi'},
                    {ikon:'📈', baslik:'Segment Analizi', aciklama:'Müşteri grupları'},
                  ].map(f => (
                    <div key={f.baslik} style={{background:'#F8FAFC', borderRadius:'12px', padding:'12px', border:'1px solid #E2E8F0', opacity:0.7}}>
                      <div style={{fontSize:'20px', marginBottom:'4px'}}>{f.ikon}</div>
                      <div style={{fontWeight:'600', fontSize:'13px'}}>{f.baslik}</div>
                      <div style={{fontSize:'12px', color:'#64748B'}}>{f.aciklama}</div>
                      <div style={{marginTop:'6px', fontSize:'11px', color:'#94A3B8'}}>🔒 Kilitli</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
                  <div style={{background:'white', border:'2px solid #4F46E5', borderRadius:'16px', padding:'20px 24px', minWidth:'160px'}}>
                    <div style={{fontWeight:'700', fontSize:'16px', color:'#4F46E5'}}>Aylık</div>
                    <div style={{fontSize:'24px', fontWeight:'800', margin:'8px 0'}}>299₺</div>
                    <div style={{fontSize:'12px', color:'#64748B'}}>/ ay</div>
                  </div>
                  <div style={{background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:'16px', padding:'20px 24px', minWidth:'160px', color:'white', position:'relative'}}>
                    <div style={{position:'absolute', top:'-10px', left:'50%', transform:'translateX(-50%)', background:'#10B981', color:'white', fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px'}}>EN POPÜLER</div>
                    <div style={{fontWeight:'700', fontSize:'16px'}}>Yıllık</div>
                    <div style={{fontSize:'24px', fontWeight:'800', margin:'8px 0'}}>199₺</div>
                    <div style={{fontSize:'12px', opacity:0.8}}>/ ay · %33 indirim</div>
                  </div>
                </div>
                <p style={{marginTop:'16px', fontSize:'12px', color:'#94A3B8'}}>Premium aktivasyonu için yöneticinizle iletişime geçin.</p>
                {!isletme?.premium?.aktif && (
                  <button
                    onClick={async () => {
                      try {
                        const cevap = await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/premium`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ paket: 'aylik' })
                        });
                        if (cevap.ok) {
                          await isletmeyiGetir();
                        } else {
                          const veri = await cevap.json();
                          console.error('Premium hata:', veri);
                        }
                      } catch (err) { console.error(err); }
                    }}
                    style={{marginTop:'12px', padding:'10px 24px', background:'#10B981', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'600', fontSize:'14px'}}>
                    🧪 Test: Premium Aktif Et (Geçici)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ANALİTİK */}
        {aktifSekme === 'analitik' && isletme?.premium?.aktif && (
          <div className="sekme-icerik">
            <h3 style={{marginBottom:'20px'}}>📊 Analitik Dashboard</h3>
            {analitikYukleniyor ? (
              <div style={{textAlign:'center', padding:'40px', color:'#94A3B8'}}>Yükleniyor...</div>
            ) : analitik ? (
              <div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px'}}>
                  {[
                    {ikon:'📅', baslik:'Toplam Randevu', deger: analitik.ozet.toplamRandevu},
                    {ikon:'✅', baslik:'Tamamlanan', deger: analitik.ozet.tamamlanan},
                    {ikon:'❌', baslik:'İptal', deger: analitik.ozet.iptal},
                    {ikon:'💰', baslik:'Toplam Ciro', deger: `${analitik.ozet.toplamCiro}₺`},
                  ].map(k => (
                    <div key={k.baslik} style={{background:'white', borderRadius:'12px', padding:'16px', border:'1px solid #E2E8F0', textAlign:'center'}}>
                      <div style={{fontSize:'24px'}}>{k.ikon}</div>
                      <div style={{fontSize:'22px', fontWeight:'800', color:'#0F172A', margin:'4px 0'}}>{k.deger}</div>
                      <div style={{fontSize:'12px', color:'#64748B'}}>{k.baslik}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E2E8F0', marginBottom:'16px'}}>
                  <h4 style={{marginBottom:'16px', fontSize:'15px'}}>👥 Müşteri Segmentleri</h4>
                  <div style={{display:'flex', gap:'12px'}}>
                    {[
                      {etiket:'🆕 Yeni', sayi: analitik.segmentler.yeni, renk:'#3B82F6'},
                      {etiket:'🔄 Düzenli', sayi: analitik.segmentler.duzenli, renk:'#10B981'},
                      {etiket:'👑 VIP', sayi: analitik.segmentler.vip, renk:'#F59E0B'},
                    ].map(s => (
                      <div key={s.etiket} style={{flex:1, textAlign:'center', padding:'16px', borderRadius:'10px', background:'#F8FAFC', border:`2px solid ${s.renk}20`}}>
                        <div style={{fontSize:'28px', fontWeight:'800', color:s.renk}}>{s.sayi}</div>
                        <div style={{fontSize:'13px', color:'#64748B', marginTop:'4px'}}>{s.etiket}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E2E8F0', marginBottom:'16px'}}>
                  <h4 style={{marginBottom:'16px', fontSize:'15px'}}>✂️ En Popüler Hizmetler</h4>
                  {analitik.populerHizmetler.map((h, i) => (
                    <div key={h.ad} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: i < analitik.populerHizmetler.length-1 ? '1px solid #F1F5F9' : 'none'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'#4F46E510', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#4F46E5'}}>{i+1}</div>
                        <span style={{fontSize:'14px', fontWeight:'500'}}>{h.ad}</span>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'14px', fontWeight:'700', color:'#0F172A'}}>{h.sayi}x</div>
                        <div style={{fontSize:'12px', color:'#64748B'}}>{h.ciro}₺</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E2E8F0'}}>
                  <h4 style={{marginBottom:'16px', fontSize:'15px'}}>⭐ En Sadık Müşteriler</h4>
                  {analitik.topMusteriler.map((m, i) => (
                    <div key={m.ad} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: i < analitik.topMusteriler.length-1 ? '1px solid #F1F5F9' : 'none'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{width:'28px', height:'28px', borderRadius:'50%', background: i===0?'#FEF3C7': i===1?'#F1F5F9':'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px'}}>{i===0?'🥇':i===1?'🥈':'🥉'}</div>
                        <span style={{fontSize:'14px', fontWeight:'500'}}>{m.ad}</span>
                      </div>
                      <div style={{fontSize:'14px', fontWeight:'700', color:'#4F46E5'}}>{m.sayi} randevu</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{textAlign:'center', padding:'40px', color:'#94A3B8'}}>Veri yüklenemedi</div>
            )}
          </div>
        )}
      </div>

      {/* HİZMET DÜZENLE MODAL */}
      {duzenleModal && duzenleHizmet && (
        <div className="modal-overlay" onClick={() => setDuzenleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>✏️ Hizmet Düzenle</h2><button className="modal-kapat" onClick={() => setDuzenleModal(false)}>✕</button></div>
            <label style={labelStyle}>Hizmet Adı</label>
            <input style={inputStyle} value={duzenleHizmet.ad} onChange={e => setDuzenleHizmet({ ...duzenleHizmet, ad: e.target.value })} />
            <label style={labelStyle}>Süre (dakika)</label>
            <input style={inputStyle} type="number" value={duzenleHizmet.sure} onFocus={e => e.target.select()} onChange={e => setDuzenleHizmet({ ...duzenleHizmet, sure: e.target.value })} />
            <label style={labelStyle}>Fiyat (₺)</label>
            <input style={inputStyle} type="number" value={duzenleHizmet.fiyat} onFocus={e => e.target.select()} onChange={e => setDuzenleHizmet({ ...duzenleHizmet, fiyat: e.target.value })} />
            <button onClick={hizmetDuzenleKaydet} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>Kaydet</button>
          </div>
        </div>
      )}

      {/* YENİ HİZMET MODAL */}
      {yeniHizmetModal && (
        <div className="modal-overlay" onClick={() => setYeniHizmetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>+ Yeni Hizmet Ekle</h2><button className="modal-kapat" onClick={() => setYeniHizmetModal(false)}>✕</button></div>
            <label style={labelStyle}>Hizmet Adı</label>
            <input style={inputStyle} placeholder="Örn: Saç Boyama" value={yeniHizmet.ad} onChange={e => setYeniHizmet({ ...yeniHizmet, ad: e.target.value })} />
            <label style={labelStyle}>Süre (dakika)</label>
            <input style={inputStyle} type="number" placeholder="20" value={yeniHizmet.sure} onFocus={e => e.target.select()} onChange={e => setYeniHizmet({ ...yeniHizmet, sure: e.target.value })} />
            <label style={labelStyle}>Fiyat (₺)</label>
            <input style={inputStyle} type="number" placeholder="150" value={yeniHizmet.fiyat} onFocus={e => e.target.select()} onChange={e => setYeniHizmet({ ...yeniHizmet, fiyat: e.target.value })} />
            <button onClick={hizmetEkle} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>Ekle</button>
          </div>
        </div>
      )}

      {/* YENİ REKLAM MODAL */}
      {yeniReklamModal && (
        <div className="modal-overlay" onClick={() => setYeniReklamModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>📢 Yeni Reklam Oluştur</h2><button className="modal-kapat" onClick={() => setYeniReklamModal(false)}>✕</button></div>

            <label style={labelStyle}>Reklam Tipi</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { tip: 'slider', label: '📢 Slider', fiyat: `${fiyatlar.slider.haftalik}₺/hafta` },
                { tip: 'one_cikma', label: '📍 Öne Çıkar', fiyat: `${fiyatlar.one_cikma.haftalik}₺/hafta` },
                { tip: 'sponsorlu', label: '🃏 Sponsorlu', fiyat: `${fiyatlar.sponsorlu.haftalik}₺/hafta` }
              ].map(t => (
                <div
                  key={t.tip}
                  onClick={() => setYeniReklam({ ...yeniReklam, tip: t.tip })}
                  style={{ border: `2px solid ${yeniReklam.tip === t.tip ? '#DC2626' : '#E0E0E0'}`, borderRadius: '8px', padding: '10px', textAlign: 'center', cursor: 'pointer', background: yeniReklam.tip === t.tip ? '#FFF5F5' : 'white' }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', color: yeniReklam.tip === t.tip ? '#DC2626' : '#555' }}>{t.label}</div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{t.fiyat}</div>
                </div>
              ))}
            </div>

            <label style={labelStyle}>Başlık</label>
            <input style={inputStyle} placeholder="Örn: Mayıs indirimi %20" value={yeniReklam.baslik} onChange={e => setYeniReklam({ ...yeniReklam, baslik: e.target.value })} />

            <label style={labelStyle}>Açıklama (opsiyonel)</label>
            <input style={inputStyle} placeholder="Kısa bir açıklama..." value={yeniReklam.aciklama} onChange={e => setYeniReklam({ ...yeniReklam, aciklama: e.target.value })} />

            <label style={labelStyle}>Reklam Görseli (opsiyonel)</label>
            {yeniReklam.gorsel && (
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <img src={yeniReklam.gorsel} alt="reklam" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                <button onClick={() => setYeniReklam({ ...yeniReklam, gorsel: '' })} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
              </div>
            )}
            <input type="file" accept="image/*" style={{ display: 'none' }} id="reklam-gorsel-input" onChange={reklamGorselYukle} />
            <label htmlFor="reklam-gorsel-input" style={{ display: 'block', padding: '10px', border: '1.5px dashed #E0E0E0', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', color: '#777', marginBottom: '12px' }}>
              🖼️ {yeniReklam.gorsel ? 'Görseli Değiştir' : 'Görsel Yükle'}
            </label>

            <label style={labelStyle}>Süre</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[7, 14, 30].map(g => (
                <button
                  key={g}
                  onClick={() => setYeniReklam({ ...yeniReklam, gun: g })}
                  style={{ flex: 1, padding: '10px', border: `2px solid ${yeniReklam.gun === g ? '#DC2626' : '#E0E0E0'}`, borderRadius: '8px', background: yeniReklam.gun === g ? '#FFF5F5' : 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: yeniReklam.gun === g ? '#DC2626' : '#555' }}
                >
                  {g} gün<br />
                  <span style={{ fontSize: '11px', fontWeight: '400' }}>{reklamFiyat(yeniReklam.tip, g)} ₺</span>
                </button>
              ))}
            </div>

            <div style={{ background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#DC2626', textAlign: 'center' }}>
              Toplam: <strong>{reklamFiyat(yeniReklam.tip, yeniReklam.gun)} ₺</strong> — {yeniReklam.gun} gün {tipLabel[yeniReklam.tip]}
            </div>

            <button onClick={reklamOlustur} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
              Reklamı Yayınla
            </button>
          </div>
        </div>
      )}


      {/* MANUEL RANDEVU MODAL */}
      {manuelModal && (
        <div className="modal-overlay" onClick={() => setManuelModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📞 Manuel Randevu Ekle</h2>
              <button className="modal-kapat" onClick={() => setManuelModal(false)}>✕</button>
            </div>
            {manuelBasari ? (
              <div style={{ background: '#F1F8E9', color: '#2E7D32', padding: '14px', borderRadius: '8px', border: '1px solid #C8E6C9', fontWeight: '600' }}>✅ {manuelBasari}</div>
            ) : (
              <>
                {manuelHata && <div style={{ background: '#FFF5F5', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FFCDD2', marginBottom: '12px', fontSize: '13px' }}>{manuelHata}</div>}

                <label style={labelStyle}>Müşteri Adı *</label>
                <input style={inputStyle} placeholder="Ad Soyad" value={manuelForm.musteriAdi} onChange={e => setManuelForm({ ...manuelForm, musteriAdi: e.target.value })} />

                <label style={labelStyle}>Müşteri Telefonu</label>
                <input style={inputStyle} placeholder="0555 123 45 67" value={manuelForm.musteriTelefon} onChange={e => setManuelForm({ ...manuelForm, musteriTelefon: e.target.value })} />

                <label style={labelStyle}>Hizmet Seç *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  {isletme.hizmetler.map((h, i) => {
                    const secili = manuelForm.hizmetler.includes(h.ad);
                    return (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: `1.5px solid ${secili ? '#1565C0' : '#E2E8F0'}`, borderRadius: '8px', cursor: 'pointer', background: secili ? '#EEF2FF' : 'white', fontSize: '13px' }}>
                        <input type="checkbox" checked={secili} onChange={e => setManuelForm({ ...manuelForm, hizmetler: e.target.checked ? [...manuelForm.hizmetler, h.ad] : manuelForm.hizmetler.filter(x => x !== h.ad) })} />
                        <span style={{ flex: 1, fontWeight: secili ? '600' : '400', color: secili ? '#1565C0' : '#374151' }}>{h.ad}</span>
                        <span style={{ fontSize: '12px', color: '#999' }}>{h.sure} dk</span>
                        <span style={{ fontWeight: '600', color: '#374151' }}>{h.fiyat} ₺</span>
                      </label>
                    );
                  })}
                </div>

                <label style={labelStyle}>Tarih *</label>
                <input type="date" min={bugunTarih} value={manuelForm.tarih} onChange={e => setManuelForm({ ...manuelForm, tarih: e.target.value, saat: '' })} style={inputStyle} />
                {(() => {
                  const kt = manuelForm.tarih && isletme?.kapaliTarihler?.find(k => new Date(k.tarih).toISOString().split('T')[0] === manuelForm.tarih);
                  return kt?.tumGun ? (
                    <div style={{ background: '#FFF5F5', color: '#C62828', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid #FFCDD2', marginBottom: '12px' }}>
                      ⛔ Bu tarih kapalı{kt.aciklama ? ` (${kt.aciklama})` : ''}
                    </div>
                  ) : null;
                })()}

                <label style={labelStyle}>Saat *</label>
                <div className="saat-grid">
                  {saatler.map(s => {
                    const kt = manuelForm.tarih && isletme?.kapaliTarihler?.find(k => new Date(k.tarih).toISOString().split('T')[0] === manuelForm.tarih);
                    const isKapali = kt?.tumGun || kt?.saatler?.includes(s);
                    const isDolu = randevular.some(r => r.tarih?.split('T')[0] === manuelForm.tarih && r.saat === s && r.durum !== 'reddedildi');
                    return (
                      <button
                        key={s}
                        className={`saat-btn ${manuelForm.saat === s ? 'secili' : ''} ${isDolu || isKapali ? 'dolu' : ''}`}
                        onClick={() => !isDolu && !isKapali && setManuelForm({ ...manuelForm, saat: s })}
                        disabled={isDolu || isKapali}
                      >
                        {isKapali ? '🚫' : isDolu ? '🔒' : s}
                      </button>
                    );
                  })}
                </div>

                <button onClick={manuelRandevuOlustur} style={{ background: '#1565C0', color: 'white', border: 'none', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '20px' }}>
                  Randevuyu Kaydet (Onaylı)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default IsletmePanel;