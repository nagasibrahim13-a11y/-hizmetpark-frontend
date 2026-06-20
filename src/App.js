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
import YakinimdakiSayfa from './pages/YakinimdakiSayfa';
import Favorilerim from './pages/Favorilerim';
import Ayarlar from './pages/Ayarlar';
import PersonelGiris from './pages/PersonelGiris';
import PersonelPanel from './pages/PersonelPanel';
import Layout from './components/Layout';
import './components/Layout.css';
import './App.css';

function AppRouter() {
  const { kullanici, girisModalAcik, girisGerektir, girisYap, cikisYap, modalKapat } = useAuth();
  const [sayfa, setSayfa] = useState('anaSayfa');
  const [profilIsletmeId, setProfilIsletmeId] = useState(null);
  const [personelBilgisi, setPersonelBilgisi] = useState(null);
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

  const layoutProps = {
    kullanici,
    onAnaSayfa: () => setSayfa('anaSayfa'),
    onRandevularim: handleRandevularimTikla,
    onSadakat: handleSadakatTikla,
    onYakinimda: () => setSayfa('yakinimda'),
    onIsletmePanel: () => setSayfa('isletmePanel'),
    onFavorilerim: () => setSayfa('favorilerim'),
    onAyarlar: () => setSayfa('ayarlar'),
    onMarketplace: () => setSayfa('marketplace'),
    onGirisYap: handleGirisYapTikla,
    onKayitGit: () => setSayfa('kayit'),
    onPersonelGiris: () => setSayfa('personelGiris'),
    onCikis: handleCikis,
    aktifSayfa: sayfa
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

      {sayfa === 'personelGiris' && (
        <PersonelGiris
          onGirisBasarili={(veri) => { setPersonelBilgisi(veri); setSayfa('personelPanel'); }}
          onGeri={() => setSayfa('anaSayfa')}
        />
      )}
      {sayfa === 'personelPanel' && personelBilgisi && (
        <PersonelPanel
          personel={personelBilgisi}
          onCikis={() => { setPersonelBilgisi(null); setSayfa('anaSayfa'); }}
        />
      )}

      {sayfa === 'anaSayfa' && (
        <Layout {...layoutProps}>
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
        </Layout>
      )}

      {sayfa === 'isletmePanel' && kullanici && (
        <Layout {...layoutProps}>
          <IsletmePanel kullanici={kullanici} onCikis={handleCikis} />
        </Layout>
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
        <Layout {...layoutProps}>
          <Randevularim
            kullanici={kullanici}
            onGeri={() => setSayfa('anaSayfa')}
          />
        </Layout>
      )}

      {sayfa === 'sadakat' && kullanici && (
        <Layout {...layoutProps}>
          <SadakatKartlarim
            kullanici={kullanici}
            onGeri={() => setSayfa('anaSayfa')}
            onHediyeliRandevu={hediyeliRandevuAc}
          />
        </Layout>
      )}

      {sayfa === 'marketplace' && (
        <Layout {...layoutProps}>
          <Marketplace onGeri={() => setSayfa('anaSayfa')} />
        </Layout>
      )}

      {sayfa === 'yakinimda' && (
        <Layout {...layoutProps}>
          <YakinimdakiSayfa onProfilAc={profilAc} />
        </Layout>
      )}

      {sayfa === 'favorilerim' && (
        <Layout {...layoutProps}>
          <Favorilerim kullanici={kullanici} onProfilAc={profilAc} />
        </Layout>
      )}

      {sayfa === 'ayarlar' && (
        <Layout {...layoutProps}>
          <Ayarlar kullanici={kullanici} onGuncelle={girisYap} />
        </Layout>
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
