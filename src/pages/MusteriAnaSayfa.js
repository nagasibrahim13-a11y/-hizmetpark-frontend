import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import YakinimdakiIsletmeler from '../components/YakinimdakiIsletmeler';
import { Scissors, Sparkles, Heart, CircleDot, Store } from 'lucide-react';
import AcikGunler from '../components/AcikGunler';
import { sessizKonumAl, mesafeHesapla } from '../utils/mesafe';
import MesafeGoster from '../components/MesafeGoster';
import './MusteriAnaSayfa.css';

function MusteriAnaSayfa({ kullanici, onCikis, onGirisYap, onKayitGit, onProfilAc, onRandevularim, onSadakat, onMarketplace }) {
  const { girisGerektir } = useAuth();
  const [dropdownAcik, setDropdownAcik] = useState(false);
  const [favoriler, setFavoriler] = useState(new Set());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const kapat = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAcik(false);
      }
    };
    document.addEventListener('mousedown', kapat);
    return () => document.removeEventListener('mousedown', kapat);
  }, []);

  useEffect(() => {
    sessizKonumAl().then(konum => { if (konum) setKullaniciKonumu(konum); });
  }, []);

  const [isletmeler, setIsletmeler] = useState([]);
  const [filtreliIsletmeler, setFiltreliIsletmeler] = useState([]);
  const [kategori, setKategori] = useState('');
  const [aramaMetni, setAramaMetni] = useState('');
  const [sehir, setSehir] = useState('');
  const [siralama, setSiralama] = useState('varsayilan');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullaniciKonumu, setKullaniciKonumu] = useState(null);
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
  const [haritaGoster, setHaritaGoster] = useState(false);
  const [sliderReklamlar, setSliderReklamlar] = useState([]);
  const [sponsorluReklamlar, setSponsorluReklamlar] = useState([]);
  const [oneCikanReklamlar, setOneCikanReklamlar] = useState([]);
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
    reklamlariGetir();
  }, []);

  useEffect(() => {
    if (kullanici) {
      tamamlananRandevulariGetir();
    } else {
      setTamamlananRandevular([]);
    }
  }, [kullanici]);

  useEffect(() => {
    filtreUygula();
  }, [isletmeler, kategori, aramaMetni, sehir, siralama]);

  useEffect(() => {
    if (sliderReklamlar.length <= 1) return;
    const id = setInterval(() => {
      setSliderIndex(i => (i + 1) % sliderReklamlar.length);
    }, 4000);
    return () => clearInterval(id);
  }, [sliderReklamlar]);

  useEffect(() => {
    if (!kullanici) return;
    fetch(`http://localhost:5000/api/kullanicilar/${kullanici.id}/favoriler`)
      .then(r => r.json())
      .then(data => setFavoriler(new Set(data.map(f => f._id))))
      .catch(err => console.error(err));
  }, [kullanici]);

  const favoriToggle = async (e, isletmeId) => {
    e.stopPropagation();
    if (!kullanici) return;
    setFavoriler(prev => {
      const yeni = new Set(prev);
      if (yeni.has(isletmeId)) yeni.delete(isletmeId);
      else yeni.add(isletmeId);
      return yeni;
    });
    try {
      await fetch(`http://localhost:5000/api/kullanicilar/${kullanici.id}/favori/${isletmeId}`, { method: 'PUT' });
    } catch (err) { console.error(err); }
  };

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
      setOneCikanReklamlar(veri.filter(r => r.tip === 'one_cikma'));
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
    sonuc.sort((a, b) => {
      const aPremium = a.premium?.aktif ? 1 : 0;
      const bPremium = b.premium?.aktif ? 1 : 0;
      return bPremium - aPremium;
    });
    setFiltreliIsletmeler(sonuc);
  };

  const tamamlananRandevulariGetir = async () => {
    if (!kullanici) return;
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
        setRandevuBasari(`✅ Randevunuz onaylandı! ${secilenSaat} - ${toplamSure} dk. Sizi bekliyoruz!`);
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

  const modalAc = async (isletme, e) => {
    e.stopPropagation();
    if (!kullanici) {
      girisGerektir(() => {
        setSecilenIsletme(isletme);
        setRandevuModal(true);
        setRandevuBasari('');
        setRandevuHata('');
        setSecilenHizmetler([]);
        setSecilenSaat('');
        setSecilenTarih('');
      });
      return;
    }
    // Taze veri çek — kapaliTarihler güncel olsun
    try {
      const cevap = await fetch(`http://localhost:5000/api/isletmeler/${isletme._id}`);
      const taze = await cevap.json();
      setSecilenIsletme(taze);
    } catch {
      setSecilenIsletme(isletme);
    }
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

  const KategoriIkon = ({ kat, size = 20, color = '#DC2626' }) => {
    if (kat === 'berber') return <Scissors size={size} color={color} />;
    if (kat === 'kuafor') return <Sparkles size={size} color={color} />;
    if (kat === 'guzellik') return <Heart size={size} color={color} />;
    return <CircleDot size={size} color={color} />;
  };

  const kapaliBilgi = secilenTarih && secilenIsletme?.kapaliTarihler?.length > 0
    ? secilenIsletme.kapaliTarihler.find(kt => {
        const ktTarih = new Date(kt.tarih).toISOString().split('T')[0];
        return ktTarih === secilenTarih;
      }) || null
    : null;

  return (
    <div className="musteri-sayfa">


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
              <>
                <button className="slider-ok slider-ok-sol" onClick={e => { e.stopPropagation(); setSliderIndex(i => i === 0 ? sliderReklamlar.length - 1 : i - 1); }}>‹</button>
                <button className="slider-ok slider-ok-sag" onClick={e => { e.stopPropagation(); setSliderIndex(i => (i + 1) % sliderReklamlar.length); }}>›</button>
                <div className="slider-noktalar">
                  {sliderReklamlar.map((_, i) => (
                    <div key={i} className={`slider-nokta ${i === sliderIndex ? 'aktif' : ''}`}
                      onClick={e => { e.stopPropagation(); setSliderIndex(i); }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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

        {/* YAKINIMDAKİ İŞLETMELER */}
        <div style={{ margin: '16px 0' }}>
          <button
            onClick={() => setHaritaGoster(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: haritaGoster ? '#DC2626' : '#fff',
              color: haritaGoster ? '#fff' : '#DC2626', border: '2px solid #DC2626',
              borderRadius: '8px', fontWeight: '600', fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            📍 Yakınımdaki İşletmeleri {haritaGoster ? 'Gizle' : 'Göster'}
          </button>
          {haritaGoster && (
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px' }}>
                Yakınımdaki İşletmeler
              </h3>
              <YakinimdakiIsletmeler onProfilAc={onProfilAc} />
            </div>
          )}
        </div>

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
                      <span className="mini-kart-kucuk-emoji"><KategoriIkon kat={isletme.kategori} size={28} /></span>
                      <div className="mini-kart-kucuk-isim">{isletme.isletmeAdi}</div>
                      <div className="mini-kart-kucuk-yorum">{isletme.yorumSayisi} yorum</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ÖNE ÇIKAN REKLAMLAR */}
        {oneCikanReklamlar.length > 0 && (
          <div className="one-cikma-reklamlar">
            {oneCikanReklamlar.map(r => (
              <div key={r._id} className="one-cikma-kart" onClick={() => { fetch(`http://localhost:5000/api/reklamlar/${r._id}/tikla`, {method:'PUT'}); onProfilAc(r.isletme._id); }}>
                <span className="one-cikma-badge">⭐ ÖNE ÇIKAN</span>
                <span className="one-cikma-isletme">{r.isletme?.isletmeAdi}</span>
                <span className="one-cikma-baslik">{r.baslik}</span>
              </div>
            ))}
          </div>
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
                      <KategoriIkon kat={isletme.kategori} size={18} />
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
                <div key={isletme._id} className="isletme-kart" onClick={() => onProfilAc(isletme._id)}>
                  <div className="isletme-kart-foto">
                    {isletme.fotograf ? (
                      <img src={isletme.fotograf} alt={isletme.isletmeAdi} />
                    ) : (
                      <div className="isletme-kart-foto-placeholder">
                        <KategoriIkon kat={isletme.kategori} size={40} color="#C7D2FE" />
                      </div>
                    )}
                  </div>
                  <button
                    className="favori-btn"
                    onClick={(e) => favoriToggle(e, isletme._id)}
                  >
                    {favoriler.has(isletme._id) ? '❤️' : '🤍'}
                  </button>
                  <div className="isletme-kart-icerik">
                  {/* Üst: İsim + Puan (mockup gibi) */}
                  <div className="isletme-kart-baslik">
                    <h3>{isletme.isletmeAdi}{isletme.premium?.aktif && (
                      <span style={{background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', fontSize:'10px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', marginLeft:'8px', verticalAlign:'middle', whiteSpace:'nowrap', display:'inline-block'}}>
                        Premium
                      </span>
                    )}</h3>
                    <div className="isletme-kart-puan-inline">
                      <span style={{ color: '#F59E0B' }}>★</span>
                      <span>{isletme.ortalamaPuan > 0 ? isletme.ortalamaPuan : '—'}</span>
                    </div>
                  </div>

                  {/* Slogan veya ilk hizmet adı */}
                  <div className="isletme-kart-slogan">
                    {isletme.slogan || isletme.hizmetler?.[0]?.ad || ''}
                  </div>

                  {/* Konum */}
                  <div className="isletme-kart-konum">
                    <span>📍</span>
                    <span>{isletme.adres?.il} / {isletme.adres?.ilce}</span>
                  </div>
                  <AcikGunler gunler={isletme.calismaGunleri} />
                  {kullaniciKonumu && isletme.konum?.coordinates && (
                    <MesafeGoster mesafeMetre={mesafeHesapla(
                      kullaniciKonumu.lat, kullaniciKonumu.lng,
                      isletme.konum.coordinates[1], isletme.konum.coordinates[0]
                    )} />
                  )}

                  {/* Hizmetler (compact list) */}
                  <div className="hizmet-listesi">
                    {isletme.hizmetler?.slice(0, 3).map((h, i) => (
                      <div key={i} className="hizmet-satir">
                        <span>{h.ad}</span>
                        <span className="fiyat">{h.fiyat} ₺</span>
                      </div>
                    ))}
                  </div>

                  <div className="calisma-saati">🕐 {isletme.calismaBaslangic} - {isletme.calismaBitis}</div>

                  <button className="btn-primary" style={{ marginTop: '14px' }} onClick={(e) => { e.stopPropagation(); onProfilAc(isletme._id); }}>
                    Randevu Al
                  </button>
                  <button className="btn-secondary" style={{ marginTop: '8px' }} onClick={e => yorumModalAc(isletme, e)}>
                    ⭐ Yorumlar ({isletme.yorumSayisi || 0})
                  </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {(
        <div className="ozel-firsatlar-panel">
          <div className="ozel-firsatlar-baslik">⚡ Öne Çıkan Fırsatlar</div>
          {oneCikanReklamlar.slice(0, 3).map(r => (
            <div key={r._id} className="ozel-firsat-kart" onClick={() => { fetch(`http://localhost:5000/api/reklamlar/${r._id}/tikla`, {method:'PUT'}); onProfilAc(r.isletme._id); }}>
              <div className="ozel-firsat-isletme">{r.isletme?.isletmeAdi}</div>
              <div className="ozel-firsat-baslik">{r.baslik}</div>
              <button className="ozel-firsat-buton">İncele</button>
            </div>
          ))}
          {oneCikanReklamlar.length === 0 && (
            <div style={{fontSize:'13px', color:'#94A3B8', textAlign:'center', padding:'12px 0'}}>Şu an fırsat yok</div>
          )}
          <div style={{marginTop:'16px', paddingTop:'16px', borderTop:'1px solid #F1F5F9'}}>
            <div style={{display:'flex', alignItems:'center', gap:'6px', fontWeight:'700', fontSize:'13px', marginBottom:'10px'}}>
              📅 {new Date().toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' })}
            </div>
            <div style={{fontSize:'24px', fontWeight:'800', color:'#4F46E5', marginBottom:'12px'}}>
              {new Date().toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })}
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px'}}>
              {['Pt','Sa','Ça','Pe','Cu','Ct','Pa'].map(g => (
                <div key={g} style={{fontSize:'10px', color:'#94A3B8', textAlign:'center', fontWeight:'600'}}>{g}</div>
              ))}
              {Array.from({length: 30}).map((_, i) => {
                const gun = i + 1;
                const bugun = new Date().getDate() === gun;
                return (
                  <div key={i} style={{
                    fontSize:'11px',
                    textAlign:'center',
                    padding:'4px 0',
                    borderRadius:'6px',
                    background: bugun ? '#4F46E5' : 'transparent',
                    color: bugun ? 'white' : '#374151',
                    fontWeight: bugun ? '700' : '400'
                  }}>
                    {gun}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RANDEVU MODAL */}
      {randevuModal && secilenIsletme && (
        <div className="modal-overlay" onClick={() => setRandevuModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{secilenIsletme.isletmeAdi}</h2>
              <button className="modal-kapat" onClick={() => setRandevuModal(false)}>✕</button>
            </div>
            {randevuBasari ? (
              <div className="basari" style={{ background: '#FFF8E1', color: '#E65100', border: '1px solid #FFE082' }}>
                ⏳ {randevuBasari}
              </div>
            ) : (
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
                <input
                  type="date"
                  min={bugunTarih}
                  value={secilenTarih}
                  onChange={e => { setSecilenTarih(e.target.value); setSecilenSaat(''); }}
                  className="tarih-input"
                />
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
                    const isKapali = kapaliBilgi?.tumGun || (!kapaliBilgi?.tumGun && kapaliBilgi?.saatler?.includes(s));
                    return (
                      <button
                        key={s}
                        className={`saat-btn ${secilenSaat === s ? 'secili' : ''} ${isDolu || isKapali ? 'dolu' : ''}`}
                        onClick={() => !isDolu && !isKapali && setSecilenSaat(s)}
                        disabled={isDolu || isKapali}
                      >
                        {isKapali ? '🚫' : isDolu ? '🔒' : s}
                      </button>
                    );
                  })}
                </div>
                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={randevuAl} disabled={gonderiyor || !!kapaliBilgi?.tumGun}>
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
            {!kullanici ? (
              <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '13px', color: '#4338CA' }}>
                ℹ️ Yorum yazmak için{' '}
                <span style={{ fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setYorumModal(false); onGirisYap(); }}>
                  giriş yapın
                </span>
              </div>
            ) : isletmeRandevulari.length > 0 ? (
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
      <div className="mobil-alt-nav">
        <button className="mobil-nav-item aktif" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <span className="mobil-nav-ikon">🏠</span>
          <span className="mobil-nav-etiket">Ana Sayfa</span>
        </button>
        <button className="mobil-nav-item" onClick={() => { setHaritaGoster(v => !v); }}>
          <span className="mobil-nav-ikon">📍</span>
          <span className="mobil-nav-etiket">Yakınımda</span>
        </button>
        <button className="mobil-nav-item" onClick={onRandevularim}>
          <span className="mobil-nav-ikon">📅</span>
          <span className="mobil-nav-etiket">Randevularım</span>
        </button>
        <button className="mobil-nav-item" onClick={() => kullanici ? setDropdownAcik(v => !v) : onGirisYap()}>
          <span className="mobil-nav-ikon">👤</span>
          <span className="mobil-nav-etiket">Profil</span>
        </button>
      </div>
    </div>
  );
}

export default MusteriAnaSayfa;