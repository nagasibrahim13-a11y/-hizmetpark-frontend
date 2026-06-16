import React, { useState, useEffect } from 'react';
import './SadakatKartlarim.css';

function SadakatKartlarim({ kullanici, onGeri, onHediyeliRandevu }) {
  const [sadakatlar, setSadakatlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    sadakatlariGetir();
  }, []);

  const sadakatlariGetir = async () => {
    setYukleniyor(true);
    try {
      const cevap = await fetch(`http://localhost:5000/api/sadakat/musteri/${kullanici.id}`);
      const veri = await cevap.json();
      setSadakatlar(veri);
    } catch (err) {
      console.error(err);
    }
    setYukleniyor(false);
  };

  const kategoriEmoji = (kat) => {
    if (kat === 'berber') return '✂️';
    if (kat === 'kuafor') return '💅';
    if (kat === 'guzellik') return '💆';
    return '⚽';
  };

  const bekleyenOduller = (sadakat) => {
    return sadakat.kazanilanOduller.filter(o => !o.kullanildi);
  };

  return (
    <div className="sadakat-sayfa">
      <header className="header">
        <button className="geri-btn" onClick={onGeri}>← Geri</button>
        <div className="header-logo">✂️ HizmetPark</div>
        <div style={{ width: '80px' }} />
      </header>

      <div className="sadakat-icerik">
        <div className="sadakat-baslik">
          <h2>🎁 Sadakat Kartlarım</h2>
          <p>Puanlarını takip et, ödüllerini kazan</p>
        </div>

        {yukleniyor ? (
          <div className="yukleniyor">Yükleniyor...</div>
        ) : sadakatlar.length === 0 ? (
          <div className="bos-sadakat">
            <div className="bos-emoji">🎁</div>
            <h3>Henüz sadakat kartın yok</h3>
            <p>Bir işletmede randevu al ve tamamla — otomatik kart oluşturulur!</p>
          </div>
        ) : (
          <div className="sadakat-grid">
            {sadakatlar.map((s, i) => {
              const bekleyen = bekleyenOduller(s);
              const yuzde = Math.min((s.mevcutPuan / s.odul.hedefZiyaret) * 100, 100);

              return (
                <div key={i} className={`sadakat-kart ${bekleyen.length > 0 ? 'odul-var' : ''}`}>
                  {/* Kart başlığı */}
                  <div className="sadakat-kart-header">
                    <div className="sadakat-isletme-info">
                      <div className="sadakat-avatar">
                        {kategoriEmoji(s.isletme?.kategori)}
                      </div>
                      <div>
                        <div className="sadakat-isletme-adi">{s.isletme?.isletmeAdi}</div>
                        <div className="sadakat-isletme-konum">
                          📍 {s.isletme?.adres?.il} / {s.isletme?.adres?.ilce}
                        </div>
                      </div>
                    </div>
                    <div className="sadakat-toplam-badge">
                      🏆 {s.toplamZiyaret} ziyaret
                    </div>
                  </div>

                  {/* Ödül kazanıldıysa */}
                  {bekleyen.length > 0 && (
                    <div className="odul-kutucuk">
                      <div className="odul-kutucuk-sol">
                        <div className="odul-confetti">🎉</div>
                        <div>
                          <div className="odul-kutucuk-baslik">Ödül Kazandın!</div>
                          <div className="odul-kutucuk-aciklama">
                            {bekleyen.length}x {s.odul.hediye} kullanmaya hazır
                          </div>
                        </div>
                      </div>
                      <button
                        className="hediye-kullan-btn"
                        onClick={() => onHediyeliRandevu({
                          sadakatId: s._id,
                          isletme: s.isletme,
                          hediye: s.odul.hediye
                        })}
                      >
                        🎁 Kullan
                      </button>
                    </div>
                  )}

                  {/* İlerleme */}
                  <div className="ilerleme-bolum">
                    <div className="ilerleme-ust">
                      <span className="ilerleme-label">Sonraki ödüle ilerleme</span>
                      <span className="ilerleme-sayi">
                        <strong style={{ color: '#E53935' }}>{s.mevcutPuan}</strong> / {s.odul.hedefZiyaret}
                      </span>
                    </div>

                    {/* Nokta göstergesi */}
                    <div className="nokta-row">
                      {Array.from({ length: s.odul.hedefZiyaret }).map((_, idx) => (
                        <div key={idx} className={`nokta ${idx < s.mevcutPuan ? 'dolu' : ''}`}>
                          {idx < s.mevcutPuan ? '✓' : idx + 1}
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="progress-bar-bg">
                      <div className="progress-bar-dolu" style={{ width: `${yuzde}%` }} />
                    </div>

                    <div className="odul-bilgi-satir">
                      <span>🎁 Her <strong>{s.odul.hedefZiyaret}</strong> ziyarette:</span>
                      <span className="odul-hediye-adi">{s.odul.hediye}</span>
                    </div>
                  </div>

                  {/* Geçmiş ödüller */}
                  {s.kazanilanOduller.length > 0 && (
                    <div className="gecmis-oduller">
                      <div className="gecmis-baslik">📋 Geçmiş Ödüller</div>
                      {s.kazanilanOduller.map((o, oi) => (
                        <div key={oi} className={`gecmis-satir ${o.kullanildi ? 'kullanildi' : 'bekliyor'}`}>
                          <span>{o.kullanildi ? '✅' : '⏳'} {o.hediye}</span>
                          <span className="gecmis-tarih">
                            {new Date(o.tarih).toLocaleDateString('tr-TR')}
                            {o.kullanildi ? ' — Kullanıldı' : ' — Bekliyor'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SadakatKartlarim;