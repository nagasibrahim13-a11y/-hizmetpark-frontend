import React, { useState, useEffect } from 'react';
import './Randevularim.css';

function Randevularim({ kullanici, onGeri }) {
  const [randevular, setRandevular] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifFiltre, setAktifFiltre] = useState('hepsi');

  useEffect(() => {
    randevulariGetir();
  }, []);

  const randevulariGetir = async () => {
    setYukleniyor(true);
    try {
      const cevap = await fetch(`http://localhost:5000/api/randevular/musteri/${kullanici.id}`);
      const veri = await cevap.json();
      setRandevular(veri);
    } catch (err) {
      console.error(err);
    }
    setYukleniyor(false);
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

  const kategoriEmoji = (isletme) => {
    if (!isletme) return '🏪';
    if (isletme.kategori === 'berber') return '✂️';
    if (isletme.kategori === 'kuafor') return '💅';
    if (isletme.kategori === 'guzellik') return '💆';
    return '⚽';
  };

  const filtreler = [
    { deger: 'hepsi', label: 'Hepsi' },
    { deger: 'bekliyor', label: '⏳ Bekleyen' },
    { deger: 'onaylandi', label: '✅ Onaylanan' },
    { deger: 'tamamlandi', label: '🏁 Tamamlanan' },
    { deger: 'reddedildi', label: '❌ Reddedilen' },
  ];

  const filtreliRandevular = aktifFiltre === 'hepsi'
    ? randevular
    : randevular.filter(r => r.durum === aktifFiltre);

  return (
    <div className="randevularim-sayfa">
      <header className="header">
        <button className="geri-btn" onClick={onGeri}>← Geri</button>
        <div className="header-logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="#4F46E5" strokeWidth="2"/>
            <path d="M3 9h18" stroke="#4F46E5" strokeWidth="2"/>
            <path d="M8 2.5v3M16 2.5v3" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="8" cy="14" r="1.5" fill="#4F46E5"/>
            <circle cx="12" cy="14" r="1.5" fill="#4F46E5"/>
            <circle cx="16" cy="14" r="1.5" fill="#4F46E5"/>
          </svg>
          HizmetPark
        </div>
        <div style={{ width: '80px' }} />
      </header>

      <div className="randevularim-icerik">
        <div className="randevularim-baslik">
          <h2>Randevularım</h2>
          <p>Tüm randevu geçmişin</p>
        </div>

        {/* İSTATİSTİKLER */}
        <div className="istat-row">
          <div className="istat-kart">
            <div className="istat-sayi">{randevular.length}</div>
            <div className="istat-label">Toplam</div>
          </div>
          <div className="istat-kart">
            <div className="istat-sayi" style={{ color: '#F57F17' }}>
              {randevular.filter(r => r.durum === 'bekliyor').length}
            </div>
            <div className="istat-label">Bekleyen</div>
          </div>
          <div className="istat-kart">
            <div className="istat-sayi" style={{ color: '#2E7D32' }}>
              {randevular.filter(r => r.durum === 'onaylandi').length}
            </div>
            <div className="istat-label">Onaylanan</div>
          </div>
          <div className="istat-kart">
            <div className="istat-sayi" style={{ color: '#1565C0' }}>
              {randevular.filter(r => r.durum === 'tamamlandi').length}
            </div>
            <div className="istat-label">Tamamlanan</div>
          </div>
          <div className="istat-kart">
            <div className="istat-sayi" style={{ color: '#C62828' }}>
              {randevular.filter(r => r.durum === 'reddedildi').length}
            </div>
            <div className="istat-label">Reddedilen</div>
          </div>
        </div>

        {/* FİLTRELER */}
        <div className="filtre-row">
          {filtreler.map(f => (
            <button
              key={f.deger}
              className={`filtre-btn ${aktifFiltre === f.deger ? 'aktif' : ''}`}
              onClick={() => setAktifFiltre(f.deger)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* RANDEVU LİSTESİ */}
        {yukleniyor ? (
          <div className="yukleniyor">Yükleniyor...</div>
        ) : filtreliRandevular.length === 0 ? (
          <div className="bos-randevu">
            <div className="bos-emoji">📅</div>
            <p>Henüz randevu yok</p>
          </div>
        ) : (
          <div className="randevu-listesi">
            {filtreliRandevular.map(r => {
              const stil = durumRenk(r.durum);
              const hizmetler = Array.isArray(r.hizmet)
                ? r.hizmet.map(h => h.ad).join(', ')
                : r.hizmet?.ad || '-';
              const toplam = Array.isArray(r.hizmet)
                ? r.hizmet.reduce((t, h) => t + (h.fiyat || 0), 0)
                : r.hizmet?.fiyat || 0;
              const sure = Array.isArray(r.hizmet)
                ? r.hizmet.reduce((t, h) => t + (h.sure || 0), 0)
                : r.hizmet?.sure || 0;

              return (
                <div key={r._id} className="randevu-kart-musteri">
                  {/* Sol — tarih ve saat */}
                  <div className="randevu-tarih-bolum">
                    <div className="randevu-gun">
                      {new Date(r.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="randevu-saat-buyuk">{r.saat}</div>
                    {sure > 0 && <div className="randevu-sure">⏱ {sure} dk</div>}
                  </div>

                  {/* Orta — işletme ve hizmet bilgisi */}
                  <div className="randevu-bilgi">
                    <div className="randevu-isletme-adi">
                      {kategoriEmoji(r.isletme)} {r.isletme?.isletmeAdi || 'İşletme'}
                    </div>
                    <div className="randevu-hizmet-adi">{hizmetler}</div>
                    {r.isletme?.adres && (
                      <div className="randevu-konum">
                        📍 {r.isletme.adres.il} / {r.isletme.adres.ilce}
                      </div>
                    )}
                    {toplam > 0 && (
                      <div className="randevu-tutar">{toplam} ₺</div>
                    )}
                  </div>

                  {/* Sağ — durum */}
                  <div className="randevu-durum-bolum">
                    <span
                      className="durum-badge-musteri"
                      style={{ background: stil.bg, color: stil.color, border: `1px solid ${stil.border}` }}
                    >
                      {durumLabel(r.durum)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Randevularim;