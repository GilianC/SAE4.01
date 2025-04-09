import React, { useState, useEffect } from 'react';
import { blockUser, isUserBlocked } from '../../lib/utils';

interface BlockButtonProps {
  userId: number;
  onBlockChange: (blocked: boolean) => void;
}

const BlockButton = ({ userId, onBlockChange }: BlockButtonProps) => {
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBlockStatus = async () => {
      try {
        const response = await isUserBlocked(userId);
        setBlocked(response.blocked);
        onBlockChange(response.blocked);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut de blocage:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBlockStatus();
  }, [userId, onBlockChange]);

  const handleBlock = async () => {
    try {
      setLoading(true);
      await blockUser(userId);
      setBlocked(!blocked);
      onBlockChange(!blocked);
    } catch (error) {
      console.error('Erreur lors du blocage/déblocage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button 
        className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
        disabled
      >
        Chargement...
      </button>
    );
  }

  return (
    <button
      onClick={handleBlock}
      className={`${
        blocked 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-red-500 hover:bg-red-600'
      } text-white px-4 py-2 rounded-md`}
    >
      {blocked ? 'Débloquer' : 'Bloquer'}
    </button>
  );
};

export default BlockButton; 