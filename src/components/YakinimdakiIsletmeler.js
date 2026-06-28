import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import AcikGunler from './AcikGunler';

// Leaflet varsayılan marker icon sorunu için çözüm
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const maviIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const kirmizi = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function YakinimdakiIsletmeler({ onProfilAc }) {
  const [durum, setDurum] = useState('bekliyor'); // bekliyor | yukleniyor | hazir | hata
  const [konum, setKonum] = useState(null);
  const [isletmeler, setIsletmeler] = useState([]);
  const [kategori, setKategori] = useState('');
  const [siralama, setSiralama] = useState('mesafe');

  // Konum bir kez alınır
  useEffect(() => {
    setDurum('yukleniyor');
    if (!navigator.geolocation) {
      setDurum('hata');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setKonum({ lat, lng });
      },
      () => setDurum('hata')
    );
  }, []);

  // Konum veya kategori değişince yeniden fetch yap
  useEffect(() => {
    if (!konum) return;
    const fetchIsletmeler = async () => {
      try {
        const url = `http://localhost:5000/api/isletmeler/yakinimda?lat=${konum.lat}&lng=${konum.lng}${kategori ? `&kategori=${kategori}` : ''}`;
        const cevap = await fetch(url);
        const veri = await cevap.json();
        setIsletmeler(Array.isArray(veri) ? veri : []);
      } catch {
        setIsletmeler([]);
      }
      setDurum('hazir');
    };
    fetchIsletmeler();
  }, [konum, kategori]);

  if (durum === 'yukleniyor') {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '14px' }}>
        📡 Konum alınıyor...
      </div>
    );
  }

  if (durum === 'hata') {
    return (
      <div style={{
        textAlign: 'center', padding: '32px', background: '#FFF5F5',
        border: '1px solid #FFCDD2', borderRadius: '12px', color: '#C62828', fontSize: '14px'
      }}>
        📵 Konum izni gerekli. Lütfen tarayıcınızdan konum iznini verin.
      </div>
    );
  }

  if (durum !== 'hazir' || !konum) return null;

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {['', 'berber', 'kuafor', 'guzellik', 'halisaha'].map(k => (
          <button
            key={k}
            onClick={() => setKategori(k)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: kategori === k ? 'none' : '1px solid #E2E8F0',
              background: kategori === k ? '#1B1D3A' : 'white',
              color: kategori === k ? 'white' : '#374151',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: kategori === k ? '600' : '400'
            }}
          >
            {k === '' ? '🗺️ Tümü' : k === 'berber' ? '✂️ Berber' : k === 'kuafor' ? '💇 Kuaför' : k === 'guzellik' ? '💅 Güzellik' : '⚽ Halısaha'}
          </button>
        ))}
      </div>

      <div style={{display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap'}}>
        <button
          onClick={() => setSiralama('mesafe')}
          style={{padding:'6px 14px', borderRadius:'20px', border: siralama==='mesafe' ? 'none' : '1px solid #E2E8F0', background: siralama==='mesafe' ? '#4F46E5' : 'white', color: siralama==='mesafe' ? 'white' : '#374151', fontSize:'13px', cursor:'pointer'}}>
          📍 En Yakın
        </button>
        <button
          onClick={() => setSiralama('puan')}
          style={{padding:'6px 14px', borderRadius:'20px', border: siralama==='puan' ? 'none' : '1px solid #E2E8F0', background: siralama==='puan' ? '#4F46E5' : 'white', color: siralama==='puan' ? 'white' : '#374151', fontSize:'13px', cursor:'pointer'}}>
          ⭐ Puanı Yüksek
        </button>
        <button
          onClick={() => setSiralama('populer')}
          style={{padding:'6px 14px', borderRadius:'20px', border: siralama==='populer' ? 'none' : '1px solid #E2E8F0', background: siralama==='populer' ? '#4F46E5' : 'white', color: siralama==='populer' ? 'white' : '#374151', fontSize:'13px', cursor:'pointer'}}>
          🔥 Popüler
        </button>
      </div>

      <MapContainer
        center={[konum.lat, konum.lng]}
        zoom={13}
        style={{ height: '550px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[konum.lat, konum.lng]} icon={maviIcon}>
          <Popup>📍 Konumunuz</Popup>
        </Marker>
        {isletmeler.map((isletme) => {
          const lat = isletme.konum?.coordinates?.[1];
          const lng = isletme.konum?.coordinates?.[0];
          if (!lat || !lng) return null;
          return (
            <Marker key={isletme._id} position={[lat, lng]} icon={kirmizi}>
              <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{isletme.isletmeAdi}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{isletme.kategori}</div>
              </Tooltip>
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                    {isletme.isletmeAdi}
                  </div>
                  {isletme.kategori && (
                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                      🏷 {isletme.kategori}
                    </div>
                  )}
                  {(isletme.adres?.ilce || isletme.adres?.il) && (
                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '10px' }}>
                      📍{' '}
                      {[isletme.adres.ilce, isletme.adres.il].filter(Boolean).join(' / ')}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onProfilAc && onProfilAc(isletme._id)}
                      style={{
                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                        background: '#E85D26', color: '#fff', border: 'none',
                        fontSize: '12px', fontWeight: '600',
                      }}
                    >
                      Profili Gör
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                          '_blank'
                        )
                      }
                      style={{
                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                        background: '#2563EB', color: '#fff', border: 'none',
                        fontSize: '12px', fontWeight: '600',
                      }}
                    >
                      Yol Tarifi Al
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748B' }}>
        {isletmeler.length} işletme bulundu {kategori && `(${kategori})`}
      </div>

      <div style={{marginTop:'20px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'16px'}}>
        {(() => {
          const siraliIsletmeler = [...isletmeler].sort((a, b) => {
            if (siralama === 'puan') return (b.ortalamaPuan || 0) - (a.ortalamaPuan || 0);
            if (siralama === 'populer') return (b.yorumSayisi || 0) - (a.yorumSayisi || 0);
            return (a.mesafeMetre || 0) - (b.mesafeMetre || 0);
          });
          return siraliIsletmeler.map(isl => (
          <div
            key={isl._id}
            style={{
              background:'white',
              border:'1px solid #E2E8F0',
              borderRadius:'14px',
              padding:'14px',
              transition:'box-shadow 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
          >
            <div style={{fontWeight:'700', fontSize:'15px', marginBottom:'4px'}}>{isl.isletmeAdi}</div>
            <div style={{fontSize:'13px', color:'#64748B', marginBottom:'6px'}}>{isl.kategori}</div>
            <div style={{fontSize:'12px', color:'#94A3B8', display:'flex', alignItems:'center', gap:'4px', marginBottom:'4px'}}>
              📍 {isl.adres?.il} / {isl.adres?.ilce}
            </div>
            <AcikGunler gunler={isl.calismaGunleri} />
            {isl.mesafeMetre != null && (
              <div style={{fontSize:'12px', color:'#4F46E5', fontWeight:'600', marginBottom:'6px'}}>
                {isl.mesafeMetre < 1000 ? `${Math.round(isl.mesafeMetre)} m uzaklıkta` : `${(isl.mesafeMetre/1000).toFixed(1)} km uzaklıkta`}
              </div>
            )}
            {isl.ortalamaPuan > 0 && (
              <div style={{fontSize:'13px', color:'#F59E0B', marginBottom:'10px', fontWeight:'600'}}>
                ⭐ {isl.ortalamaPuan} {isl.yorumSayisi > 0 && `(${isl.yorumSayisi} yorum)`}
              </div>
            )}
            <div style={{display:'flex', gap:'8px'}}>
              <button
                onClick={() => onProfilAc && onProfilAc(isl._id)}
                style={{flex:1, padding:'8px', background:'#E85D26', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600'}}>
                Profili Gör
              </button>
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${isl.konum?.coordinates?.[1]},${isl.konum?.coordinates?.[0]}`, '_blank')}
                style={{flex:1, padding:'8px', background:'white', color:'#2563EB', border:'1px solid #2563EB', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600'}}>
                Yol Tarifi
              </button>
            </div>
          </div>
          ));
        })()}
      </div>
    </>
  );
}

export default YakinimdakiIsletmeler;
