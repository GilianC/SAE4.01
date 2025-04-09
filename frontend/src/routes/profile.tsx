import React from 'react';
import { useParams } from 'react-router-dom';
import Profil from '../component/Profil/Profil';

export default function ProfilePage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <Profil />
    </div>
  );
}