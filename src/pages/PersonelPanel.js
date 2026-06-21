import React, { useState, useEffect } from 'react';

const PersonelPanel = ({ personel, onCikis }) => {
  const [veri, setVeri] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [bildirimler, setBildirimler] = useState([]);
  const [bildirimPanelAcik, setBildirimPanelAcik] = useState(false);
  const [okunmamisSayi, setOkunmamisSayi] = useState(0);

  useEffect(() => {
    if (!personel?.personelId) return;
    fetch(`http://localhost:5000/api/randevular/personel/${personel.personelId}`)
      .then(r => r.json())
      .then(data => { setVeri(data); setYukleniyor(false); })
      .catch(() => setYukleniyor(false));
  }, [personel]);

  useEffect(() => {
    if (!personel?.personelId) return;
    const veriCek = () => {
      fetch(`http://localhost:5000/api/bildirimler/personel/${personel.personelId}`)
        .then(r => r.json())
        .then(data => setBildirimler(data))
        .catch(err => console.error(err));
      fetch(`http://localhost:5000/api/bildirimler/personel/${personel.personelId}/okunmamis-sayisi`)
        .then(r => r.json())
        .then(data => setOkunmamisSayi(data.sayi))
        .catch(err => console.error(err));
    };
    veriCek();
    const interval = setInterval(veriCek, 30000);
    return () => clearInterval(interval);
  }, [personel]);

  const bildirimleriOkunduYap = async () => {
    try {
      await fetch(`http://localhost:5000/api/bildirimler/personel/${personel.personelId}/tumunu-okundu`, { method: 'PUT' });
      setOkunmamisSayi(0);
      setBildirimler(prev => prev.map(b => ({ ...b, okundu: true })));
    } catch (err) { console.error(err); }
  };

  const durumLabel = (durum) => {
    if (durum === 'onaylandi') return '✅ Onaylandı';
    if (durum === 'tamamlandi') return '🏁 Tamamlandı';
    if (durum === 'iptal') return '🚫 İptal';
    return durum;
  };

  return (
    <div style={{minHeight:'100vh', background:'#F8FAFC'}}>
      <header style={{background:'white', borderBottom:'1px solid #E2E8F0', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontWeight:'800', fontSize:'18px', color:'#0F172A'}}>👤 {personel.ad}</div>
          <div style={{fontSize:'13px', color:'#64748B'}}>{personel.unvan} · {personel.isletmeAdi}</div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{position:'relative'}}>
            <button onClick={() => { setBildirimPanelAcik(v => !v); if (!bildirimPanelAcik && okunmamisSayi > 0) bildirimleriOkunduYap(); }}
              style={{position:'relative', background:'#F1F5F9', border:'none', borderRadius:'10px', width:'38px', height:'38px', cursor:'pointer', fontSize:'16px'}}>
              🔔
              {okunmamisSayi > 0 && (
                <span style={{position:'absolute', top:'-2px', right:'-2px', background:'#EF4444', color:'white', fontSize:'10px', fontWeight:'700', width:'16px', height:'16px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {okunmamisSayi}
                </span>
              )}
            </button>
            {bildirimPanelAcik && (
              <div style={{position:'absolute', top:'46px', right:'0', width:'300px', maxHeight:'380px', overflowY:'auto', background:'white', borderRadius:'14px', boxShadow:'0 10px 40px rgba(0,0,0,0.15)', border:'1px solid #E2E8F0', zIndex:200}}>
                <div style={{padding:'14px 16px', fontWeight:'700', fontSize:'14px', borderBottom:'1px solid #F1F5F9'}}>Bildirimler</div>
                {bildirimler.length === 0 ? (
                  <div style={{padding:'30px', textAlign:'center', color:'#94A3B8', fontSize:'13px'}}>Henüz bildirim yok</div>
                ) : (
                  bildirimler.map(b => (
                    <div key={b._id} style={{padding:'12px 16px', borderBottom:'1px solid #F8FAFC', background: b.okundu ? 'white' : '#EEF2FF'}}>
                      <div style={{fontWeight:'600', fontSize:'13px'}}>{b.baslik}</div>
                      <div style={{fontSize:'12px', color:'#64748B'}}>{b.mesaj}</div>
                      <div style={{fontSize:'11px', color:'#94A3B8', marginTop:'4px'}}>{new Date(b.olusturmaTarihi).toLocaleString('tr-TR')}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button onClick={onCikis} style={{padding:'8px 18px', background:'white', border:'1px solid #EF4444', color:'#EF4444', borderRadius:'10px', fontWeight:'600', cursor:'pointer', fontSize:'13px'}}>
            Çıkış Yap
          </button>
        </div>
      </header>

      <div style={{padding:'24px', maxWidth:'1000px', margin:'0 auto'}}>
        {yukleniyor ? (
          <div style={{textAlign:'center', padding:'60px', color:'#94A3B8'}}>Yükleniyor...</div>
        ) : veri ? (
          <>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px'}}>
              {[
                {baslik:'Toplam Randevu', deger: veri.ozet.toplamRandevu, renk:'#4F46E5'},
                {baslik:'Onaylanan', deger: veri.ozet.onaylanan, renk:'#3B82F6'},
                {baslik:'Tamamlanan', deger: veri.ozet.tamamlanan, renk:'#10B981'},
                {baslik:'Toplam Ciro', deger: `${veri.ozet.toplamCiro}₺`, renk:'#F59E0B'},
              ].map(k => (
                <div key={k.baslik} style={{background:'white', borderRadius:'14px', padding:'18px', border:'1px solid #E2E8F0', textAlign:'center'}}>
                  <div style={{fontSize:'24px', fontWeight:'800', color:k.renk}}>{k.deger}</div>
                  <div style={{fontSize:'13px', color:'#64748B', marginTop:'4px'}}>{k.baslik}</div>
                </div>
              ))}
            </div>

            <div style={{background:'white', borderRadius:'16px', padding:'20px', border:'1px solid #E2E8F0'}}>
              <h3 style={{marginBottom:'16px', fontSize:'16px'}}>📅 Randevularım</h3>
              {veri.randevular.length === 0 ? (
                <div style={{textAlign:'center', color:'#94A3B8', padding:'30px'}}>Henüz randevun yok</div>
              ) : (
                veri.randevular.map(r => {
                  const hizmetler = Array.isArray(r.hizmet) ? r.hizmet.map(h => h.ad).join(', ') : r.hizmet?.ad;
                  const tutar = Array.isArray(r.hizmet) ? r.hizmet.reduce((t,h) => t+(h.fiyat||0), 0) : (r.hizmet?.fiyat || 0);
                  return (
                    <div key={r._id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #F1F5F9'}}>
                      <div>
                        <div style={{fontWeight:'600', fontSize:'14px'}}>{r.musteri ? `${r.musteri.ad} ${r.musteri.soyad}` : (r.musteriAdi || 'Müşteri')}</div>
                        <div style={{fontSize:'13px', color:'#64748B'}}>{hizmetler} · {new Date(r.tarih).toLocaleDateString('tr-TR')} {r.saat}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'13px', fontWeight:'600'}}>{durumLabel(r.durum)}</div>
                        <div style={{fontSize:'13px', color:'#10B981', fontWeight:'700'}}>{tutar}₺</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div style={{textAlign:'center', padding:'60px', color:'#94A3B8'}}>Veri yüklenemedi</div>
        )}
      </div>
    </div>
  );
};

export default PersonelPanel;
