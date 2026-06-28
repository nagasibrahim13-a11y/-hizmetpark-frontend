import React, { useState, useEffect } from 'react';
import AcikGunler from '../components/AcikGunler';
import { sessizKonumAl, mesafeHesapla } from '../utils/mesafe';
import MesafeGoster from '../components/MesafeGoster';

const Favorilerim = ({ kullanici, onProfilAc }) => {
  const [favoriler, setFavoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullaniciKonumu, setKullaniciKonumu] = useState(null);

  useEffect(() => {
    sessizKonumAl().then(konum => { if (konum) setKullaniciKonumu(konum); });
  }, []);

  useEffect(() => {
    if (!kullanici) return;
    fetch(`http://localhost:5000/api/kullanicilar/${kullanici.id}/favoriler`)
      .then(r => r.json())
      .then(data => { setFavoriler(data); setYukleniyor(false); })
      .catch(() => setYukleniyor(false));
  }, [kullanici]);

  const favoridenÇıkar = async (e, isletmeId) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:5000/api/kullanicilar/${kullanici.id}/favori/${isletmeId}`, { method: 'PUT' });
      setFavoriler(prev => prev.filter(f => f._id !== isletmeId));
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h2 style={{fontSize:'24px', fontWeight:'800', color:'#0F172A', marginBottom:'4px'}}>Favorilerim</h2>
      <p style={{color:'#64748B', marginBottom:'20px', fontSize:'14px'}}>Beğendiğin işletmeler burada</p>

      {yukleniyor ? (
        <div style={{textAlign:'center', padding:'40px', color:'#94A3B8'}}>Yükleniyor...</div>
      ) : favoriler.length === 0 ? (
        <div style={{textAlign:'center', padding:'60px 20px', color:'#94A3B8'}}>
          <div style={{fontSize:'48px', marginBottom:'12px'}}>🤍</div>
          Henüz favori işletmen yok
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'16px'}}>
          {favoriler.map(isl => (
            <div key={isl._id} onClick={() => onProfilAc(isl._id)}
              style={{background:'white', border:'1px solid #E2E8F0', borderRadius:'16px', overflow:'hidden', cursor:'pointer', position:'relative'}}>

              <div style={{width:'100%', height:'160px', background:'linear-gradient(135deg, #EEF2FF, #E0E7FF)', position:'relative'}}>
                {isl.fotograf ? (
                  <img src={isl.fotograf} alt={isl.isletmeAdi} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', opacity:0.3}}>🏪</div>
                )}
                <button
                  onClick={(e) => favoridenÇıkar(e, isl._id)}
                  style={{position:'absolute', top:'12px', right:'12px', background:'white', border:'none', borderRadius:'50%', width:'34px', height:'34px', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px'}}>
                  ❤️
                </button>
              </div>

              <div style={{padding:'16px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px'}}>
                  <h3 style={{fontSize:'16px', fontWeight:'700', margin:0}}>{isl.isletmeAdi}</h3>
                  {isl.ortalamaPuan > 0 && (
                    <span style={{fontSize:'13px', color:'#F59E0B', fontWeight:'600', whiteSpace:'nowrap'}}>⭐ {isl.ortalamaPuan}</span>
                  )}
                </div>
                <div style={{fontSize:'13px', color:'#64748B', marginBottom:'4px'}}>{isl.hizmetler?.[0]?.ad || isl.kategori}</div>
                <div style={{fontSize:'12px', color:'#94A3B8', marginBottom:'4px'}}>📍 {isl.adres?.il} / {isl.adres?.ilce}</div>
                <AcikGunler gunler={isl.calismaGunleri} />
                {kullaniciKonumu && isl.konum?.coordinates && (
                  <MesafeGoster mesafeMetre={mesafeHesapla(
                    kullaniciKonumu.lat, kullaniciKonumu.lng,
                    isl.konum.coordinates[1], isl.konum.coordinates[0]
                  )} />
                )}

                {isl.hizmetler?.slice(0,3).map((h, i) => (
                  <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'4px 0', color:'#374151'}}>
                    <span>{h.ad}</span>
                    <span style={{fontWeight:'700', color:'#E85D26'}}>{h.fiyat} ₺</span>
                  </div>
                ))}

                <button
                  onClick={(e) => { e.stopPropagation(); onProfilAc(isl._id); }}
                  style={{width:'100%', marginTop:'12px', padding:'10px', background:'#E85D26', color:'white', border:'none', borderRadius:'10px', fontWeight:'600', fontSize:'14px', cursor:'pointer'}}>
                  Randevu Al
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorilerim;
