import React, { useState } from 'react';

const Ayarlar = ({ kullanici, onGuncelle }) => {
  const [form, setForm] = useState({
    ad: kullanici?.ad || '',
    soyad: kullanici?.soyad || '',
    telefon: kullanici?.telefon || '',
    fotograf: kullanici?.fotograf || ''
  });
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [basari, setBasari] = useState('');

  const fotografYukle = (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    if (dosya.size > 2 * 1024 * 1024) { alert('Fotoğraf 2MB\'dan küçük olmalı'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, fotograf: reader.result }));
    reader.readAsDataURL(dosya);
  };

  const kaydet = async () => {
    setKaydediliyor(true);
    try {
      const cevap = await fetch(`http://localhost:5000/api/kullanicilar/${kullanici.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const veri = await cevap.json();
      if (cevap.ok) {
        setBasari('Profil güncellendi!');
        if (onGuncelle) onGuncelle(veri);
        setTimeout(() => setBasari(''), 2000);
      }
    } catch (err) { console.error(err); }
    setKaydediliyor(false);
  };

  return (
    <div style={{maxWidth:'600px'}}>
      <h2 style={{fontSize:'24px', fontWeight:'800', color:'#0F172A', marginBottom:'4px'}}>Ayarlar</h2>
      <p style={{color:'#64748B', marginBottom:'24px', fontSize:'14px'}}>Profil bilgilerini düzenle</p>

      <div style={{background:'white', border:'1px solid #E2E8F0', borderRadius:'16px', padding:'24px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px'}}>
          <div style={{width:'72px', height:'72px', borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            {form.fotograf ? (
              <img src={form.fotograf} alt="Profil" style={{width:'100%', height:'100%', objectFit:'cover'}} />
            ) : (
              <span style={{color:'white', fontSize:'28px', fontWeight:'700'}}>{form.ad?.[0]?.toUpperCase() || '👤'}</span>
            )}
          </div>
          <div>
            <input type="file" accept="image/*" id="profil-foto-input" style={{display:'none'}} onChange={fotografYukle} />
            <label htmlFor="profil-foto-input" style={{padding:'8px 16px', background:'#F1F5F9', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'inline-block'}}>
              📷 Fotoğraf Yükle
            </label>
            <div style={{fontSize:'11px', color:'#94A3B8', marginTop:'4px'}}>Max 2MB</div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
          <div>
            <label style={{fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>AD</label>
            <input value={form.ad} onChange={e => setForm({...form, ad: e.target.value})}
              style={{width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid #E2E8F0', fontSize:'14px'}} />
          </div>
          <div>
            <label style={{fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>SOYAD</label>
            <input value={form.soyad} onChange={e => setForm({...form, soyad: e.target.value})}
              style={{width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid #E2E8F0', fontSize:'14px'}} />
          </div>
        </div>

        <div style={{marginBottom:'20px'}}>
          <label style={{fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>TELEFON</label>
          <input value={form.telefon} onChange={e => setForm({...form, telefon: e.target.value})}
            style={{width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid #E2E8F0', fontSize:'14px'}} />
        </div>

        {basari && (
          <div style={{background:'#D1FAE5', color:'#065F46', padding:'10px 14px', borderRadius:'10px', fontSize:'13px', marginBottom:'16px'}}>
            ✓ {basari}
          </div>
        )}

        <button onClick={kaydet} disabled={kaydediliyor}
          style={{padding:'12px 28px', background:'#4F46E5', color:'white', border:'none', borderRadius:'10px', fontWeight:'600', fontSize:'14px', cursor:'pointer'}}>
          {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
};

export default Ayarlar;
