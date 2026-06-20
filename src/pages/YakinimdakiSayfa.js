import React from 'react';
import YakinimdakiIsletmeler from '../components/YakinimdakiIsletmeler';

const YakinimdakiSayfa = ({ onProfilAc }) => {
  return (
    <div style={{ padding: '0' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
        Yakınımdaki İşletmeler
      </h2>
      <p style={{ color: '#64748B', marginBottom: '20px', fontSize: '14px' }}>
        Konumunuza yakın işletmeleri haritada görüntüleyin
      </p>
      <YakinimdakiIsletmeler onProfilAc={onProfilAc} />
    </div>
  );
};

export default YakinimdakiSayfa;
