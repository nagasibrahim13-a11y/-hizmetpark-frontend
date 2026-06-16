import React, { useState } from 'react';
import Giris from './pages/Giris';
import Kayit from './pages/Kayit';
import MusteriAnaSayfa from './pages/MusteriAnaSayfa';
import IsletmePanel from './pages/IsletmePanel';
import IsletmeProfil from './pages/IsletmeProfil';
import './App.css';

function App() {
  const [sayfa, setSayfa] = useState('giris');
  const [kullanici, setKullanici] = useState(null);
  const [profilIsletmeId, setProfilIsletmeId] = useState(null);

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

  const profilAc = (isletmeId) => {
    setProfilIsletmeId(isletmeId);
    setSayfa('isletmeProfil');
  };

  return (
    <div className="app">
      {sayfa === 'giris' && (
        <Giris onGiris={girisYap} onKayitGit={() => setSayfa('kayit')} />
      )}
      {sayfa === 'kayit' && (
        <Kayit onGirisGit={() => setSayfa('giris')} />
      )}
      {sayfa === 'musteriAnaSayfa' && (
        <MusteriAnaSayfa
          kullanici={kullanici}
          onCikis={cikisYap}
          onProfilAc={profilAc}
        />
      )}
      {sayfa === 'isletmePanel' && (
        <IsletmePanel kullanici={kullanici} onCikis={cikisYap} />
      )}
      {sayfa === 'isletmeProfil' && (
        <IsletmeProfil
          isletmeId={profilIsletmeId}
          kullanici={kullanici}
          onGeri={() => setSayfa('musteriAnaSayfa')}
        />
      )}
    </div>
  );
}

export default App;