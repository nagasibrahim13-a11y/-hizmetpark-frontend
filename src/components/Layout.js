import React from 'react';
import { Home, Calendar, Gift, MapPin, Scissors, ShoppingBag, LogOut, Bell, Search, Heart, Settings, LayoutDashboard } from 'lucide-react';

const Layout = ({ children, kullanici, onAnaSayfa, onIsletmePanel, onRandevularim, onSadakat, onYakinimda, onFavorilerim, onMarketplace, onAyarlar, onGirisYap, onKayitGit, onCikis, onPersonelGiris, aktifSayfa }) => {
  return (
    <div className="layout-govde">
      <header className="layout-header">
        <div className="layout-logo" onClick={onAnaSayfa} style={{cursor:'pointer'}}>
          <Calendar size={22} color="#DC2626" />
          <span style={{fontSize:'20px', fontWeight:'800', color:'#4F46E5'}}>HizmetPark</span>
        </div>
        <div className="layout-arama">
          <Search size={18} color="#94A3B8" />
          <input placeholder="Berber, hizmet veya ürün ara..." style={{border:'none', outline:'none', background:'transparent', flex:1, fontSize:'14px'}} />
        </div>
        <div className="layout-sag">
          <button className="layout-bildirim">
            <Bell size={20} />
            <span className="layout-bildirim-rozet">2</span>
          </button>
          {kullanici ? (
            <div className="layout-profil">
              <div className="layout-avatar">
                {kullanici.fotograf ? (
                  <img src={kullanici.fotograf} alt="Profil" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} />
                ) : (
                  kullanici.ad?.[0]?.toUpperCase() || '👤'
                )}
              </div>
              <span style={{fontSize:'14px', fontWeight:'600', color:'#374151'}}>{kullanici.ad}</span>
            </div>
          ) : (
            <>
              <button onClick={onPersonelGiris} style={{fontSize:'12px', color:'#94A3B8', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>
                Personel Girişi
              </button>
              <button className="layout-kayit-btn" onClick={onKayitGit}>Kayıt Ol</button>
              <button className="layout-giris-btn" onClick={onGirisYap}>Giriş Yap</button>
            </>
          )}
        </div>
      </header>

      <div className="layout-ana-govde">
        <div className="layout-sol-menu">
          <div className={`layout-menu-item ${aktifSayfa === 'anaSayfa' ? 'aktif' : ''}`} onClick={onAnaSayfa}>
            <Home size={18} /><span>Ana Sayfa</span>
          </div>
          {kullanici?.rol === 'isletme' && (
            <div className={`layout-menu-item ${aktifSayfa === 'isletmePanel' ? 'aktif' : ''}`} onClick={onIsletmePanel}>
              <LayoutDashboard size={18} /><span>İşletme Paneli</span>
            </div>
          )}
          <div className={`layout-menu-item ${aktifSayfa === 'randevularim' ? 'aktif' : ''}`} onClick={onRandevularim}>
            <Calendar size={18} /><span>Randevularım</span>
          </div>
          <div className={`layout-menu-item ${aktifSayfa === 'sadakat' ? 'aktif' : ''}`} onClick={onSadakat}>
            <Gift size={18} /><span>Sadakat Programı</span>
          </div>
          <div className={`layout-menu-item ${aktifSayfa === 'yakinimda' ? 'aktif' : ''}`} onClick={onYakinimda}>
            <MapPin size={18} /><span>Yakınımdaki İşletmeler</span>
          </div>
          <div className={`layout-menu-item ${aktifSayfa === 'favorilerim' ? 'aktif' : ''}`} onClick={onFavorilerim}>
            <Heart size={18} /><span>Favorilerim</span>
          </div>

          <div className={`layout-menu-item ${aktifSayfa === 'marketplace' ? 'aktif' : ''}`} onClick={onMarketplace}>
            <ShoppingBag size={18} /><span>Marketplace</span>
          </div>
          {kullanici && (
            <>
              <div className={`layout-menu-item ${aktifSayfa === 'ayarlar' ? 'aktif' : ''}`} onClick={onAyarlar}>
                <Settings size={18} /><span>Ayarlar</span>
              </div>
              <div className="layout-menu-item layout-cikis" onClick={onCikis} style={{marginTop:'auto'}}>
                <LogOut size={18} /><span>Çıkış Yap</span>
              </div>
            </>
          )}
        </div>
        <div className="layout-icerik">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
