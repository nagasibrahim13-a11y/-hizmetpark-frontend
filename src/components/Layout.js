import React, { useState, useEffect, useRef } from 'react';
import { Home, Calendar, Gift, MapPin, ShoppingBag, LogOut, Bell, Search, Heart, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';

const Layout = ({ children, kullanici, isletmeId, onAnaSayfa, onIsletmePanel, onRandevularim, onSadakat, onYakinimda, onFavorilerim, onMarketplace, onAyarlar, onGirisYap, onKayitGit, onCikis, onPersonelGiris, aktifSayfa }) => {
  const [bildirimler, setBildirimler] = useState([]);
  const [bildirimPanelAcik, setBildirimPanelAcik] = useState(false);
  const [okunmamisSayi, setOkunmamisSayi] = useState(0);
  const [profilMenuAcik, setProfilMenuAcik] = useState(false);
  const bildirimPanelRef = useRef(null);
  const profilMenuRef = useRef(null);

  const aliciTipi = kullanici?.rol === 'isletme' ? 'isletme' : 'musteri';
  const aliciId = kullanici?.rol === 'isletme' ? isletmeId : kullanici?.id;

  useEffect(() => {
    if (!aliciId) return;
    const veriCek = () => {
      fetch(`http://localhost:5000/api/bildirimler/${aliciTipi}/${aliciId}`)
        .then(r => r.json()).then(data => setBildirimler(data)).catch(err => console.error(err));
      fetch(`http://localhost:5000/api/bildirimler/${aliciTipi}/${aliciId}/okunmamis-sayisi`)
        .then(r => r.json()).then(data => setOkunmamisSayi(data.sayi)).catch(err => console.error(err));
    };
    veriCek();
    const interval = setInterval(veriCek, 30000);
    return () => clearInterval(interval);
  }, [aliciId, aliciTipi]);

  useEffect(() => {
    const disariTikla = (e) => {
      if (bildirimPanelRef.current && !bildirimPanelRef.current.contains(e.target)) setBildirimPanelAcik(false);
      if (profilMenuRef.current && !profilMenuRef.current.contains(e.target)) setProfilMenuAcik(false);
    };
    document.addEventListener('mousedown', disariTikla);
    return () => document.removeEventListener('mousedown', disariTikla);
  }, []);

  const bildirimleriOkunduYap = async () => {
    try {
      await fetch(`http://localhost:5000/api/bildirimler/${aliciTipi}/${aliciId}/tumunu-okundu`, { method: 'PUT' });
      setOkunmamisSayi(0);
      setBildirimler(prev => prev.map(b => ({ ...b, okundu: true })));
    } catch (err) { console.error(err); }
  };

  const menuOgeleri = [
    { key: 'anaSayfa', ikon: Home, etiket: 'Ana Sayfa', onClick: onAnaSayfa, gosterKosulu: true },
    { key: 'isletmePanel', ikon: LayoutDashboard, etiket: 'İşletme Paneli', onClick: onIsletmePanel, gosterKosulu: kullanici?.rol === 'isletme' },
    { key: 'randevularim', ikon: Calendar, etiket: 'Randevularım', onClick: onRandevularim, gosterKosulu: true },
    { key: 'sadakat', ikon: Gift, etiket: 'Sadakat', onClick: onSadakat, gosterKosulu: true },
    { key: 'yakinimda', ikon: MapPin, etiket: 'Yakınımda', onClick: onYakinimda, gosterKosulu: true },
    { key: 'favorilerim', ikon: Heart, etiket: 'Favorilerim', onClick: onFavorilerim, gosterKosulu: true },
    { key: 'marketplace', ikon: ShoppingBag, etiket: 'Marketplace', onClick: onMarketplace, gosterKosulu: true },
  ];

  return (
    <div className="layout-govde">
      <header className="layout-header">
        <div className="layout-logo" onClick={onAnaSayfa} style={{cursor:'pointer', flexShrink:0}}>
          <Calendar size={20} color="#E85D26" />
          <span style={{fontSize:'17px', fontWeight:'800', color:'#1A1A1A'}}>HizmetPark</span>
        </div>

        <div className="layout-arama" style={{maxWidth:'240px'}}>
          <Search size={16} color="#94A3B8" />
          <input placeholder="Ara..." style={{border:'none', outline:'none', background:'transparent', flex:1, fontSize:'13px'}} />
        </div>

        <div style={{position:'relative', marginLeft:'auto'}} ref={bildirimPanelRef}>
          <button className="layout-bildirim" onClick={() => { setBildirimPanelAcik(v => !v); if (!bildirimPanelAcik && okunmamisSayi > 0) bildirimleriOkunduYap(); }}>
            <Bell size={18} />
            {okunmamisSayi > 0 && <span className="layout-bildirim-rozet">{okunmamisSayi}</span>}
          </button>
          {bildirimPanelAcik && (
            <div style={{position:'absolute', top:'44px', right:'0', width:'320px', maxHeight:'400px', overflowY:'auto', background:'white', borderRadius:'14px', boxShadow:'0 10px 40px rgba(0,0,0,0.15)', border:'1px solid #E2E8F0', zIndex:200}}>
              <div style={{padding:'14px 16px', fontWeight:'700', fontSize:'14px', borderBottom:'1px solid #F1F5F9'}}>Bildirimler</div>
              {bildirimler.length === 0 ? (
                <div style={{padding:'30px', textAlign:'center', color:'#94A3B8', fontSize:'13px'}}>Henüz bildirim yok</div>
              ) : (
                bildirimler.map(b => (
                  <div key={b._id} style={{padding:'12px 16px', borderBottom:'1px solid #F8FAFC', background: b.okundu ? 'white' : '#EEF2FF'}}>
                    <div style={{fontWeight:'600', fontSize:'13px', marginBottom:'2px'}}>{b.baslik}</div>
                    <div style={{fontSize:'12px', color:'#64748B'}}>{b.mesaj}</div>
                    <div style={{fontSize:'11px', color:'#94A3B8', marginTop:'4px'}}>{new Date(b.olusturmaTarihi).toLocaleString('tr-TR')}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <nav style={{display:'flex', alignItems:'center', gap:'2px', flexWrap:'nowrap', overflow:'hidden'}}>
          {menuOgeleri.filter(m => m.gosterKosulu).map(m => {
            const Ikon = m.ikon;
            return (
              <button key={m.key} onClick={m.onClick}
                style={{
                  display:'flex', alignItems:'center', gap:'5px',
                  padding:'7px 10px', borderRadius:'8px', border:'none',
                  background: aktifSayfa === m.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: aktifSayfa === m.key ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  fontSize:'12.5px', fontWeight: aktifSayfa === m.key ? '700' : '500',
                  cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s'
                }}>
                <Ikon size={15} />
                {m.etiket}
              </button>
            );
          })}
        </nav>

        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          {kullanici ? (
            <div style={{position:'relative'}} ref={profilMenuRef}>
              <div onClick={() => setProfilMenuAcik(v => !v)} style={{display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', padding:'4px 8px', borderRadius:'10px'}}>
                <div className="layout-avatar" style={{width:'32px', height:'32px', fontSize:'13px'}}>
                  {kullanici.fotograf ? (
                    <img src={kullanici.fotograf} alt="Profil" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} />
                  ) : (
                    kullanici.ad?.[0]?.toUpperCase() || '👤'
                  )}
                </div>
                <span style={{fontSize:'13px', fontWeight:'600', color:'rgba(255,255,255,0.9)'}}>{kullanici.ad}</span>
                <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
              </div>
              {profilMenuAcik && (
                <div style={{position:'absolute', top:'44px', right:'0', width:'200px', background:'white', borderRadius:'12px', boxShadow:'0 10px 40px rgba(0,0,0,0.15)', border:'1px solid #E2E8F0', zIndex:200, overflow:'hidden'}}>
                  <button onClick={() => { onAyarlar(); setProfilMenuAcik(false); }}
                    style={{width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'white', border:'none', cursor:'pointer', fontSize:'13px', color:'#374151', textAlign:'left'}}>
                    <Settings size={16} /> Ayarlar
                  </button>
                  <button onClick={() => { onCikis(); setProfilMenuAcik(false); }}
                    style={{width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'white', border:'none', borderTop:'1px solid #F1F5F9', cursor:'pointer', fontSize:'13px', color:'#EF4444', textAlign:'left'}}>
                    <LogOut size={16} /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={onPersonelGiris} style={{fontSize:'12px', color:'rgba(255,255,255,0.35)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>
                Personel Girişi
              </button>
              <button className="layout-kayit-btn" onClick={onKayitGit}>Kayıt Ol</button>
              <button className="layout-giris-btn" onClick={onGirisYap}>Giriş Yap</button>
            </>
          )}
        </div>
      </header>

      <div className="layout-icerik-tam">
        {children}
      </div>
    </div>
  );
};

export default Layout;
