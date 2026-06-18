import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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

  useEffect(() => {
    setDurum('yukleniyor');
    if (!navigator.geolocation) {
      setDurum('hata');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setKonum({ lat, lng });
        try {
          const cevap = await fetch(
            `http://localhost:5000/api/isletmeler/yakinimda?lat=${lat}&lng=${lng}`
          );
          const veri = await cevap.json();
          setIsletmeler(Array.isArray(veri) ? veri : []);
        } catch {
          setIsletmeler([]);
        }
        setDurum('hazir');
      },
      () => setDurum('hata')
    );
  }, []);

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
    <MapContainer
      center={[konum.lat, konum.lng]}
      zoom={13}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
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
                      background: '#DC2626', color: '#fff', border: 'none',
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
  );
}

export default YakinimdakiIsletmeler;
