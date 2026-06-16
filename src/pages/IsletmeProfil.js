import React, { useState, useEffect } from 'react';
import './IsletmeProfil.css';

function IsletmeProfil({ isletmeId, kullanici, onGeri, hediyeliRandevuData }) {
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

  const saatler = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30'
  ];

  useEffect(() => { verileriGetir(); }, [isletmeId]);

  useEffect(() => {
    if (hediyeliRandevuData && isletme) {
      setRandevuModal(true);
      const hediyeHizmet = isletme.hizmetler?.find(
        h => h.ad.toLowerCase().includes(hediyeliRandevuData.hediye.toLowerCase())
      ) || { ad: hediyeliRandevuData.hediye, sure: 20, fiyat: 0 };
      setSecilenHizmetler([{ ...hediyeHizmet, fiyat: 0 }]);
    }
  }, [hediyeliRandevuData, isletme]);

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

  const randevuAl = async () => {
    if (secilenHizmetler.length === 0 || !secilenSaat || !secilenTarih) {
      setRandevuHata('Lütfen en az bir hizmet, tarih ve saat seçin');
      return;
    }
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
          sadakatId: hediyeliRandevuData?.sadakatId || null
        })
      });
      const veri = await cevap.json();
      if (!cevap.ok) {
        setRandevuHata(veri.hata);
      } else {
        setRandevuBasari(hediyeliRandevuData
          ? `🎁 Hediye randevunuz oluşturuldu! ${secilenSaat} — Ücretsiz!`
          : `Randevunuz oluşturuldu! ${secilenSaat} - ${toplamSure} dk.`
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
      <header className="profil-header">
        <button className="geri-btn" onClick={onGeri}>← Geri</button>
        <div className="header-logo">✂️ HizmetPark</div>
        <div style={{ width: '80px' }} />
      </header>

      {/* KAPAK */}
      <div
        className="profil-kapak"
        style={isletme.fotograf ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.65)), url(${isletme.fotograf})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="kapak-icerik">
          <div className="profil-avatar">{kategoriEmoji(isletme.kategori)}</div>
          <div className="profil-bilgi">
            <h1>{isletme.isletmeAdi}</h1>
            {isletme.slogan && (
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', margin: '4px 0 8px' }}>
                "{isletme.slogan}"
              </p>
            )}
            <p className="profil-kategori">{kategoriLabel(isletme.kategori)}</p>
            <div className="profil-meta">
              <span>📍 {isletme.adres?.il} / {isletme.adres?.ilce}</span>
              <span>📞 {isletme.telefon}</span>
              <span>🕐 {isletme.calismaBaslangic} - {isletme.calismaBitis}</span>
            </div>
            <div className="profil-puan-row">
              <div className="profil-yildizlar">{yildizGoster(Math.round(isletme.ortalamaPuan || 0))}</div>
              <span className="profil-puan-sayi">{isletme.ortalamaPuan || 0}</span>
              <span className="profil-yorum-sayi">({isletme.yorumSayisi || 0} yorum)</span>
            </div>
            {sadakatAyar && (
              <div className="profil-sadakat-bilgi">
                <span>🎁</span>
                <span>Her <strong>{sadakatAyar.hedefZiyaret}</strong> ziyarette <strong>{sadakatAyar.hediye}</strong></span>
              </div>
            )}
          </div>
          <button className="randevu-al-btn" onClick={() => setRandevuModal(true)}>
            📅 Randevu Al
          </button>
        </div>
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

      {/* SEKMELER */}
      <div className="profil-icerik">
        <div className="profil-sekmeler">
          <button className={`profil-sekme ${aktifSekme === 'hizmetler' ? 'aktif' : ''}`} onClick={() => setAktifSekme('hizmetler')}>
            ✂️ Hizmetler ({isletme.hizmetler?.length || 0})
          </button>
          <button className={`profil-sekme ${aktifSekme === 'yorumlar' ? 'aktif' : ''}`} onClick={() => setAktifSekme('yorumlar')}>
            ⭐ Yorumlar ({yorumlar.length})
          </button>
          <button className={`profil-sekme ${aktifSekme === 'hakkinda' ? 'aktif' : ''}`} onClick={() => setAktifSekme('hakkinda')}>
            ℹ️ Hakkında
          </button>
        </div>

        {/* HİZMETLER */}
        {aktifSekme === 'hizmetler' && (
          <div className="hizmetler-liste">
            {isletme.hizmetler?.map((h, i) => (
              <div key={i} className="hizmet-kart">
                <div className="hizmet-kart-sol">
                  <div className="hizmet-kart-adi">{h.ad}</div>
                  <div className="hizmet-kart-sure">⏱ {h.sure} dakika</div>
                </div>
                <div className="hizmet-kart-sag">
                  <div className="hizmet-kart-fiyat">{h.fiyat} ₺</div>
                  <button className="hizmet-randevu-btn" onClick={() => { setSecilenHizmetler([h]); setRandevuModal(true); }}>
                    Randevu Al
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* YORUMLAR */}
        {aktifSekme === 'yorumlar' && (
          <div className="yorumlar-liste">
            <div className="puan-ozet">
              <div className="puan-buyuk">{isletme.ortalamaPuan || 0}</div>
              <div>
                <div className="puan-yildizlar">{yildizGoster(Math.round(isletme.ortalamaPuan || 0))}</div>
                <div className="puan-toplam">{isletme.yorumSayisi || 0} değerlendirme</div>
              </div>
            </div>
            {yorumlar.length === 0 ? (
              <div className="bos-yorum">Henüz yorum yok</div>
            ) : (
              yorumlar.map((y, i) => (
                <div key={i} className="yorum-kart-profil">
                  <div className="yorum-ust-profil">
                    <div className="yorum-avatar-profil">{y.musteri?.ad?.[0]}{y.musteri?.soyad?.[0]}</div>
                    <div>
                      <div className="yorum-isim-profil">{y.musteri?.ad} {y.musteri?.soyad}</div>
                      <div className="yorum-tarih-profil">{new Date(y.tarih).toLocaleDateString('tr-TR')}</div>
                    </div>
                    <div className="yorum-puan-profil">
                      {yildizGoster(y.puan)}
                      <span style={{ marginLeft: '4px', fontSize: '13px', color: '#999' }}>{y.puan}/5</span>
                    </div>
                  </div>
                  <p className="yorum-metin-profil">{y.yorum}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* HAKKINDA */}
        {aktifSekme === 'hakkinda' && (
          <div className="hakkinda-bolum">
            {isletme.hakkinda && (
              <div className="hakkinda-kart" style={{ gridColumn: '1 / -1' }}>
                <h3>📖 Hakkımızda</h3>
                <p>{isletme.hakkinda}</p>
              </div>
            )}
            <div className="hakkinda-kart">
              <h3>📍 Adres</h3>
              <p>{isletme.adres?.acikAdres}</p>
              <p>{isletme.adres?.ilce} / {isletme.adres?.il}</p>
            </div>
            <div className="hakkinda-kart">
              <h3>📞 İletişim</h3>
              <p>{isletme.telefon}</p>
            </div>
            <div className="hakkinda-kart">
              <h3>🕐 Çalışma Saatleri</h3>
              <p>{isletme.calismaBaslangic} - {isletme.calismaBitis}</p>
            </div>
            <div className="hakkinda-kart">
              <h3>📅 Çalışma Günleri</h3>
              <p>{isletme.calismaGunleri?.join(', ')}</p>
            </div>
            {sadakatAyar && (
              <div className="hakkinda-kart" style={{ borderColor: '#FFE082', background: '#FFFDE7' }}>
                <h3>🎁 Sadakat Programı</h3>
                <p>Her <strong>{sadakatAyar.hedefZiyaret}</strong> ziyarette <strong>{sadakatAyar.hediye}</strong> hediye edilir.</p>
              </div>
            )}
          </div>
        )}
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
              <div className="basari">✅ {randevuBasari}</div>
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
                <input type="date" min={bugunTarih} value={secilenTarih} onChange={e => setSecilenTarih(e.target.value)} className="tarih-input" />

                <p className="modal-label">Saat Seç</p>
                <div className="saat-grid">
                  {saatler.map(s => {
                    const isDolu = doluSaatler.has(s);
                    return (
                      <button key={s} className={`saat-btn ${secilenSaat === s ? 'secili' : ''} ${isDolu ? 'dolu' : ''}`} onClick={() => !isDolu && setSecilenSaat(s)} disabled={isDolu}>
                        {isDolu ? '🚫' : s}
                      </button>
                    );
                  })}
                </div>

                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={randevuAl} disabled={gonderiyor}>
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