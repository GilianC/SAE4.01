import { useNavigate } from "react-router-dom";
import Logo from "../../ui/Logo";
import {Button} from "../../ui/Common/Button"; 
import React from "react";
import { Link } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 flex items-center justify-between w-full py-4 px-6">
      {/* Partie gauche : Logo */}
      <div className="flex items-center">
        <Link to="/auth/profil" className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-700 text-sm">?</span>
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