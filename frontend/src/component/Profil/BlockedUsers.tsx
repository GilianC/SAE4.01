import React, { useState, useEffect } from 'react';
import { getBlockedUsers, unblockUser } from '../../lib/utils';

interface BlockedUser {
  id: number;
  pseudo: string;
  avatar: string | null;
}

const BlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setLoading(true);
        const response = await getBlockedUsers();
        setBlockedUsers(response);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs bloqués:', error);
        setError('Impossible de charger les utilisateurs bloqués');
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
    } catch (error) {
      console.error('Erreur lors du déblocage:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Chargement des utilisateurs bloqués...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Aucun utilisateur bloqué</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Utilisateurs bloqués</h3>
      <div className="space-y-4">
        {blockedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {user.avatar ? (
                  <img
                    src={`http://localhost:8080/uploads/${user.avatar}`}
                    alt={`Avatar de ${user.pseudo}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {user.pseudo.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
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