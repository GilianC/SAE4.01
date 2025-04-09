import { useNavigate } from "react-router-dom";
import Logo from "../../ui/Logo";
import {Button} from "../../ui/Common/Button"; 
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserId } from "../../lib/data/User";

const Navbar = () => {
  const navigate = useNavigate();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserAvatar(user.avatar);
      } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userId = getUserId();
  return (
    <nav className="bg-gray-800 flex items-center justify-between w-full py-4 px-6">
      {/* Partie gauche : Avatar */}
      <div className="flex items-center">
        <Link to={`/auth/profil/${userId}`} className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700 text-sm">?</span>
            </div>
          )}
        </Link>
      </div>
      
      {/* Logo centré */}
      <Link to="/auth/home">
        <Logo />
      </Link>

      {/* Partie droite : Déconnexion */}
      <div className="flex items-center">
        <Button
          type="button"
          onClick={handleLogout}
          variant="primary"
          width="auto"
          size="md"
          font="normal"
          rounded="full"
        >
          Déconnexion
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;