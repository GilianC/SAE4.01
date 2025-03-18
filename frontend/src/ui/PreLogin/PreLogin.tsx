import React from "react";
import { Link } from "react-router-dom";

export default function PreLogin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Conteneur principal */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        {/* Logo Twitter */}
       
        {/* Texte d'accueil */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Bienvenue sur Twitter
        </h1>
        <p className="text-gray-600 mb-4">Rejoignez-nous dès maintenant !</p>

        {/* Bouton de Connexion */}
        <Link
          to="/login"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mb-3"
        >
          Se connecter
        </Link>

        {/* Bouton d'Inscription */}
        <Link
          to="/register"
          className="block w-full border border-blue-500 text-blue-500 font-bold py-2 px-4 rounded-lg hover:bg-blue-500 hover:text-white transition duration-200"
        >
          S'inscrire
        </Link>
      </div>
    </div>
  );
}