import React from 'react';

const AcikGunler = ({ gunler }) => {
  const kisaltmalar = { 'Pazartesi':'Pzt', 'Salı':'Sal', 'Çarşamba':'Çar', 'Perşembe':'Per', 'Cuma':'Cum', 'Cumartesi':'Cmt', 'Pazar':'Paz' };
  const tumGunler = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];

  if (!gunler || gunler.length === 0) return null;

  return (
    <div style={{display:'flex', gap:'3px', marginTop:'6px', marginBottom:'2px'}}>
      {tumGunler.map(gun => {
        const acik = gunler.includes(gun);
        return (
          <span key={gun} style={{
            fontSize:'10px',
            fontWeight:'600',
            width:'22px',
            textAlign:'center',
            padding:'2px 0',
            borderRadius:'4px',
            background: acik ? '#D1FAE5' : '#F1F5F9',
            color: acik ? '#065F46' : '#94A3B8'
          }}>
            {kisaltmalar[gun]}
          </span>
        );
      })}
    </div>
  );
};

export default AcikGunler;
