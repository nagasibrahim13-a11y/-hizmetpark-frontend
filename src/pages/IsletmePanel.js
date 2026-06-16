import React, { useState, useEffect } from 'react';
import './IsletmePanel.css';

function IsletmePanel({ kullanici, onCikis }) {
  const [randevular, setRandevular] = useState([]);
  const [isletme, setIsletme] = useState(null);
  const [aktifSekme, setAktifSekme] = useState('randevular');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    isletmeyiGetir();
  }, []);

  const isletmeyiGetir = async () => {
    try {
      const cevap = await fetch('http://localhost:5000/api/isletmeler');
      const veri = await cevap.json();
      const benim = veri.find(i => i.sahip._id === kullanici.id || i.sahip === kullanici.id);
      if (benim) {
        setIsletme(benim);
        randevulariGetir(benim._id);
      }
    } catch (err) {
      console.error(err);
    }
    setYukleniyor(false);
  };

  const randevulariGetir = async (isletmeId) => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/randevular/isletme/${isletmeId}`);
      const veri = await cevap.json();
      setRandevular(veri);
    } catch (err) {
      console.error(err);
    }
  };

  const durumGuncelle = async (randevuId, durum) => {
    try {
      await fetch(`http://localhost:5000/api/randevular/${randevuId}/durum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durum })
      });
      randevulariGetir(isletme._id);
    } catch (err) {
      console.error(err);
    }
  };

  const durumRenk = (durum) => {
    if (durum === 'onaylandi') return { bg: '#F1F8E9', color: '#2E7D32', border: '#C8E6C9' };
    if (durum === 'reddedildi') return { bg: '#FFF5F5', color: '#C62828', border: '#FFCDD2' };
    if (durum === 'tamamlandi') return { bg: '#E3F2FD', color: '#1565C0', border: '#BBDEFB' };
    return { bg: '#FFF8E1', color: '#F57F17', border: '#FFE082' };
  };

  const durumLabel = (durum) => {
    if (durum === 'onaylandi') return '✅ Onaylandı';
    if (durum === 'reddedildi') return '❌ Reddedildi';
    if (durum === 'tamamlandi') return '🏁 Tamamlandı';
    return '⏳ Bekliyor';
  };

  const bugunRandevular = randevular.filter(r => {
    const bugun = new Date().toISOString().split('T')[0];
    return r.tarih?.split('T')[0] === bugun;
  });

  if (yukleniyor) return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;

  if (!isletme) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Henüz işletmeniz yok</h2>
      <p style={{ marginTop: '8px', color: '#999' }}>Postman ile işletme oluşturun</p>
      <button onClick={onCikis} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Çıkış</button>
    </div>
  );

  return (
    <div className="panel-sayfa">
      <header className="header">
        <div className="header-logo">✂️ HizmetPark</div>
        <div className="header-orta">
          <span className="isletme-adi">{isletme.isletmeAdi}</span>
          <span className="panel-badge">Yönetim Paneli</span>
        </div>
        <button onClick={onCikis} className="cikis-btn">Çıkış</button>
      </header>

      {/* METRİKLER */}
      <div className="metrik-row">
        <div className="metrik-kart">
          <div className="metrik-sayi">{randevular.length}</div>
          <div className="metrik-label">Toplam Randevu</div>
        </div>
        <div className="metrik-kart">
          <div className="metrik-sayi">{bugunRandevular.length}</div>
          <div className="metrik-label">Bugün</div>
        </div>
        <div className="metrik-kart">
          <div className="metrik-sayi">
            {randevular.filter(r => r.durum === 'bekliyor').length}
          </div>
          <div className="metrik-label">Bekleyen</div>
        </div>
        <div className="metrik-kart">
          <div className="metrik-sayi">⭐ {isletme.ortalamaPuan || '4.8'}</div>
          <div className="metrik-label">Puan</div>
        </div>
      </div>

      {/* SEKMELER */}
      <div className="panel-icerik">
        <div className="sekme-row">
          <button
            className={`sekme-btn ${aktifSekme === 'randevular' ? 'aktif' : ''}`}
            onClick={() => setAktifSekme('randevular')}
          >
            📅 Randevular
          </button>
          <button
            className={`sekme-btn ${aktifSekme === 'hizmetler' ? 'aktif' : ''}`}
            onClick={() => setAktifSekme('hizmetler')}
          >
            ✂️ Hizmetler
          </button>
        </div>

        {/* RANDEVULAR SEKMESİ */}
        {aktifSekme === 'randevular' && (
          <div>
            {randevular.length === 0 ? (
              <div className="bos-mesaj">Henüz randevu yok</div>
            ) : (
              randevular.map(r => {
                const stil = durumRenk(r.durum);
                const hizmetler = Array.isArray(r.hizmet)
                  ? r.hizmet.map(h => h.ad).join(', ')
                  : r.hizmet?.ad || '-';
                const toplam = Array.isArray(r.hizmet)
                  ? r.hizmet.reduce((t, h) => t + h.fiyat, 0)
                  : r.hizmet?.fiyat || 0;

                return (
                  <div key={r._id} className="randevu-kart">
                    <div className="randevu-sol">
                      <div className="randevu-saat">{r.saat}</div>
                      <div className="randevu-tarih">
                        {new Date(r.tarih).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <div className="randevu-orta">
                      <div className="randevu-musteri">
                        {r.musteri?.ad} {r.musteri?.soyad}
                      </div>
                      <div className="randevu-hizmet">{hizmetler}</div>
                      {toplam > 0 && (
                        <div className="randevu-fiyat">{toplam} ₺</div>
                      )}
                    </div>
                    <div className="randevu-sag">
                      <span
                        className="durum-badge"
                        style={{ background: stil.bg, color: stil.color, border: `1px solid ${stil.border}` }}
                      >
                        {durumLabel(r.durum)}
                      </span>
                      {r.durum === 'bekliyor' && (
                        <div className="aksiyon-butonlar">
                          <button
                            className="onayla-btn"
                            onClick={() => durumGuncelle(r._id, 'onaylandi')}
                          >
                            Onayla
                          </button>
                          <button
                            className="reddet-btn"
                            onClick={() => durumGuncelle(r._id, 'reddedildi')}
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                      {r.durum === 'onaylandi' && (
                        <button
                          className="tamamla-btn"
                          onClick={() => durumGuncelle(r._id, 'tamamlandi')}
                        >
                          Tamamlandı
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* HİZMETLER SEKMESİ */}
        {aktifSekme === 'hizmetler' && (
          <div>
            {isletme.hizmetler.map((h, i) => (
              <div key={i} className="hizmet-satir-panel">
                <span className="hizmet-adi-panel">{h.ad}</span>
                <span className="hizmet-sure">{h.sure} dk</span>
                <span className="hizmet-fiyat-panel">{h.fiyat} ₺</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IsletmePanel;