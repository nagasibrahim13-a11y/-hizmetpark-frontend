import React, { useState, useEffect } from 'react';
import './MusteriAnaSayfa.css';

function MusteriAnaSayfa({ kullanici, onCikis, onProfilAc, onRandevularim, onSadakat }) {
  const [isletmeler, setIsletmeler] = useState([]);
  const [filtreliIsletmeler, setFiltreliIsletmeler] = useState([]);
  const [kategori, setKategori] = useState('');
  const [aramaMetni, setAramaMetni] = useState('');
  const [sehir, setSehir] = useState('');
  const [siralama, setSiralama] = useState('varsayilan');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenIsletme, setSecilenIsletme] = useState(null);
  const [randevuModal, setRandevuModal] = useState(false);
  const [secilenHizmetler, setSecilenHizmetler] = useState([]);
  const [secilenSaat, setSecilenSaat] = useState('');
  const [secilenTarih, setSecilenTarih] = useState('');
  const [randevuBasari, setRandevuBasari] = useState('');
  const [randevuHata, setRandevuHata] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [yorumModal, setYorumModal] = useState(false);
  const [yorumIsletme, setYorumIsletme] = useState(null);
  const [yorumlar, setYorumlar] = useState([]);
  const [yeniPuan, setYeniPuan] = useState(5);
  const [yeniYorum, setYeniYorum] = useState('');
  const [yorumBasari, setYorumBasari] = useState('');
  const [yorumHata, setYorumHata] = useState('');
  const [yorumYukleniyor, setYorumYukleniyor] = useState(false);
  const [tamamlananRandevular, setTamamlananRandevular] = useState([]);
  const [secilenRandevu, setSecilenRandevu] = useState('');
  const [sehirler, setSehirler] = useState([]);
  const [sliderReklamlar, setSliderReklamlar] = useState([]);
  const [sponsorluReklamlar, setSponsorluReklamlar] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);

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
    tamamlananRandevulariGetir();
    reklamlariGetir();
  }, []);

  useEffect(() => {
    filtreUygula();
  }, [isletmeler, kategori, aramaMetni, sehir, siralama]);

  const isletmeleriGetir = async () => {
    setYukleniyor(true);
    try {
      const cevap = await fetch('http://localhost:5000/api/isletmeler');
      const veri = await cevap.json();
      setIsletmeler(veri);
      const benzersizSehirler = [...new Set(veri.map(i => i.adres?.il).filter(Boolean))];
      setSehirler(benzersizSehirler);
    } catch (err) { console.error(err); }
    setYukleniyor(false);
  };

  const reklamlariGetir = async () => {
    try {
      const cevap = await fetch('http://localhost:5000/api/reklamlar/aktif');
      const veri = await cevap.json();
      setSliderReklamlar(veri.filter(r => r.tip === 'slider'));
      setSponsorluReklamlar(veri.filter(r => r.tip === 'sponsorlu'));
    } catch (err) { console.error(err); }
  };

  const filtreUygula = () => {
    let sonuc = [...isletmeler];
    if (kategori) sonuc = sonuc.filter(i => i.kategori === kategori);
    if (aramaMetni.trim()) {
      const ara = aramaMetni.toLowerCase();
      sonuc = sonuc.filter(i =>
        i.isletmeAdi?.toLowerCase().includes(ara) ||
        i.adres?.il?.toLowerCase().includes(ara) ||
        i.adres?.ilce?.toLowerCase().includes(ara)
      );
    }
    if (sehir) sonuc = sonuc.filter(i => i.adres?.il === sehir);
    if (siralama === 'puan') sonuc.sort((a, b) => (b.ortalamaPuan || 0) - (a.ortalamaPuan || 0));
    else if (siralama === 'yorum') sonuc.sort((a, b) => (b.yorumSayisi || 0) - (a.yorumSayisi || 0));
    else if (siralama === 'isim') sonuc.sort((a, b) => a.isletmeAdi?.localeCompare(b.isletmeAdi));
    setFiltreliIsletmeler(sonuc);
  };

  const tamamlananRandevulariGetir = async () => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/yorumlar/tamamlanan/${kullanici.id}`);
      const veri = await cevap.json();
      setTamamlananRandevular(veri);
    } catch (err) { console.error(err); }
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
        setRandevuBasari(`Randevunuz oluşturuldu! ${secilenSaat} - ${toplamSure} dk.`);
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

  const modalAc = (isletme, e) => {
    e.stopPropagation();
    setSecilenIsletme(isletme);
    setRandevuModal(true);
    setRandevuBasari('');
    setRandevuHata('');
    setSecilenHizmetler([]);
    setSecilenSaat('');
    setSecilenTarih('');
  };

  const yorumModalAc = async (isletme, e) => {
    e.stopPropagation();
    setYorumIsletme(isletme);
    setYorumModal(true);
    setYeniPuan(5);
    setYeniYorum('');
    setYorumBasari('');
    setYorumHata('');
    setSecilenRandevu('');
    setYorumYukleniyor(true);
    try {
      const cevap = await fetch(`http://localhost:5000/api/yorumlar/isletme/${isletme._id}`);
      const veri = await cevap.json();
      setYorumlar(veri);
    } catch (err) { console.error(err); }
    setYorumYukleniyor(false);
  };

  const yorumGonder = async () => {
    if (!yeniYorum.trim()) { setYorumHata('Yorum yazınız'); return; }
    if (!secilenRandevu) { setYorumHata('Lütfen hangi randevu için yorum yaptığınızı seçin'); return; }
    setYorumHata('');
    try {
      const cevap = await fetch('http://localhost:5000/api/yorumlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          musteri: kullanici.id,
          isletme: yorumIsletme._id,
          randevu: secilenRandevu,
          puan: yeniPuan,
          yorum: yeniYorum
        })
      });
      const veri = await cevap.json();
      if (!cevap.ok) {
        setYorumHata(veri.hata);
      } else {
        setYorumBasari('Yorumunuz eklendi!');
        setYeniYorum('');
        setSecilenRandevu('');
        tamamlananRandevulariGetir();
        const yCevap = await fetch(`http://localhost:5000/api/yorumlar/isletme/${yorumIsletme._id}`);
        const yVeri = await yCevap.json();
        setYorumlar(yVeri);
        setTimeout(() => setYorumBasari(''), 2000);
      }
    } catch (err) { setYorumHata('Sunucuya bağlanılamadı'); }
  };

  const yildizGoster = (puan) => [1, 2, 3, 4, 5].map(i => (
    <span key={i} style={{ color: i <= puan ? '#FFA726' : '#E0E0E0', fontSize: '16px' }}>★</span>
  ));

  const isletmeRandevulari = tamamlananRandevular.filter(r => r.isletme?._id === yorumIsletme?._id);
  const bugunTarih = new Date().toISOString().split('T')[0];
  const filtreleriSifirla = () => { setKategori(''); setAramaMetni(''); setSehir(''); setSiralama('varsayilan'); };
  const aktifFiltreVar = kategori || aramaMetni || sehir || siralama !== 'varsayilan';

  const sliderTikla = async (reklam) => {
    try { await fetch(`http://localhost:5000/api/reklamlar/${reklam._id}/tikla`, { method: 'PUT' }); } catch (err) {}
    onProfilAc(reklam.isletme._id);
  };

  const isletmelerikListele = () => {
    const liste = [...filtreliIsletmeler];
    const sponsorlu = sponsorluReklamlar.map(r => ({
      ...r.isletme,
      _sponsorlu: true,
      _reklamId: r._id,
      _reklamBaslik: r.baslik,
      _reklamAciklama: r.aciklama
    }));
    const sonuc = [];
    let sponsorIndex = 0;
    liste.forEach((item, i) => {
      sonuc.push(item);
      if ((i + 1) % 3 === 0 && sponsorIndex < sponsorlu.length) {
        sonuc.push(sponsorlu[sponsorIndex]);
        sponsorIndex++;
      }
    });
    return sonuc;
  };

  // Öne çıkan bölümler için veri
  const puaniYuksekler = [...isletmeler]
    .filter(i => (i.ortalamaPuan || 0) > 0)
    .sort((a, b) => (b.ortalamaPuan || 0) - (a.ortalamaPuan || 0))
    .slice(0, 3);

  const populerler = [...isletmeler]
    .filter(i => (i.yorumSayisi || 0) > 0)
    .sort((a, b) => (b.yorumSayisi || 0) - (a.yorumSayisi || 0))
    .slice(0, 4);

  const oneCikanGosterilsin = !aktifFiltreVar && (puaniYuksekler.length > 0 || populerler.length > 0);

  const kategoriEmoji = (kat) => kat === 'berber' ? '✂️' : kat === 'kuafor' ? '💅' : kat === 'guzellik' ? '💆' : '⚽';

  return (
    <div className="musteri-sayfa">
      <header className="header">
        <div className="header-logo">✂️ HizmetPark</div>
        <div className="header-sag">
          <span>Merhaba, {kullanici.ad}</span>
          <button onClick={onRandevularim} className="cikis-btn" style={{ marginRight: '8px' }}>📅 Randevularım</button>
          <button onClick={onSadakat} className="cikis-btn" style={{ marginRight: '8px' }}>🎁 Sadakat</button>
          <button onClick={onCikis} className="cikis-btn">Çıkış</button>
        </div>
      </header>

      <div className="icerik">
        <div className="arama-bolum">
          <h2>Yakınındaki hizmetleri keşfet</h2>
          <p>Berber, kuaför, güzellik salonu ve daha fazlası</p>
        </div>

        {/* SLIDER REKLAMLAR */}
        {sliderReklamlar.length > 0 && (
          <div className="reklam-slider" onClick={() => sliderTikla(sliderReklamlar[sliderIndex])}>
            {sliderReklamlar[sliderIndex].gorsel && (
              <img src={sliderReklamlar[sliderIndex].gorsel} alt="reklam" className="reklam-slider-gorsel" />
            )}
            <div className="reklam-slider-icerik">
              <span className="reklam-badge">SPONSORLU</span>
              <div className="reklam-slider-baslik">{sliderReklamlar[sliderIndex].baslik}</div>
              <div className="reklam-slider-isletme">{sliderReklamlar[sliderIndex].isletme?.isletmeAdi}</div>
              {sliderReklamlar[sliderIndex].aciklama && (
                <div className="reklam-slider-aciklama">{sliderReklamlar[sliderIndex].aciklama}</div>
              )}
            </div>
            {sliderReklamlar.length > 1 && (
              <div className="slider-noktalar">
                {sliderReklamlar.map((_, i) => (
                  <div key={i} className={`slider-nokta ${i === sliderIndex ? 'aktif' : ''}`}
                    onClick={e => { e.stopPropagation(); setSliderIndex(i); }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ARAMA */}
        <div className="arama-kutusu">
          <span className="arama-icon">🔍</span>
          <input type="text" placeholder="İşletme, hizmet ara..." value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} className="arama-input" />
          {aramaMetni && <button onClick={() => setAramaMetni('')} className="temizle-btn">✕</button>}
        </div>

        {/* ŞEHİR ÇİPLERİ */}
        {sehirler.length > 0 && (
          <div className="sehir-cip-row">
            <span className="sehir-cip-label">📍 Konumun:</span>
            {sehirler.slice(0, 6).map(s => (
              <button
                key={s}
                className={`sehir-cip ${sehir === s ? 'aktif' : ''}`}
                onClick={() => setSehir(sehir === s ? '' : s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* FİLTRELER */}
        <div className="filtre-bolum">
          <div className="kategori-row">
            {kategoriler.map(k => (
              <button key={k.deger} className={`kategori-btn ${kategori === k.deger ? 'aktif' : ''}`} onClick={() => setKategori(k.deger)}>
                {k.emoji} {k.label}
              </button>
            ))}
          </div>
          <div className="alt-filtre-row">
            <select value={sehir} onChange={e => setSehir(e.target.value)} className="filtre-select">
              <option value="">📍 Tüm Şehirler</option>
              {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={siralama} onChange={e => setSiralama(e.target.value)} className="filtre-select">
              <option value="varsayilan">🔀 Varsayılan</option>
              <option value="puan">⭐ En Yüksek Puan</option>
              <option value="yorum">💬 En Çok Yorum</option>
              <option value="isim">🔤 İsme Göre (A-Z)</option>
            </select>
            {aktifFiltreVar && <button onClick={filtreleriSifirla} className="sifirla-btn">🔄 Sıfırla</button>}
          </div>
        </div>

        {/* ÖNE ÇIKAN BÖLÜMLER — sadece filtre yokken */}
        {oneCikanGosterilsin && (
          <>
            {puaniYuksekler.length > 0 && (
              <div className="one-cikan-bolum">
                <h3 className="one-cikan-baslik">⭐ Puanı Yüksek İşletmeler</h3>
                <div className="one-cikan-row">
                  {puaniYuksekler.map(isletme => (
                    <div key={isletme._id} className="mini-kart" onClick={() => onProfilAc(isletme._id)}>
                      <div className="mini-kart-ust">
                        <span className="mini-kart-isim">{isletme.isletmeAdi}</span>
                        <span className="mini-kart-puan">⭐ {isletme.ortalamaPuan}</span>
                      </div>
                      <div className="mini-kart-slogan">{isletme.slogan || (isletme.hizmetler?.[0]?.ad ?? '')}</div>
                      <div className="mini-kart-konum">📍 {isletme.adres?.il} / {isletme.adres?.ilce}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {populerler.length > 0 && (
              <div className="one-cikan-bolum">
                <h3 className="one-cikan-baslik">🔥 Popüler İşletmeler</h3>
                <div className="one-cikan-row-4">
                  {populerler.map(isletme => (
                    <div key={isletme._id} className="mini-kart-kucuk" onClick={() => onProfilAc(isletme._id)}>
                      <span className="mini-kart-kucuk-emoji">{kategoriEmoji(isletme.kategori)}</span>
                      <div className="mini-kart-kucuk-isim">{isletme.isletmeAdi}</div>
                      <div className="mini-kart-kucuk-yorum">{isletme.yorumSayisi} yorum</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="sonuc-satiri">
          <span className="sonuc-sayi">
            {filtreliIsletmeler.length} işletme bulundu
            {aktifFiltreVar && <span className="filtre-aktif-badge"> • Filtre aktif</span>}
          </span>
        </div>

        {/* İŞLETME LİSTESİ */}
        {yukleniyor ? (
          <div className="yukleniyor">Yükleniyor...</div>
        ) : filtreliIsletmeler.length === 0 ? (
          <div className="bos">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <p>Sonuç bulunamadı</p>
            <button onClick={filtreleriSifirla} style={{ marginTop: '12px', padding: '8px 16px', background: '#E53935', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Filtreleri Temizle</button>
          </div>
        ) : (
          <div className="isletme-grid">
            {isletmelerikListele().map((isletme, idx) => {
              if (isletme._sponsorlu) {
                return (
                  <div
                    key={`sponsorlu-${idx}`}
                    className="isletme-kart card sponsorlu-kart"
                    onClick={async () => {
                      try { await fetch(`http://localhost:5000/api/reklamlar/${isletme._reklamId}/tikla`, { method: 'PUT' }); } catch (e) {}
                      onProfilAc(isletme._id);
                    }}
                    style={{ cursor: 'pointer', border: '2px solid #F59E0B' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>SPONSORLU</span>
                      <span style={{ fontSize: '20px' }}>{kategoriEmoji(isletme.kategori)}</span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A1A', marginBottom: '4px' }}>{isletme.isletmeAdi}</h3>
                    {isletme._reklamBaslik && <p style={{ fontSize: '13px', color: '#F59E0B', fontWeight: '600', marginBottom: '4px' }}>{isletme._reklamBaslik}</p>}
                    {isletme._reklamAciklama && <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>{isletme._reklamAciklama}</p>}
                    <p style={{ fontSize: '12px', color: '#999' }}>📍 {isletme.adres?.il} / {isletme.adres?.ilce}</p>
                    <button className="btn-primary" style={{ marginTop: '12px' }} onClick={e => { e.stopPropagation(); onProfilAc(isletme._id); }}>
                      Profili Gör →
                    </button>
                  </div>
                );
              }

              return (
                <div key={isletme._id} className="isletme-kart card" onClick={() => onProfilAc(isletme._id)} style={{ cursor: 'pointer' }}>
                  <div className="isletme-kart-ust">
                    <span className="isletme-emoji">{kategoriEmoji(isletme.kategori)}</span>
                    <div>
                      <h3>{isletme.isletmeAdi}</h3>
                      <p>{isletme.adres?.il} / {isletme.adres?.ilce}</p>
                    </div>
                    <div className="puan">
                      <div>{yildizGoster(Math.round(isletme.ortalamaPuan || 0))}</div>
                      <span style={{ fontSize: '12px', color: '#999' }}>{isletme.ortalamaPuan || 0} ({isletme.yorumSayisi || 0})</span>
                    </div>
                  </div>
                  <div className="hizmet-listesi">
                    {isletme.hizmetler?.slice(0, 3).map((h, i) => (
                      <div key={i} className="hizmet-satir">
                        <span>{h.ad}</span>
                        <span className="fiyat">{h.fiyat} ₺</span>
                      </div>
                    ))}
                  </div>
                  <div className="calisma-saati">🕐 {isletme.calismaBaslangic} - {isletme.calismaBitis}</div>
                  <button className="btn-primary" style={{ marginTop: '14px' }} onClick={e => modalAc(isletme, e)}>Randevu Al</button>
                  <button className="btn-secondary" style={{ marginTop: '8px' }} onClick={e => yorumModalAc(isletme, e)}>⭐ Yorumlar ({isletme.yorumSayisi || 0})</button>
                </div>
              );
            })}
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
            {randevuBasari ? <div className="basari">✅ {randevuBasari}</div> : (
              <>
                {randevuHata && <div className="hata">{randevuHata}</div>}
                <p className="modal-label">Hizmet Seç (birden fazla seçebilirsin)</p>
                <div className="hizmet-secim">
                  {secilenIsletme.hizmetler.map((h, i) => (
                    <div key={i} className={`hizmet-secim-item ${secilenHizmetler.find(x => x.ad === h.ad) ? 'secili' : ''}`} onClick={() => hizmetToggle(h)}>
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
                    <span>⏱ Toplam: <strong>{toplamSure} dk</strong></span>
                    <span>Toplam: <strong style={{ color: '#E53935' }}>{toplamFiyat} ₺</strong></span>
                  </div>
                )}
                <p className="modal-label">Tarih Seç</p>
                <input type="date" min={bugunTarih} value={secilenTarih} onChange={e => setSecilenTarih(e.target.value)} className="tarih-input" />
                <p className="modal-label">
                  Saat Seç
                  {toplamSure > 0 && secilenSaat && (
                    <span style={{ fontSize: '12px', color: '#999', fontWeight: 'normal', marginLeft: '8px' }}>
                      ({secilenSaat} → {(() => {
                        const [h, d] = secilenSaat.split(':').map(Number);
                        const bitis = h * 60 + d + toplamSure;
                        return `${String(Math.floor(bitis / 60)).padStart(2, '0')}:${String(bitis % 60).padStart(2, '0')}`;
                      })()} arası bloklanacak)
                    </span>
                  )}
                </p>
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
                  {gonderiyor ? 'Gönderiliyor...' : `Randevuyu Onayla${toplamFiyat > 0 ? ` — ${toplamFiyat} ₺` : ''}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* YORUM MODAL */}
      {yorumModal && yorumIsletme && (
        <div className="modal-overlay" onClick={() => setYorumModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⭐ {yorumIsletme.isletmeAdi}</h2>
              <button className="modal-kapat" onClick={() => setYorumModal(false)}>✕</button>
            </div>
            {isletmeRandevulari.length > 0 ? (
              <div className="yorum-yaz">
                <p className="modal-label">Hangi randevu için yorum yapıyorsun?</p>
                <select className="tarih-input" value={secilenRandevu} onChange={e => setSecilenRandevu(e.target.value)}>
                  <option value="">Seç...</option>
                  {isletmeRandevulari.map(r => (
                    <option key={r._id} value={r._id}>{new Date(r.tarih).toLocaleDateString('tr-TR')} - {r.saat}</option>
                  ))}
                </select>
                <p className="modal-label">Puanın</p>
                <div className="yildiz-row">
                  {[1, 2, 3, 4, 5].map(y => (
                    <span key={y} className={`yildiz-tam ${y <= yeniPuan ? 'dolu' : ''}`} onClick={() => setYeniPuan(y)}>★</span>
                  ))}
                  <span style={{ fontSize: '13px', color: '#999', marginLeft: '8px' }}>{yeniPuan}/5</span>
                </div>
                <p className="modal-label">Yorumun</p>
                <textarea className="yorum-textarea" placeholder="Deneyimini paylaş..." value={yeniYorum} onChange={e => setYeniYorum(e.target.value)} rows={3} />
                {yorumHata && <div className="hata">{yorumHata}</div>}
                {yorumBasari && <div className="basari">✅ {yorumBasari}</div>}
                <button className="btn-primary" onClick={yorumGonder}>Yorumu Gönder</button>
              </div>
            ) : (
              <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '13px', color: '#F57F17' }}>
                ⚠️ Yorum yapabilmek için bu işletmede tamamlanmış bir randevunuz olmalı.
              </div>
            )}
            <div style={{ marginTop: '24px' }}>
              <p className="modal-label">Müşteri Yorumları ({yorumlar.length})</p>
              {yorumYukleniyor ? <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Yükleniyor...</div>
                : yorumlar.length === 0 ? <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Henüz yorum yok.</div>
                : yorumlar.map((y, i) => (
                  <div key={i} className="yorum-kart">
                    <div className="yorum-ust">
                      <div className="yorum-avatar">{y.musteri?.ad?.[0]}{y.musteri?.soyad?.[0]}</div>
                      <div>
                        <div className="yorum-isim">{y.musteri?.ad} {y.musteri?.soyad}</div>
                        <div className="yorum-tarih">{new Date(y.tarih).toLocaleDateString('tr-TR')}</div>
                      </div>
                      <div className="yorum-puan">
                        {yildizGoster(y.puan)}
                        <span style={{ fontSize: '12px', color: '#999', marginLeft: '4px' }}>{y.puan}</span>
                      </div>
                    </div>
                    <p className="yorum-metin">{y.yorum}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusteriAnaSayfa;