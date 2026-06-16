import React, { useState, useEffect } from 'react';
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

  useEffect(() => { isletmeyiGetir(); }, []);

  const isletmeyiGetir = async () => {
    try {
      const cevap = await fetch('http://localhost:5000/api/isletmeler');
      const veri = await cevap.json();
      const benim = veri.find(i => i.sahip._id === kullanici.id || i.sahip === kullanici.id);
      if (benim) {
        setIsletme(benim);
        setProfilForm({
          isletmeAdi: benim.isletmeAdi,
          telefon: benim.telefon,
          calismaBaslangic: benim.calismaBaslangic,
          calismaBitis: benim.calismaBitis,
          adres: { ...benim.adres }
        });
        randevulariGetir(benim._id);
        sadakatListesiGetir(benim._id);
      }
    } catch (err) { console.error(err); }
    setYukleniyor(false);
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
        body: JSON.stringify({ hedefZiyaret: Number(hedefZiyaret), hediye })
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
        body: JSON.stringify({
          ad: duzenleHizmet.ad,
          sure: Number(duzenleHizmet.sure),
          fiyat: Number(duzenleHizmet.fiyat)
        })
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
    if (!yeniHizmet.ad || !yeniHizmet.sure || !yeniHizmet.fiyat) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}/hizmet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: yeniHizmet.ad,
          sure: Number(yeniHizmet.sure),
          fiyat: Number(yeniHizmet.fiyat)
        })
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
      setTimeout(() => { setProfilBasari(''); isletmeyiGetir(); }, 1500);
    } catch (err) { console.error(err); }
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

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #E0E0E0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '12px',
    background: '#FAFAFA',
    color: '#1A1A1A'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#777',
    display: 'block',
    marginBottom: '4px'
  };

  if (yukleniyor) return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;

  if (!isletme) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Henüz işletmeniz yok</h2>
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
          <div className="metrik-sayi">{randevular.filter(r => r.durum === 'bekliyor').length}</div>
          <div className="metrik-label">Bekleyen</div>
        </div>
        <div className="metrik-kart">
          <div className="metrik-sayi">⭐ {isletme.ortalamaPuan || '0'}</div>
          <div className="metrik-label">Puan</div>
        </div>
      </div>

      <div className="panel-icerik">
        {/* SEKMELER */}
        <div className="sekme-row">
          <button className={`sekme-btn ${aktifSekme === 'randevular' ? 'aktif' : ''}`} onClick={() => setAktifSekme('randevular')}>📅 Randevular</button>
          <button className={`sekme-btn ${aktifSekme === 'sadakat' ? 'aktif' : ''}`} onClick={() => setAktifSekme('sadakat')}>🎁 Sadakat</button>
          <button className={`sekme-btn ${aktifSekme === 'hizmetler' ? 'aktif' : ''}`} onClick={() => setAktifSekme('hizmetler')}>✂️ Hizmetler</button>
          <button className={`sekme-btn ${aktifSekme === 'profil' ? 'aktif' : ''}`} onClick={() => setAktifSekme('profil')}>🏪 Profilim</button>
        </div>

        {/* RANDEVULAR */}
        {aktifSekme === 'randevular' && (
          <div>
            {randevular.length === 0 ? (
              <div className="bos-mesaj">Henüz randevu yok</div>
            ) : (
              randevular.map(r => {
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
                      <div className="randevu-musteri">{r.musteri?.ad} {r.musteri?.soyad}</div>
                      <div className="randevu-hizmet">{hizmetler}</div>
                      {r.hediyeMi ? (
                        <div style={{ fontSize: '12px', color: '#F57F17', fontWeight: '600', marginTop: '2px' }}>🎁 Hediye Randevu — Ücretsiz</div>
                      ) : toplam > 0 ? (
                        <div className="randevu-fiyat">{toplam} ₺</div>
                      ) : null}
                    </div>
                    <div className="randevu-sag">
                      <span className="durum-badge" style={{ background: stil.bg, color: stil.color, border: `1px solid ${stil.border}` }}>
                        {durumLabel(r.durum)}
                      </span>
                      {r.durum === 'bekliyor' && (
                        <div className="aksiyon-butonlar">
                          <button className="onayla-btn" onClick={() => durumGuncelle(r._id, 'onaylandi')}>Onayla</button>
                          <button className="reddet-btn" onClick={() => durumGuncelle(r._id, 'reddedildi')}>Reddet</button>
                        </div>
                      )}
                      {r.durum === 'onaylandi' && (
                        <button className="tamamla-btn" onClick={() => durumGuncelle(r._id, 'tamamlandi')}>Tamamlandı</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SADAKAT */}
        {aktifSekme === 'sadakat' && (
          <div>
            <div className="sadakat-ayar-kart">
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#1A1A1A' }}>🎁 Sadakat Programı Ayarları</h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '120px' }}>
                  <label style={labelStyle}>Kaç ziyarette ödül?</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={hedefZiyaret}
                    onChange={e => setHedefZiyaret(e.target.value)}
                    onFocus={e => e.target.select()}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: '3', minWidth: '200px' }}>
                  <label style={labelStyle}>Hediye ne olsun?</label>
                  <input
                    type="text"
                    value={hediye}
                    onChange={e => setHediye(e.target.value)}
                    placeholder="Örn: Ücretsiz Saç Yıkama"
                    style={inputStyle}
                  />
                </div>
                <button onClick={sadakatKaydet} style={{ background: '#E53935', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
                  Kaydet
                </button>
              </div>
              {sadakatKayitBasari && (
                <div style={{ background: '#F1F8E9', color: '#2E7D32', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginTop: '4px', border: '1px solid #C8E6C9' }}>✅ {sadakatKayitBasari}</div>
              )}
              <div style={{ background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '10px 14px', marginTop: '8px', fontSize: '13px', color: '#E53935' }}>
                🎁 Her <strong>{hedefZiyaret}</strong> ziyarette müşteriye <strong>{hediye}</strong> hediye edilecek
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A', margin: '20px 0 12px' }}>
              Sadakat Müşterileri ({sadakatListesi.length})
            </h3>
            {sadakatListesi.length === 0 ? (
              <div className="bos-mesaj">Henüz sadakat müşterisi yok</div>
            ) : (
              sadakatListesi.map((s, i) => {
                const bekleyenOdul = s.kazanilanOduller?.filter(o => !o.kullanildi).length || 0;
                return (
                  <div key={i} className="randevu-kart">
                    <div className="randevu-sol" style={{ minWidth: '50px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF5F5', border: '2px solid #FFCDD2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#E53935' }}>
                        {s.musteri?.ad?.[0]}{s.musteri?.soyad?.[0]}
                      </div>
                    </div>
                    <div className="randevu-orta">
                      <div className="randevu-musteri">{s.musteri?.ad} {s.musteri?.soyad}</div>
                      <div className="randevu-hizmet">{s.musteri?.email}</div>
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: '1', height: '6px', background: '#F0F0F0', borderRadius: '20px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min((s.mevcutPuan / s.odul.hedefZiyaret) * 100, 100)}%`, background: '#E53935', borderRadius: '20px' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#E53935', fontWeight: '700' }}>{s.mevcutPuan}/{s.odul.hedefZiyaret}</span>
                      </div>
                    </div>
                    <div className="randevu-sag">
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#999' }}>Toplam</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#E53935' }}>{s.toplamZiyaret} ziyaret</div>
                      </div>
                      {bekleyenOdul > 0 && (
                        <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', color: '#F57F17', marginTop: '4px' }}>
                          🎁 {bekleyenOdul} ödül bekliyor
                        </div>
                      )}
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
              <button
                onClick={() => setYeniHizmetModal(true)}
                style={{ background: '#E53935', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                + Yeni Hizmet Ekle
              </button>
            </div>
            {isletme.hizmetler.map((h, i) => (
              <div key={i} className="hizmet-satir-panel">
                <div style={{ flex: 1 }}>
                  <div className="hizmet-adi-panel">{h.ad}</div>
                  <div className="hizmet-sure">⏱ {h.sure} dk</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="hizmet-fiyat-panel">{h.fiyat} ₺</div>
                  <button
                    onClick={() => { setDuzenleHizmet({ ...h }); setDuzenleModal(true); }}
                    style={{ background: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => hizmetSil(h._id)}
                    style={{ background: '#FFF5F5', color: '#C62828', border: '1px solid #FFCDD2', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROFİLİM */}
        {aktifSekme === 'profil' && (
          <div>
            {/* Profil görüntüleme */}
            <div style={{ background: 'linear-gradient(135deg, #E53935, #B71C1C)', borderRadius: '16px', padding: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>
                {kategoriEmoji(isletme.kategori)}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>{isletme.isletmeAdi}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                  📍 {isletme.adres?.il} / {isletme.adres?.ilce}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                  📞 {isletme.telefon}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                  🕐 {isletme.calismaBaslangic} - {isletme.calismaBitis}
                </div>
              </div>
            </div>

            {/* Profil düzenleme formu */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #F0F0F0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A1A', marginBottom: '16px' }}>✏️ Profili Düzenle</h3>

              <label style={labelStyle}>İşletme Adı</label>
              <input style={inputStyle} value={profilForm.isletmeAdi || ''} onChange={e => setProfilForm({ ...profilForm, isletmeAdi: e.target.value })} />

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

              {profilBasari && (
                <div style={{ background: '#F1F8E9', color: '#2E7D32', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid #C8E6C9' }}>✅ {profilBasari}</div>
              )}

              <button onClick={profilKaydet} style={{ background: '#E53935', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HİZMET DÜZENLE MODAL */}
      {duzenleModal && duzenleHizmet && (
        <div className="modal-overlay" onClick={() => setDuzenleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Hizmet Düzenle</h2>
              <button className="modal-kapat" onClick={() => setDuzenleModal(false)}>✕</button>
            </div>
            <label style={labelStyle}>Hizmet Adı</label>
            <input style={inputStyle} value={duzenleHizmet.ad} onChange={e => setDuzenleHizmet({ ...duzenleHizmet, ad: e.target.value })} />
            <label style={labelStyle}>Süre (dakika)</label>
            <input style={inputStyle} type="number" value={duzenleHizmet.sure} onFocus={e => e.target.select()} onChange={e => setDuzenleHizmet({ ...duzenleHizmet, sure: e.target.value })} />
            <label style={labelStyle}>Fiyat (₺)</label>
            <input style={inputStyle} type="number" value={duzenleHizmet.fiyat} onFocus={e => e.target.select()} onChange={e => setDuzenleHizmet({ ...duzenleHizmet, fiyat: e.target.value })} />
            <button onClick={hizmetDuzenleKaydet} style={{ background: '#E53935', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* YENİ HİZMET MODAL */}
      {yeniHizmetModal && (
        <div className="modal-overlay" onClick={() => setYeniHizmetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>+ Yeni Hizmet Ekle</h2>
              <button className="modal-kapat" onClick={() => setYeniHizmetModal(false)}>✕</button>
            </div>
            <label style={labelStyle}>Hizmet Adı</label>
            <input style={inputStyle} placeholder="Örn: Saç Boyama" value={yeniHizmet.ad} onChange={e => setYeniHizmet({ ...yeniHizmet, ad: e.target.value })} />
            <label style={labelStyle}>Süre (dakika)</label>
            <input style={inputStyle} type="number" placeholder="20" value={yeniHizmet.sure} onFocus={e => e.target.select()} onChange={e => setYeniHizmet({ ...yeniHizmet, sure: e.target.value })} />
            <label style={labelStyle}>Fiyat (₺)</label>
            <input style={inputStyle} type="number" placeholder="150" value={yeniHizmet.fiyat} onFocus={e => e.target.select()} onChange={e => setYeniHizmet({ ...yeniHizmet, fiyat: e.target.value })} />
            <button onClick={hizmetEkle} style={{ background: '#E53935', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
              Ekle
            </button>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border-radius: 16px; padding: 28px; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h2 { font-size: 18px; font-weight: 700; }
        .modal-kapat { background: #F5F5F5; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px; }
        .sadakat-ayar-kart { background: white; border-radius: 12px; padding: 20px; border: 1px solid #F0F0F0; margin-bottom: 8px; }
      `}</style>
    </div>
  );
}

export default IsletmePanel;