// İki koordinat arası mesafeyi km cinsinden hesaplar (Haversine formülü)
export const mesafeHesapla = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Dünya yarıçapı km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // metre cinsinden döndür
};

// Önceden konum izni verilmişse sessizce konumu al, yoksa null döner
export const sessizKonumAl = () => {
  return new Promise((resolve) => {
    if (!navigator.permissions || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 3000 }
        );
      } else {
        resolve(null);
      }
    }).catch(() => resolve(null));
  });
};
