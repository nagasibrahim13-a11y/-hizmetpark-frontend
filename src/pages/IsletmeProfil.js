import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './IsletmeProfil.css';

function IsletmeProfil({ isletmeId, kullanici, onGeri, hediyeliRandevuData, isOwnerView = false, onDuzenle }) {
  const { girisGerektir } = useAuth();
  const [isletme, setIsletme] = useState(null);
  const [yorumlar, setYorumlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifSekme, setAktifSekme] = useState('hizmetler');
  const [randevuModal, setRandevuModal] = useState(false);
  const [secilenHizmetler, setSecilenHizmetler] = useState([]);
  const [secilenSaat, setSecilenSaat] = useState('');
  const [secilenTarih, setSecilenTarih] = useState('');
  const [randevuBasari, setRandevuBasari] = useState('');
  const [randevuHata, setRandevuHata] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [sadakatAyar, setSadakatAyar] = useState(null);
  const [personelListesi, setPersonelListesi] = useState([]);
  const [secilenPersonel, setSecilenPersonel] = useState(null);
  const [doluluk, setDoluluk] = useState({});

  const saatler = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30'
  ];

  useEffect(() => { verileriGetir(); }, [isletmeId]);

  useEffect(() => {
    if (secilenTarih && isletme?._id) dolulukGetir(secilenTarih);
  }, [secilenTarih, isletme]);

  useEffect(() => {
    if (hediyeliRandevuData && isletme) {
      setRandevuModal(true);
      const hediyeHizmet = isletme.hizmetler?.find(
        h => h.ad.toLowerCase().includes(hediyeliRandevuData.hediye.toLowerCase())
      ) || { ad: hediyeliRandevuData.hediye, sure: 20, fiyat: 0 };
      setSecilenHizmetler([{ ...hediyeHizmet, fiyat: 0 }]);
    }
  }, [hediyeliRandevuData, isletme]);

  const dolulukGetir = async (tarih) => {
    if (!tarih || !isletme?._id) return;
    try {
      const cevap = await fetch(`http://localhost:5000/api/randevular/isletme/${isletme._id}/doluluk?tarih=${tarih}`);
      const veri = await cevap.json();
      setDoluluk(veri.doluluk || {});
    } catch (err) { console.error(err); }
  };

  const verileriGetir = async () => {
    setYukleniyor(true);
    try {
      const [isletmeCevap, yorumCevap, sadakatCevap] = await Promise.all([
        fetch(`http://localhost:5000/api/isletmeler/${isletmeId}`),
        fetch(`http://localhost:5000/api/yorumlar/isletme/${isletmeId}`),
        fetch(`http://localhost:5000/api/sadakat/isletme/${isletmeId}`)
      ]);
      const isletmeVeri = await isletmeCevap.json();
      const yorumVeri = await yorumCevap.json();
      const sadakatVeri = await sadakatCevap.json();
      setIsletme(isletmeVeri);
      setYorumlar(yorumVeri);
      if (sadakatVeri.length > 0) setSadakatAyar(sadakatVeri[0].odul);
      const pCevap = await fetch(`http://localhost:5000/api/isletmeler/${isletmeId}/personel`);
      const pVeri = await pCevap.json();
      setPersonelListesi(pVeri);
    } catch (err) { console.error(err); }
    setYukleniyor(false);
  };

  const hizmetToggle = (h) => {
    if (hediyeliRandevuData) return;
    const var_mi = secilenHizmetler.find(x => x.ad === h.ad);
    if (var_mi) {
      setSecilenHizmetler(secilenHizmetler.filter(x => x.ad !== h.ad));
      setSecilenSaat('');
    } else {
      setSecilenHizmetler([...secilenHizmetler, h]);
      setSecilenSaat('');
    }
  };

  const toplamSure = secilenHizmetler.reduce((t, h) => t + (h.sure || 0), 0);
  const toplamFiyat = hediyeliRandevuData ? 0 : secilenHizmetler.reduce((t, h) => t + (h.fiyat || 0), 0);

  const doluSaatleriHesapla = (seciliSaat, sure) => {
    const dolu = new Set();
    if (!seciliSaat || sure <= 0) return dolu;
    const [sh, sd] = seciliSaat.split(':').map(Number);
    const baslangicDk = sh * 60 + sd;
    saatler.forEach(s => {
      const [h, d] = s.split(':').map(Number);
      const sDk = h * 60 + d;
      if (sDk > baslangicDk && sDk < baslangicDk + sure) dolu.add(s);
    });
    return dolu;
  };

  const doluSaatler = doluSaatleriHesapla(secilenSaat, toplamSure);

  const kapaliBilgi = secilenTarih && isletme?.kapaliTarihler?.length > 0
    ? isletme.kapaliTarihler.find(kt => {
        const ktTarih = new Date(kt.tarih).toISOString().split('T')[0];
        return ktTarih === secilenTarih;
      }) || null
    : null;

  const randevuAl = async () => {
    if (secilenHizmetler.length === 0 || !secilenSaat || !secilenTarih) {
      setRandevuHata('Lütfen en az bir hizmet, tarih ve saat seçin');
      return;
    }
    if (kapaliBilgi?.tumGun) { setRandevuHata('Bu tarih işletme tarafından kapalıdır.'); return; }
    if (kapaliBilgi?.saatler?.includes(secilenSaat)) { setRandevuHata('Bu saat işletme tarafından kapalıdır.'); return; }
    setGonderiyor(true);
    setRandevuHata('');
    try {
      const cevap = await fetch('http://localhost:5000/api/randevular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          musteri: kullanici.id,
          isletme: isletme._id,
          hizmet: secilenHizmetler,
          tarih: secilenTarih,
          saat: secilenSaat,
          hediyeMi: hediyeliRandevuData ? true : false,
          sadakatId: hediyeliRandevuData?.sadakatId || null,
          personel: secilenPersonel || null
        })
      });
      const veri = await cevap.json();
      if (!cevap.ok) {
        setRandevuHata(veri.hata);
      } else {
        setRandevuBasari(hediyeliRandevuData
          ? `🎁 Hediye randevunuz oluşturuldu! ${secilenSaat} — Ücretsiz!`
          : `✅ Randevunuz onaylandı! ${secilenSaat} - ${toplamSure} dk. Sizi bekliyoruz!`
        );
        setTimeout(() => {
          setRandevuModal(false);
          setRandevuBasari('');
          setSecilenHizmetler([]);
          setSecilenSaat('');
          setSecilenTarih('');
        }, 3000);
      }
    } catch (err) { setRandevuHata('Sunucuya bağlanılamadı'); }
    setGonderiyor(false);
  };

  const yildizGoster = (puan) => [1, 2, 3, 4, 5].map(i => (
    <span key={i} style={{ color: i <= puan ? '#FFA726' : '#E0E0E0' }}>★</span>
  ));

  const kategoriEmoji = (kat) => {
    if (kat === 'berber') return '✂️';
    if (kat === 'kuafor') return '💅';
    if (kat === 'guzellik') return '💆';
    return '⚽';
  };

  const kategoriLabel = (kat) => {
    if (kat === 'berber') return 'Berber';
    if (kat === 'kuafor') return 'Kuaför';
    if (kat === 'guzellik') return 'Güzellik Salonu';
    return 'Halısaha';
  };

  const bugunTarih = new Date().toISOString().split('T')[0];

  if (yukleniyor) return <div className="profil-yukleniyor">Yükleniyor...</div>;
  if (!isletme) return <div className="profil-yukleniyor">İşletme bulunamadı</div>;

  return (
    <div className="profil-sayfa">
      {/* HEADER — owner view'da gizli */}
      {!isOwnerView && (
        <header className="profil-header">
          <button className="geri-btn" onClick={onGeri}>← Geri</button>
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
          <div style={{ width: '80px' }} />
        </header>
      )}

      {/* KOYU BANNER (mockup 2 stili) */}
      <div className="profil-kapak" style={isletme.fotograf ? {
  backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${isletme.fotograf})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
} : {}}>
        <div className="profil-avatar-daire">
          <span style={{ fontSize: '44px' }}>{kategoriEmoji(isletme.kategori)}</span>
        </div>
        <h1 className="profil-banner-isim">{isletme.isletmeAdi}</h1>
        {isletme.slogan && (
          <p className="profil-banner-slogan">"{isletme.slogan}"</p>
        )}
        <div className="profil-banner-meta">
          <span>📍 {isletme.adres?.il} / {isletme.adres?.ilce}</span>
          <span>📞 {isletme.telefon}</span>
          <span>🕐 {isletme.calismaBaslangic} - {isletme.calismaBitis}</span>
        </div>
        {sadakatAyar && (
          <div className="profil-sadakat-bilgi">
            🎁 Her <strong>{sadakatAyar.hedefZiyaret}</strong> ziyarette <strong>{sadakatAyar.hediye}</strong>
          </div>
        )}
      </div>

      {/* ÇALIŞMA GÜNLERİ */}
      <div className="profil-gunler">
        <div className="gunler-icerik">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((gun, i) => {
            const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
            const aktif = isletme.calismaGunleri?.includes(gunler[i]);
            return (
              <div key={i} className={`gun-item ${aktif ? 'aktif' : 'kapali'}`}>
                <span>{gun}</span>
                <span>{aktif ? '✓' : '✕'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* İKİ SÜTUN İÇERİK (mockup 2 gibi) */}
      <div className="profil-icerik">
        <div className="profil-iki-kolon">

          {/* SOL: Hizmet Fiyatları */}
          <div className="profil-sol">
            <h3 className="profil-kolon-baslik">✂️ Hizmet Fiyatları</h3>
            <div className="hizmet-fiyat-liste">
              {isletme.hizmetler?.map((h, i) => (
                <div key={i} className="hizmet-fiyat-satir">
                  <div>
                    <div className="hizmet-fiyat-ad">{h.ad}</div>
                    <div className="hizmet-fiyat-sure">⏱ {h.sure} dk</div>
                  </div>
                  <div className="hizmet-fiyat-sag">
                    <span className="hizmet-fiyat-tl">{h.fiyat} TL</span>
                    <button className="hizmet-hizli-btn" onClick={() => {
                      if (!kullanici) {
                        girisGerektir(() => { setSecilenHizmetler([h]); setRandevuModal(true); });
                      } else {
                        setSecilenHizmetler([h]);
                        setRandevuModal(true);
                      }
                    }}>Al</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ortalama Puan */}
            <h3 className="profil-kolon-baslik" style={{ marginTop: '24px' }}>⭐ Ortalama Puan</h3>
            <div className="profil-puan-blok">
              <div className="profil-puan-buyuk">{isletme.ortalamaPuan || '—'}</div>
              <div>
                <div style={{ fontSize: '22px', letterSpacing: '2px' }}>{yildizGoster(Math.round(isletme.ortalamaPuan || 0))}</div>
                <div className="profil-puan-alt">{isletme.yorumSayisi || 0} değerlendirme</div>
              </div>
            </div>

            {/* Hakkında (sol altı) */}
            {(isletme.hakkinda || isletme.adres?.acikAdres) && (
              <>
                <h3 className="profil-kolon-baslik" style={{ marginTop: '24px' }}>ℹ️ Hakkında</h3>
                {isletme.hakkinda && <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6' }}>{isletme.hakkinda}</p>}
                {isletme.adres?.acikAdres && (
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
                    📍 {isletme.adres.acikAdres}, {isletme.adres.ilce} / {isletme.adres.il}
                  </p>
                )}
              </>
            )}
          </div>

          {/* SAĞ: Kullanıcı Yorumları */}
          <div className="profil-sag">
            <h3 className="profil-kolon-baslik">💬 Kullanıcı Yorumları</h3>
            {yorumlar.length === 0 ? (
              <div className="bos-yorum">Henüz yorum yok</div>
            ) : (
              <div className="yorumlar-liste">
                {yorumlar.map((y, i) => (
                  <div key={i} className="yorum-kart-profil">
                    <div className="yorum-ust-profil">
                      <div className="yorum-avatar-profil">{y.musteri?.ad?.[0]}{y.musteri?.soyad?.[0]}</div>
                      <div>
                        <div className="yorum-isim-profil">{y.musteri?.ad} {y.musteri?.soyad}</div>
                        <div className="yorum-tarih-profil">{new Date(y.tarih).toLocaleDateString('tr-TR')}</div>
                      </div>
                      <div className="yorum-puan-profil">
                        {yildizGoster(y.puan)}
                      </div>
                    </div>
                    <p className="yorum-metin-profil">{y.yorum}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BÜYÜK BUTON — owner view'da "Profili Düzenle", müşteri view'da "Randevu Al" */}
        <div className="randevu-al-alan">
          {isOwnerView ? (
            <button className="randevu-al-pill" onClick={onDuzenle}>
              ✏️ Profili Düzenle
            </button>
          ) : (
            <button className="randevu-al-pill" onClick={() => {
              if (!kullanici) {
                girisGerektir(() => setRandevuModal(true));
              } else {
                setRandevuModal(true);
              }
            }}>
              📅 Randevu Al
            </button>
          )}
        </div>
      </div>

      {/* RANDEVU MODAL */}
      {randevuModal && (
        <div className="modal-overlay" onClick={() => setRandevuModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{hediyeliRandevuData ? '🎁 Hediye Randevu' : isletme.isletmeAdi}</h2>
              <button className="modal-kapat" onClick={() => setRandevuModal(false)}>✕</button>
            </div>

            {hediyeliRandevuData && (
              <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#F57F17', fontWeight: '600' }}>
                🎉 Bu randevu ücretsiz! Sadakat ödülünüzü kullanıyorsunuz.
              </div>
            )}

            {randevuBasari ? (
              <div
                className="basari"
                style={!hediyeliRandevuData ? {
                  background: '#FFF8E1',
                  color: '#E65100',
                  border: '1px solid #FFE082'
                } : {}}
              >
                {hediyeliRandevuData ? '✅' : '⏳'} {randevuBasari}
              </div>
            ) : (
              <>
                {randevuHata && <div className="hata">{randevuHata}</div>}
                <p className="modal-label">Hizmet Seç</p>
                <div className="hizmet-secim">
                  {isletme.hizmetler?.map((h, i) => (
                    <div
                      key={i}
                      className={`hizmet-secim-item ${secilenHizmetler.find(x => x.ad === h.ad) ? 'secili' : ''}`}
                      onClick={() => hizmetToggle(h)}
                      style={{ cursor: hediyeliRandevuData ? 'default' : 'pointer' }}
                    >
                      <span>{secilenHizmetler.find(x => x.ad === h.ad) ? '✅ ' : ''}{h.ad}</span>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#999' }}>{h.sure} dk</span>
                        <span className="fiyat">
                          {hediyeliRandevuData && secilenHizmetler.find(x => x.ad === h.ad) ? (
                            <><span style={{ textDecoration: 'line-through', color: '#999', marginRight: '4px' }}>{h.fiyat} ₺</span><span style={{ color: '#2E7D32' }}>Ücretsiz</span></>
                          ) : `${h.fiyat} ₺`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {secilenHizmetler.length > 0 && (
                  <div className="toplam-fiyat">
                    <span>⏱ {toplamSure} dk</span>
                    <span>{hediyeliRandevuData ? <span style={{ color: '#2E7D32', fontWeight: '700' }}>🎁 Ücretsiz</span> : <strong style={{ color: '#E53935' }}>{toplamFiyat} ₺</strong>}</span>
                  </div>
                )}

                <p className="modal-label">Tarih Seç</p>
                <input
                  type="date"
                  min={bugunTarih}
                  value={secilenTarih}
                  onChange={e => { setSecilenTarih(e.target.value); setSecilenSaat(''); }}
                  className="tarih-input"
                />
                <div style={{display:'flex', gap:'6px', marginTop:'10px', marginBottom:'4px', overflowX:'auto', paddingBottom:'4px'}}>
                  {Array.from({length: 7}).map((_, i) => {
                    const tarih = new Date();
                    tarih.setDate(tarih.getDate() + i);
                    const tarihStr = tarih.toISOString().split('T')[0];
                    const gunAdlari = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
                    const secili = secilenTarih === tarihStr;
                    return (
                      <button
                        key={tarihStr}
                        onClick={() => { setSecilenTarih(tarihStr); setSecilenSaat(''); }}
                        style={{
                          minWidth:'52px',
                          padding:'8px 4px',
                          borderRadius:'12px',
                          border: secili ? 'none' : '1px solid #E2E8F0',
                          background: secili ? '#4F46E5' : 'white',
                          color: secili ? 'white' : '#374151',
                          cursor:'pointer',
                          textAlign:'center',
                          flexShrink:0
                        }}
                      >
                        <div style={{fontSize:'11px', fontWeight:'600', opacity:0.8}}>{gunAdlari[tarih.getDay()]}</div>
                        <div style={{fontSize:'16px', fontWeight:'700'}}>{tarih.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
                {kapaliBilgi?.tumGun && (
                  <div style={{ marginTop: '8px', background: '#FFF5F5', color: '#C62828', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid #FFCDD2' }}>
                    ⛔ Bu tarih işletme tarafından kapalı.{kapaliBilgi.aciklama ? ` (${kapaliBilgi.aciklama})` : ''}
                  </div>
                )}
                {kapaliBilgi && !kapaliBilgi.tumGun && kapaliBilgi.saatler?.length > 0 && (
                  <div style={{ marginTop: '8px', background: '#FFF8E1', color: '#E65100', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid #FFE082' }}>
                    ⚠️ Bu günde bazı saatler kapalı: {kapaliBilgi.saatler.join(', ')}
                  </div>
                )}

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                  <p className="modal-label" style={{margin:0}}>Saat Seç</p>
                  <div style={{display:'flex', gap:'10px', fontSize:'11px', color:'#64748B'}}>
                    <span style={{display:'flex', alignItems:'center', gap:'3px'}}><span style={{width:'8px',height:'8px',borderRadius:'2px',background:'white',border:'1px solid #E2E8F0',display:'inline-block'}}></span>Boş</span>
                    <span style={{display:'flex', alignItems:'center', gap:'3px'}}><span style={{width:'8px',height:'8px',borderRadius:'2px',background:'#FEF3C7',border:'1px solid #F59E0B',display:'inline-block'}}></span>Meşgul</span>
                    <span style={{display:'flex', alignItems:'center', gap:'3px'}}><span style={{width:'8px',height:'8px',borderRadius:'2px',background:'#E2E8F0',display:'inline-block'}}></span>Dolu</span>
                  </div>
                </div>
                <div className="saat-grid">
                  {saatler.map(s => {
                    const isDolu = doluSaatler.has(s);
                    const isKapali = kapaliBilgi?.tumGun || (!kapaliBilgi?.tumGun && kapaliBilgi?.saatler?.includes(s));
                    const saatDoluluk = doluluk[s] || 0;
                    const dolulukRenk = saatDoluluk === 0 ? null : saatDoluluk === 1 ? '#FEF3C7' : '#FEE2E2';
                    const dolulukBorder = saatDoluluk === 0 ? null : saatDoluluk === 1 ? '#F59E0B' : '#EF4444';
                    return (
                      <button
                        key={s}
                        className={`saat-btn ${secilenSaat === s ? 'secili' : ''} ${isDolu || isKapali ? 'dolu' : ''}`}
                        onClick={() => !isDolu && !isKapali && setSecilenSaat(s)}
                        disabled={isDolu || isKapali}
                        style={{
                          background: dolulukRenk || undefined,
                          borderColor: dolulukBorder || undefined
                        }}
                      >
                        {isKapali ? '🚫' : isDolu ? '🔒' : s}
                        {!isDolu && !isKapali && saatDoluluk > 0 && (
                          <span style={{fontSize:'9px', display:'block', marginTop:'2px'}}>
                            {saatDoluluk === 1 ? '🟡' : '🔴'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {personelListesi.length > 0 && (
                  <div style={{marginTop:'16px'}}>
                    <div style={{fontWeight:'600', fontSize:'14px', marginBottom:'8px'}}>👤 Personel Seçin (İsteğe bağlı)</div>
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                      <button
                        onClick={() => setSecilenPersonel(null)}
                        style={{padding:'8px 14px', borderRadius:'20px', border: secilenPersonel === null ? 'none' : '1px solid #E2E8F0', background: secilenPersonel === null ? '#4F46E5' : 'white', color: secilenPersonel === null ? 'white' : '#374151', fontSize:'13px', cursor:'pointer'}}>
                        Fark etmez
                      </button>
                      {personelListesi.map(p => (
                        <button key={p._id}
                          onClick={() => setSecilenPersonel(p._id)}
                          style={{padding:'8px 14px', borderRadius:'20px', border: secilenPersonel === p._id ? 'none' : '1px solid #E2E8F0', background: secilenPersonel === p._id ? '#4F46E5' : 'white', color: secilenPersonel === p._id ? 'white' : '#374151', fontSize:'13px', cursor:'pointer'}}>
                          {p.ad} — {p.unvan}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {secilenHizmetler.length > 0 && secilenSaat && (
                  <div style={{display:'flex', justifyContent:'space-between', background:'#F8FAFC', borderRadius:'12px', padding:'12px 16px', marginTop:'16px', marginBottom:'10px'}}>
                    <div>
                      <div style={{fontSize:'10px', color:'#94A3B8', fontWeight:'600', textTransform:'uppercase'}}>Toplam Süre</div>
                      <div style={{fontSize:'14px', fontWeight:'700', color:'#0F172A'}}>{toplamSure} Dakika</div>
                    </div>
                    <div>
                      <div style={{fontSize:'10px', color:'#94A3B8', fontWeight:'600', textTransform:'uppercase'}}>Randevu</div>
                      <div style={{fontSize:'14px', fontWeight:'700', color:'#0F172A'}}>{secilenSaat}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'10px', color:'#94A3B8', fontWeight:'600', textTransform:'uppercase'}}>Toplam Tutar</div>
                      <div style={{fontSize:'16px', fontWeight:'800', color:'#10B981'}}>{toplamFiyat} ₺</div>
                    </div>
                  </div>
                )}
                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={randevuAl} disabled={gonderiyor || !!kapaliBilgi?.tumGun}>
                  {gonderiyor ? 'Gönderiliyor...' : hediyeliRandevuData ? '🎁 Hediye Randevuyu Onayla' : `Randevuyu Onayla${toplamFiyat > 0 ? ` — ${toplamFiyat} ₺` : ''}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default IsletmeProfil;