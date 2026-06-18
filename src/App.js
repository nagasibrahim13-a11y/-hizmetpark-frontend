import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import GirisModal from './components/GirisModal';
import Kayit from './pages/Kayit';
import MusteriAnaSayfa from './pages/MusteriAnaSayfa';
import IsletmePanel from './pages/IsletmePanel';
import IsletmeProfil from './pages/IsletmeProfil';
import Randevularim from './pages/Randevularim';
import SadakatKartlarim from './pages/SadakatKartlarim';
import Marketplace from './pages/Marketplace';
import './App.css';

function AppRouter() {
  const { kullanici, girisModalAcik, girisGerektir, cikisYap, modalKapat } = useAuth();
  const [sayfa, setSayfa] = useState('anaSayfa');
  const [profilIsletmeId, setProfilIsletmeId] = useState(null);
  const [hediyeliRandevuData, setHediyeliRandevuData] = useState(null);

  // Guard: if user logs out while on a protected page, return to anaSayfa
  useEffect(() => {
    if (!kullanici && ['isletmePanel', 'randevularim', 'sadakat'].includes(sayfa)) {
      setSayfa('anaSayfa');
    }
  }, [kullanici, sayfa]);

  const handleCikis = () => {
    cikisYap();
    setSayfa('anaSayfa');
    setProfilIsletmeId(null);
    setHediyeliRandevuData(null);
  };

  // Called by "Giriş Yap" header button — after login, route based on role
  const handleGirisYapTikla = () => {
    girisGerektir((loggedUser) => {
      if (loggedUser?.rol !== 'musteri') {
        setSayfa('isletmePanel');
      }
      // müşteri stays on anaSayfa
    });
  };

  const handleRandevularimTikla = () => {
    if (kullanici) {
      setSayfa('randevularim');
    } else {
      girisGerektir(() => setSayfa('randevularim'));
    }
  };

  const handleSadakatTikla = () => {
    if (kullanici) {
      setSayfa('sadakat');
    } else {
      girisGerektir(() => setSayfa('sadakat'));
    }
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
      {girisModalAcik && (
        <GirisModal
          onKayitGit={() => {
            modalKapat();
            setSayfa('kayit');
          }}
        />
      )}

      {sayfa === 'kayit' && (
        <Kayit onGirisGit={() => setSayfa('anaSayfa')} />
      )}

      {sayfa === 'anaSayfa' && (
        <MusteriAnaSayfa
          kullanici={kullanici}
          onCikis={handleCikis}
          onGirisYap={handleGirisYapTikla}
          onKayitGit={() => setSayfa('kayit')}
          onProfilAc={profilAc}
          onRandevularim={handleRandevularimTikla}
          onSadakat={handleSadakatTikla}
          onMarketplace={() => setSayfa('marketplace')}
        />
      )}

      {sayfa === 'isletmePanel' && kullanici && (
        <IsletmePanel kullanici={kullanici} onCikis={handleCikis} />
      )}

      {sayfa === 'isletmeProfil' && (
        <IsletmeProfil
          isletmeId={profilIsletmeId}
          kullanici={kullanici}
          onGeri={() => {
            setHediyeliRandevuData(null);
            setSayfa(hediyeliRandevuData ? 'sadakat' : 'anaSayfa');
          }}
          hediyeliRandevuData={hediyeliRandevuData}
        />
      )}

      {sayfa === 'randevularim' && kullanici && (
        <Randevularim
          kullanici={kullanici}
          onGeri={() => setSayfa('anaSayfa')}
        />
      )}

      {sayfa === 'sadakat' && kullanici && (
        <SadakatKartlarim
          kullanici={kullanici}
          onGeri={() => setSayfa('anaSayfa')}
          onHediyeliRandevu={hediyeliRandevuAc}
        />
      )}

      {sayfa === 'marketplace' && (
        <Marketplace onGeri={() => setSayfa('anaSayfa')} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
