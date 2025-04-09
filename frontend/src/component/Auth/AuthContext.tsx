import React, { useEffect } from "react";
import { createContext, useContext, useState } from "react";

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Charger les informations de l'utilisateur au démarrage si un token existe
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Email ou mot de passe incorrect.");
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token); // Stocker le token dans le state
      
      // Sauvegarder dans le localStorage pour persister la session
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Connexion réussie :", data.user);
    } catch (error) {
      console.error("Erreur d'authentification :", error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Supprimer du localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};