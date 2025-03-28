

import React, { useState } from "react";
import { postRequest } from "../../lib/utils"; // Import de la fonction postRequest

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = await postRequest("/login", form);
      if (data && data.token) {
        localStorage.setItem("token", data.token); // Sauvegarder le token dans localStorage
        // Vérifier si l'utilisateur est un admin ou non, et rediriger en fonction
        if (data.user && data.user.roles.includes('ROLE_ADMIN')) {

          window.location.href = "/admin"; 
        } else {

          window.location.href = "/feed"; // Page d'accueil des utilisateurs
        }
      } else {
        alert("Connexion échouée !");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Mot de passe"
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;