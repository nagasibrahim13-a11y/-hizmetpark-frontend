import React, { useState, useEffect } from 'react';
import './MusteriAnaSayfa.css';

function MusteriAnaSayfa({ kullanici, onCikis }) {
  const [isletmeler, setIsletmeler] = useState([]);
  const [kategori, setKategori] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenIsletme, setSecilenIsletme] = useState(null);
  const [randevuModal, setRandevuModal] = useState(false);
  const [secilenHizmetler, setSecilenHizmetler] = useState([]);
  const [secilenSaat, setSecilenSaat] = useState('');
  const [secilenTarih, setSecilenTarih] = useState('');
  const [randevuBasari, setRandevuBasari] = useState('');
  const [randevuHata, setRandevuHata] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);

  const kategoriler = [
    { deger: '', label: 'Tümü', emoji: '🏪' },
    { deger: 'berber', label: 'Berber', emoji: '✂️' },
    { deger: 'kuafor', label: 'Kuaför', emoji: '💅' },
    { deger: 'guzellik', label: 'Güzellik', emoji: '💆' },
    { deger: 'halisaha', label: 'Halısaha', emoji: '⚽' },
  ];

  const saatler = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30'
  ];

  useEffect(() => {
    isletmeleriGetir();
  }, [kategori]);

  const isletmeleriGetir = async () => {
    setYukleniyor(true);
    try {
      const url = kategori
        ? `http://localhost:5000/api/isletmeler?kategori=${kategori}`
        : 'http://localhost:5000/api/isletmeler';
      const cevap = await fetch(url);
      const veri = await cevap.json();
      setIsletmeler(veri);
    } catch (err) {
      console.error(err);
    }
    setYukleniyor(false);
  };

  const hizmetToggle = (h) => {
    const var_mi = secilenHizmetler.find(x => x.ad === h.ad);
    if (var_mi) {
      setSecilenHizmetler(secilenHizmetler.filter(x => x.ad !== h.ad));
      setSecilenSaat(''); // hizmet değişince saati sıfırla
    } else {
      setSecilenHizmetler([...secilenHizmetler, h]);
      setSecilenSaat(''); // hizmet değişince saati sıfırla
    }
  };

  const toplamSure = secilenHizmetler.reduce((t, h) => t + (h.sure || 0), 0);
  const toplamFiyat = secilenHizmetler.reduce((t, h) => t + (h.fiyat || 0), 0);

  // Seçilen saatten sonra toplamSure kadar saatleri dolu işaretle
  const doluSaatleriHesapla = (seciliSaat, sure) => {
    const dolu = new Set();
    if (!seciliSaat || sure <= 0) return dolu;

    const [sh, sd] = seciliSaat.split(':').map(Number);
    const baslangicDk = sh * 60 + sd;

    saatler.forEach(s => {
      const [h, d] = s.split(':').map(Number);
      const sDk = h * 60 + d;
      if (sDk > baslangicDk && sDk < baslangicDk + sure) {
        dolu.add(s);
      }
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
          isletme: secilenIsletme._id,
          hizmet: secilenHizmetler,
          tarih: secilenTarih,
          saat: secilenSaat
        })
      });
      const veri = await cevap.json();
      if (!cevap.ok) {
        setRandevuHata(veri.hata);
      } else {
        setRandevuBasari(`Randevunuz oluşturuldu! ${secilenSaat} - ${toplamSure} dk. İşletme onaylayınca bildirim alacaksınız.`);
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

  const modalAc = (isletme) => {
    setSecilenIsletme(isletme);
    setRandevuModal(true);
    setRandevuBasari('');
    setRandevuHata('');
    setSecilenHizmetler([]);
    setSecilenSaat('');
    setSecilenTarih('');
  };

  const bugunTarih = new Date().toISOString().split('T')[0];

  return (
    <div className="musteri-sayfa">
      <header className="header">
        <div className="header-logo">✂️ HizmetPark</div>
        <div className="header-sag">
          <span>Merhaba, {kullanici.ad}</span>
          <button onClick={onCikis} className="cikis-btn">Çıkış</button>
        </div>
      </header>

      <div className="icerik">
        <div className="arama-bolum">
          <h2>Yakınındaki hizmetleri keşfet</h2>
          <p>Berber, kuaför, güzellik salonu ve daha fazlası</p>
        </div>

        <div className="kategori-row">
          {kategoriler.map(k => (
            <button
              key={k.deger}
              className={`kategori-btn ${kategori === k.deger ? 'aktif' : ''}`}
              onClick={() => setKategori(k.deger)}
            >
              {k.emoji} {k.label}
            </button>
          ))}
        </div>

        {yukleniyor ? (
          <div className="yukleniyor">Yükleniyor...</div>
        ) : (
          <div className="isletme-grid">
            {isletmeler.length === 0 ? (
              <div className="bos">Henüz işletme yok</div>
            ) : (
              isletmeler.map(isletme => (
                <div key={isletme._id} className="isletme-kart card">
                  <div className="isletme-kart-ust">
                    <span className="isletme-emoji">
                      {isletme.kategori === 'berber' ? '✂️' :
                       isletme.kategori === 'kuafor' ? '💅' :
                       isletme.kategori === 'guzellik' ? '💆' : '⚽'}
                    </span>
                    <div>
                      <h3>{isletme.isletmeAdi}</h3>
                      <p>{isletme.adres?.il} / {isletme.adres?.ilce}</p>
                    </div>
                    <div className="puan">⭐ {isletme.ortalamaPuan || '4.8'}</div>
                  </div>
                  <div className="hizmet-listesi">
                    {isletme.hizmetler?.slice(0, 3).map((h, i) => (
                      <div key={i} className="hizmet-satir">
                        <span>{h.ad}</span>
                        <span className="fiyat">{h.fiyat} ₺</span>
                      </div>
                    ))}
                  </div>
                  <div className="calisma-saati">
                    🕐 {isletme.calismaBaslangic} - {isletme.calismaBitis}
                  </div>
                  <button
                    className="btn-primary"
                    style={{ marginTop: '14px' }}
                    onClick={() => modalAc(isletme)}
                  >
                    Randevu Al
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* RANDEVU MODAL */}
      {randevuModal && secilenIsletme && (
        <div className="modal-overlay" onClick={() => setRandevuModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{secilenIsletme.isletmeAdi}</h2>
              <button className="modal-kapat" onClick={() => setRandevuModal(false)}>✕</button>
            </div>

            {randevuBasari ? (
              <div className="basari">✅ {randevuBasari}</div>
            ) : (
              <>
                {randevuHata && <div className="hata">{randevuHata}</div>}

                <p className="modal-label">Hizmet Seç (birden fazla seçebilirsin)</p>
                <div className="hizmet-secim">
                  {secilenIsletme.hizmetler.map((h, i) => (
                    <div
                      key={i}
                      className={`hizmet-secim-item ${secilenHizmetler.find(x => x.ad === h.ad) ? 'secili' : ''}`}
                      onClick={() => hizmetToggle(h)}
                    >
                      <span>
                        {secilenHizmetler.find(x => x.ad === h.ad) ? '✅ ' : ''}{h.ad}
                      </span>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#999' }}>{h.sure} dk</span>
                        <span className="fiyat">{h.fiyat} ₺</span>
                      </div>
                    </div>
                  ))}
                </div>

                {secilenHizmetler.length > 0 && (
                  <div className="toplam-fiyat">
                    <span>⏱ Toplam süre: <strong>{toplamSure} dk</strong></span>
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

                <p className="modal-label">
                  Saat Seç
                  {toplamSure > 0 && secilenSaat && (
                    <span style={{ fontSize: '12px', color: '#999', fontWeight: 'normal', marginLeft: '8px' }}>
                      ({secilenSaat} → {
                        (() => {
                          const [h, d] = secilenSaat.split(':').map(Number);
                          const bitis = h * 60 + d + toplamSure;
                          return `${String(Math.floor(bitis / 60)).padStart(2, '0')}:${String(bitis % 60).padStart(2, '0')}`;
                        })()
                      } arası bloklanacak)
                    </span>
                  )}
                </p>
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

export default MusteriAnaSayfa;