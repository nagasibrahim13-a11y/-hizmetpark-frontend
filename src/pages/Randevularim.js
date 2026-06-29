import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Randevularim.css';

function Randevularim({ kullanici, onGeri }) {
  const { authHeaders } = useAuth();
  const [randevular, setRandevular] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifFiltre, setAktifFiltre] = useState('hepsi');

  useEffect(() => {
    randevulariGetir();
  }, []);

  const randevulariGetir = async () => {
    setYukleniyor(true);
    try {
      const cevap = await fetch(`http://localhost:5000/api/randevular/musteri/${kullanici.id}`, { headers: authHeaders() });
      const veri = await cevap.json();
      setRandevular(veri);
    } catch (err) {
      console.error(err);
    }
    setYukleniyor(false);
  };

  const durumRenk = (durum) => {
    if (durum === 'onaylandi') return { bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' };
    if (durum === 'reddedildi') return { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' };
    if (durum === 'tamamlandi') return { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' };
    return { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
  };

  const durumLabel = (durum) => {
    if (durum === 'onaylandi') return '✅ Onaylandı';
    if (durum === 'tamamlandi') return '🏁 Tamamlandı';
    if (durum === 'iptal') return '🚫 İptal Edildi';
    return durum;
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
    { deger: 'onaylandi', label: '✅ Onaylanan' },
    { deger: 'tamamlandi', label: '🏁 Tamamlanan' },
    { deger: 'iptal', label: '🚫 İptal Edilen' },
  ];

  const filtreliRandevular = aktifFiltre === 'hepsi'
    ? randevular
    : randevular.filter(r => r.durum === aktifFiltre);

  return (
    <div className="randevularim-sayfa">
      <div className="randevularim-icerik">
        <div className="randevularim-baslik">
          <h2>Randevularım</h2>
          <p>Tüm randevu geçmişin</p>
        </div>

        {/* İSTATİSTİKLER */}
        <div className="istat-row">
          <div className="istat-kart">
            <div className="istat-sayi" style={{ color: '#4F46E5' }}>{randevular.length}</div>
            <div className="istat-label">Toplam</div>
          </div>
          <div className="istat-kart">
            <div className="istat-sayi" style={{ color: '#4F46E5' }}>
              {randevular.filter(r => r.durum === 'onaylandi').length}
            </div>
            <div className="istat-label">Onaylanan</div>
          </div>
          <div className="istat-kart">
            <div className="istat-sayi" style={{ color: '#10B981' }}>
              {randevular.filter(r => r.durum === 'tamamlandi').length}
            </div>
            <div className="istat-label">Tamamlanan</div>
          </div>
          <div className="istat-kart">
            <div className="istat-sayi" style={{ color: '#EF4444' }}>
              {randevular.filter(r => r.durum === 'iptal').length}
            </div>
            <div className="istat-label">İptal Edilen</div>
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
                    {r.durum === 'onaylandi' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Randevunuzu iptal etmek istediğinize emin misiniz?')) return;
                          try {
                            await fetch(`http://localhost:5000/api/randevular/${r._id}/iptal`, { method: 'PUT', headers: authHeaders() });
                            randevulariGetir();
                          } catch (err) { console.error(err); }
                        }}
                        style={{ padding: '6px 14px', background: 'white', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginTop: '8px' }}>
                        İptal Et
                      </button>
                    )}
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