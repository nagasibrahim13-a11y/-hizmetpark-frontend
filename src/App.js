import React, { useState } from 'react';
import Giris from './pages/Giris';
import Kayit from './pages/Kayit';
import MusteriAnaSayfa from './pages/MusteriAnaSayfa';
import IsletmePanel from './pages/IsletmePanel';
import IsletmeProfil from './pages/IsletmeProfil';
import Randevularim from './pages/Randevularim';
import SadakatKartlarim from './pages/SadakatKartlarim';
import './App.css';

function App() {
  const [sayfa, setSayfa] = useState('giris');
  const [kullanici, setKullanici] = useState(null);
  const [profilIsletmeId, setProfilIsletmeId] = useState(null);
  const [hediyeliRandevuData, setHediyeliRandevuData] = useState(null);

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

  const hediyeliRandevuAc = (data) => {
    setHediyeliRandevuData(data);
    setProfilIsletmeId(data.isletme._id);
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
          onRandevularim={() => setSayfa('randevularim')}
          onSadakat={() => setSayfa('sadakat')}
        />
      )}
      {sayfa === 'isletmePanel' && (
        <IsletmePanel kullanici={kullanici} onCikis={cikisYap} />
      )}
      {sayfa === 'isletmeProfil' && (
        <IsletmeProfil
          isletmeId={profilIsletmeId}
          kullanici={kullanici}
          onGeri={() => {
            setHediyeliRandevuData(null);
            setSayfa(hediyeliRandevuData ? 'sadakat' : 'musteriAnaSayfa');
          }}
          hediyeliRandevuData={hediyeliRandevuData}
        />
      )}
      {sayfa === 'randevularim' && (
        <Randevularim
          kullanici={kullanici}
          onGeri={() => setSayfa('musteriAnaSayfa')}
        />
      )}
      {sayfa === 'sadakat' && (
        <SadakatKartlarim
          kullanici={kullanici}
          onGeri={() => setSayfa('musteriAnaSayfa')}
          onHediyeliRandevu={hediyeliRandevuAc}
        />
      )}
    </div>
  );
}

export default App;