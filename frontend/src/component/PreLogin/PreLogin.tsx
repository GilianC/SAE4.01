import React from "react";
import { Link } from "react-router-dom";
import {Button} from "../../ui/Common/Button";
export default function PreLogin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center ">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Bienvenue sur Twitter
        </h1>
        <p className="text-gray-600 mb-4">Rejoignez-nous dès maintenant !</p>
        <div className="flex flex-col gap-4">
          <Link to="/login">
        <Button 
          type="submit" 
          variant="primary" 
          width="full" 
          size="lg" 
          font="normal" 
          rounded="full" 
        >
          Login
        </Button>
          </Link>
          <Link to="/register">
        <Button 
          type="submit" 
          variant="white" 
          width="full" 
          size="lg" 
          font="normal" 
          rounded="full"
        >
          Sign In
        </Button>
          </Link>
        </div>
      </div>
    </div>
  );}