import React from 'react';

const MesafeGoster = ({ mesafeMetre }) => {
  if (mesafeMetre == null) return null;
  const metin = mesafeMetre < 1000 ? `${Math.round(mesafeMetre)} m uzaklıkta` : `${(mesafeMetre/1000).toFixed(1)} km uzaklıkta`;
  return (
    <div style={{fontSize:'12px', color:'#4F46E5', fontWeight:'600', marginTop:'2px'}}>
      📍 {metin}
    </div>
  );
};

export default MesafeGoster;
