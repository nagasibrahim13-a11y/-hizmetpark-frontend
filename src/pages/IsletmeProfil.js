import React, { useState, useEffect } from 'react';
import './IsletmeProfil.css';

function IsletmeProfil({ isletmeId, kullanici, onGeri }) {
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

  const saatler = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30'
  ];

  useEffect(() => {
    verileriGetir();
  }, [isletmeId]);

  const verileriGetir = async () => {
    setYukleniyor(true);
    try {
      const [isletmeCevap, yorumCevap] = await Promise.all([
        fetch(`http://localhost:5000/api/isletmeler/${isletmeId}`),
        fetch(`http://localhost:5000/api/yorumlar/isletme/${isletmeId}`)
      ]);
      const isletmeVeri = await isletmeCevap.json();
      const yorumVeri = await yorumCevap.json();
      setIsletme(isletmeVeri);
      setYorumlar(yorumVeri);
    } catch (err) {
      console.error(err);
    }
    setYukleniyor(false);
  };

  const hizmetToggle = (h) => {
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
  const toplamFiyat = secilenHizmetler.reduce((t, h) => t + (h.fiyat || 0), 0);

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
          saat: secilenSaat
        })
      });
      const veri = await cevap.json();
      if (!cevap.ok) {
        setRandevuHata(veri.hata);
      } else {
        setRandevuBasari(`Randevunuz oluşturuldu! ${secilenSaat} - ${toplamSure} dk.`);
        setTimeout(() => {
          setRandevuModal(false);
          setRandevuBasari('');
          setSecilenHizmetler([]);
          setSecilenSaat('');
          setSecilenTarih('');
        }, 3000);
      }
    } catch (err) {
      setRandevuHata('Sunucuya bağlanılamadı');
    }
    setGonderiyor(false);
  };

  const yildizGoster = (puan) => {
    return [1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= puan ? '#FFA726' : '#E0E0E0' }}>★</span>
    ));
  };

  const kategoriEmoji = (kat) => {
    if (kat === 'berber') return '✂️';
    if (kat === 'kuafor') return '💅';
    if (kat === 'guzellik') return '💆';
    return '⚽';
  };

  const bugunTarih = new Date().toISOString().split('T')[0];

  if (yukleniyor) return (
    <div className="profil-yukleniyor">Yükleniyor...</div>
  );

  if (!isletme) return (
    <div className="profil-yukleniyor">İşletme bulunamadı</div>
  );

  return (
    <div className="profil-sayfa">
      {/* HEADER */}
      <header className="profil-header">
        <button className="geri-btn" onClick={onGeri}>← Geri</button>
        <div className="header-logo">✂️ HizmetPark</div>
        <div style={{ width: '80px' }} />
      </header>

      {/* KAPAK */}
      <div className="profil-kapak">
        <div className="kapak-icerik">
          <div className="profil-avatar">
            {kategoriEmoji(isletme.kategori)}
          </div>
          <div className="profil-bilgi">
            <h1>{isletme.isletmeAdi}</h1>
            <p className="profil-kategori">
              {isletme.kategori === 'berber' ? 'Berber' :
               isletme.kategori === 'kuafor' ? 'Kuaför' :
               isletme.kategori === 'guzellik' ? 'Güzellik Salonu' : 'Halısaha'}
            </p>
            <div className="profil-meta">
              <span>📍 {isletme.adres?.il} / {isletme.adres?.ilce}</span>
              <span>📞 {isletme.telefon}</span>
              <span>🕐 {isletme.calismaBaslangic} - {isletme.calismaBitis}</span>
            </div>
            <div className="profil-puan-row">
              <div className="profil-yildizlar">
                {yildizGoster(Math.round(isletme.ortalamaPuan || 0))}
              </div>
              <span className="profil-puan-sayi">{isletme.ortalamaPuan || 0}</span>
              <span className="profil-yorum-sayi">({isletme.yorumSayisi || 0} yorum)</span>
            </div>
          </div>
          <button
            className="randevu-al-btn"
            onClick={() => setRandevuModal(true)}
          >
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

      {/* İÇERİK */}
      <div className="profil-icerik">
        {/* SEKMELER */}
        <div className="profil-sekmeler">
          <button
            className={`profil-sekme ${aktifSekme === 'hizmetler' ? 'aktif' : ''}`}
            onClick={() => setAktifSekme('hizmetler')}
          >
            ✂️ Hizmetler ({isletme.hizmetler?.length || 0})
          </button>
          <button
            className={`profil-sekme ${aktifSekme === 'yorumlar' ? 'aktif' : ''}`}
            onClick={() => setAktifSekme('yorumlar')}
          >
            ⭐ Yorumlar ({yorumlar.length})
          </button>
          <button
            className={`profil-sekme ${aktifSekme === 'hakkinda' ? 'aktif' : ''}`}
            onClick={() => setAktifSekme('hakkinda')}
          >
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
                  <button
                    className="hizmet-randevu-btn"
                    onClick={() => {
                      setSecilenHizmetler([h]);
                      setRandevuModal(true);
                    }}
                  >
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
            {/* Puan özeti */}
            <div className="puan-ozet">
              <div className="puan-buyuk">{isletme.ortalamaPuan || 0}</div>
              <div>
                <div className="puan-yildizlar">
                  {yildizGoster(Math.round(isletme.ortalamaPuan || 0))}
                </div>
                <div className="puan-toplam">{isletme.yorumSayisi || 0} değerlendirme</div>
              </div>
            </div>

            {yorumlar.length === 0 ? (
              <div className="bos-yorum">Henüz yorum yok</div>
            ) : (
              yorumlar.map((y, i) => (
                <div key={i} className="yorum-kart-profil">
                  <div className="yorum-ust-profil">
                    <div className="yorum-avatar-profil">
                      {y.musteri?.ad?.[0]}{y.musteri?.soyad?.[0]}
                    </div>
                    <div>
                      <div className="yorum-isim-profil">{y.musteri?.ad} {y.musteri?.soyad}</div>
                      <div className="yorum-tarih-profil">
                        {new Date(y.tarih).toLocaleDateString('tr-TR')}
                      </div>
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
          </div>
        )}
      </div>

      {/* RANDEVU MODAL */}
      {randevuModal && (
        <div className="modal-overlay" onClick={() => setRandevuModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isletme.isletmeAdi}</h2>
              <button className="modal-kapat" onClick={() => setRandevuModal(false)}>✕</button>
            </div>
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
                    >
                      <span>{secilenHizmetler.find(x => x.ad === h.ad) ? '✅ ' : ''}{h.ad}</span>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#999' }}>{h.sure} dk</span>
                        <span className="fiyat">{h.fiyat} ₺</span>
                      </div>
                    </div>
                  ))}
                </div>
                {secilenHizmetler.length > 0 && (
                  <div className="toplam-fiyat">
                    <span>⏱ {toplamSure} dk</span>
                    <span>Toplam: <strong style={{ color: '#E53935' }}>{toplamFiyat} ₺</strong></span>
                  </div>
                )}
                <p className="modal-label">Tarih Seç</p>
                <input
                  type="date"
                  min={bugunTarih}
                  value={secilenTarih}
                  onChange={e => setSecilenTarih(e.target.value)}
                  className="tarih-input"
                />
                <p className="modal-label">Saat Seç</p>
                <div className="saat-grid">
                  {saatler.map(s => {
                    const isDolu = doluSaatler.has(s);
                    return (
                      <button
                        key={s}
                        className={`saat-btn ${secilenSaat === s ? 'secili' : ''} ${isDolu ? 'dolu' : ''}`}
                        onClick={() => !isDolu && setSecilenSaat(s)}
                        disabled={isDolu}
                      >
                        {isDolu ? '🚫' : s}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="btn-primary"
                  style={{ marginTop: '20px' }}
                  onClick={randevuAl}
                  disabled={gonderiyor}
                >
                  {gonderiyor ? 'Gönderiliyor...' : `Randevuyu Onayla${toplamFiyat > 0 ? ` — ${toplamFiyat} ₺` : ''}`}
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