import React, { createContext, useContext, useRef, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [kullanici, setKullanici] = useState(null);
  const [girisModalAcik, setGirisModalAcik] = useState(false);

  // useRef used instead of useState to avoid stale closure issues
  // when pendingAction captures internal component state setters
  const bekleyenAksiyonRef = useRef(null);

  const girisGerektir = (aksiyon) => {
    bekleyenAksiyonRef.current = aksiyon;
    setGirisModalAcik(true);
  };

  const girisYap = (kullaniciBilgisi) => {
    setKullanici(kullaniciBilgisi);
    setGirisModalAcik(false);
    const aksiyon = bekleyenAksiyonRef.current;
    bekleyenAksiyonRef.current = null;
    if (aksiyon) {
      aksiyon(kullaniciBilgisi);
    }
  };

  const cikisYap = () => {
    setKullanici(null);
    bekleyenAksiyonRef.current = null;
  };

  const modalKapat = () => {
    setGirisModalAcik(false);
    bekleyenAksiyonRef.current = null;
  };

  return (
    <AuthContext.Provider value={{ kullanici, girisModalAcik, girisGerektir, girisYap, cikisYap, modalKapat }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
