import React from 'react';

const Marketplace = ({ onGeri }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛍️</div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
          HizmetPark Marketplace
        </h1>
        <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', fontSize: '13px', fontWeight: '700', padding: '6px 18px', borderRadius: '20px', marginBottom: '24px', letterSpacing: '0.05em' }}>
          YAKINDA
        </div>
        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>
          Hizmet sektörüne özel ürünler, ekipmanlar ve malzemeler. Berber malzemeleri, güzellik ürünleri, salon ekipmanları ve daha fazlası yakında burada.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          {[
            { ikon: '✂️', baslik: 'Berber Malzemeleri' },
            { ikon: '💄', baslik: 'Güzellik Ürünleri' },
            { ikon: '🪑', baslik: 'Salon Ekipmanları' },
            { ikon: '🧴', baslik: 'Bakım Ürünleri' },
          ].map(k => (
            <div key={k.baslik} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0', opacity: 0.7 }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{k.ikon}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{k.baslik}</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Yakında</div>
            </div>
          ))}
        </div>
        <button onClick={onGeri} style={{ padding: '12px 28px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          ← Anasayfaya Dön
        </button>
      </div>
    </div>
  );
};

export default Marketplace;
