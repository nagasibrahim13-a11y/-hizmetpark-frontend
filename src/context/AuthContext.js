import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'hp_token';
const API = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [kullanici, setKullanici] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [girisModalAcik, setGirisModalAcik] = useState(false);
  // true only when there's a saved token to validate — prevents rendering with null kullanici
  const [yukleniyor, setYukleniyor] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  // useRef used instead of useState to avoid stale closure issues
  // when pendingAction captures internal component state setters
  const bekleyenAksiyonRef = useRef(null);

  useEffect(() => {
    const kaydedilenToken = localStorage.getItem(TOKEN_KEY);
    if (!kaydedilenToken) return;

    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${kaydedilenToken}` },
    })
      .then(cevap => {
        if (!cevap.ok) throw new Error('gecersiz');
        return cevap.json();
      })
      .then(veri => setKullanici(veri.kullanici))
      .catch(() => {
        // Süresi dolmuş veya geçersiz token — temizle
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setYukleniyor(false));
  }, []);

  const girisGerektir = (aksiyon) => {
    bekleyenAksiyonRef.current = aksiyon;
    setGirisModalAcik(true);
  };

  const girisYap = (kullaniciBilgisi, yeniToken) => {
    setKullanici(kullaniciBilgisi);
    if (yeniToken) {
      setToken(yeniToken);
      localStorage.setItem(TOKEN_KEY, yeniToken);
    }
    setGirisModalAcik(false);
    const aksiyon = bekleyenAksiyonRef.current;
    bekleyenAksiyonRef.current = null;
    if (aksiyon) {
      aksiyon(kullaniciBilgisi);
    }
  };

  const cikisYap = () => {
    setKullanici(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    bekleyenAksiyonRef.current = null;
  };

  const modalKapat = () => {
    setGirisModalAcik(false);
    bekleyenAksiyonRef.current = null;
  };

  // Returns headers object with Authorization + Content-Type for authenticated requests
  const authHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  return (
    <AuthContext.Provider value={{ kullanici, token, girisModalAcik, yukleniyor, girisGerektir, girisYap, cikisYap, modalKapat, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
