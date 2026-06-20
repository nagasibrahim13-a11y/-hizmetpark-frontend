import React, { useState } from 'react';

const PersonelGiris = ({ onGirisBasarili, onGeri }) => {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const girisYap = async () => {
    if (!kullaniciAdi || !sifre) {
      setHata('Kullanıcı adı ve şifre giriniz');
      return;
    }
    setYukleniyor(true);
    setHata('');
    try {
      const cevap = await fetch('http://localhost:5000/api/isletmeler/personel-giris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kullaniciAdi, sifre })
      });
      const veri = await cevap.json();
      if (!cevap.ok) {
        setHata(veri.hata || 'Giriş başarısız');
      } else {
        onGirisBasarili(veri);
      }
    } catch (err) {
      setHata('Sunucuya bağlanılamadı');
    }
    setYukleniyor(false);
  };

  return (
    <div style={{minHeight:'100vh', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <div style={{background:'white', borderRadius:'20px', padding:'40px', width:'100%', maxWidth:'400px', boxShadow:'0 10px 40px rgba(0,0,0,0.08)'}}>
        <div style={{textAlign:'center', marginBottom:'28px'}}>
          <div style={{fontSize:'40px', marginBottom:'8px'}}>👤</div>
          <h2 style={{fontSize:'22px', fontWeight:'800', color:'#0F172A', margin:0}}>Personel Girişi</h2>
          <p style={{color:'#64748B', fontSize:'13px', marginTop:'6px'}}>İşletmenizin size verdiği bilgilerle giriş yapın</p>
        </div>

        <div style={{marginBottom:'14px'}}>
          <label style={{fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>KULLANICI ADI</label>
          <input value={kullaniciAdi} onChange={e => setKullaniciAdi(e.target.value)}
            style={{width:'100%', padding:'12px 14px', borderRadius:'10px', border:'1px solid #E2E8F0', fontSize:'14px'}} />
        </div>

        <div style={{marginBottom:'20px'}}>
          <label style={{fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>ŞİFRE</label>
          <input type="password" value={sifre} onChange={e => setSifre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && girisYap()}
            style={{width:'100%', padding:'12px 14px', borderRadius:'10px', border:'1px solid #E2E8F0', fontSize:'14px'}} />
        </div>

        {hata && (
          <div style={{background:'#FEE2E2', color:'#991B1B', padding:'10px 14px', borderRadius:'10px', fontSize:'13px', marginBottom:'16px'}}>
            {hata}
          </div>
        )}

        <button onClick={girisYap} disabled={yukleniyor}
          style={{width:'100%', padding:'13px', background:'#4F46E5', color:'white', border:'none', borderRadius:'12px', fontWeight:'600', fontSize:'15px', cursor:'pointer'}}>
          {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>

        <button onClick={onGeri}
          style={{width:'100%', padding:'10px', background:'none', color:'#64748B', border:'none', fontSize:'13px', cursor:'pointer', marginTop:'12px'}}>
          ← Anasayfaya Dön
        </button>
      </div>
    </div>
  );
};

export default PersonelGiris;
