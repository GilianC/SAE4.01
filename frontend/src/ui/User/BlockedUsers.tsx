import React, { useState, useEffect } from 'react';
import { getBlockedUsers, unblockUser } from '../../lib/utils';

interface BlockedUser {
  id: number;
  pseudo: string;
  avatar: string;
}

const BlockedUsers: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const users = await getBlockedUsers();
        setBlockedUsers(users);
      } catch (err) {
        setError('Erreur lors du chargement des utilisateurs bloqués');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (userId: number) => {
    try {
      await unblockUser(userId);
      setBlockedUsers(users => users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Erreur lors du déblocage:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        {error}
      </div>
    );
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">
        Vous n'avez bloqué aucun utilisateur
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Utilisateurs bloqués</h2>
      <div className="space-y-2">
        {blockedUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.pseudo}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium">{user.pseudo}</span>
            </div>
            <button
              onClick={() => handleUnblock(user.id)}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Débloquer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockedUsers; 