import React, { useState } from 'react';
import Giris from './pages/Giris';
import Kayit from './pages/Kayit';
import MusteriAnaSayfa from './pages/MusteriAnaSayfa';
import IsletmePanel from './pages/IsletmePanel';
import './App.css';

function App() {
  const [sayfa, setSayfa] = useState('giris');
  const [kullanici, setKullanici] = useState(null);

  const girisYap = (kullaniciData) => {
    setKullanici(kullaniciData);
    if (kullaniciData.rol === 'musteri') {
      setSayfa('musteriAnaSayfa');
    } else {
      setSayfa('isletmePanel');
    }
  };

  const cikisYap = () => {
    setKullanici(null);
    setSayfa('giris');
  };

  return (
    <div className="app">
      {sayfa === 'giris' && (
        <Giris
          onGiris={girisYap}
          onKayitGit={() => setSayfa('kayit')}
        />
      )}
      {sayfa === 'kayit' && (
        <Kayit
          onKayit={girisYap}
          onGirisGit={() => setSayfa('giris')}
        />
      )}
      {sayfa === 'musteriAnaSayfa' && (
        <MusteriAnaSayfa
          kullanici={kullanici}
          onCikis={cikisYap}
        />
      )}
      {sayfa === 'isletmePanel' && (
        <IsletmePanel
          kullanici={kullanici}
          onCikis={cikisYap}
        />
      )}
    </div>
  );
}

export default App;