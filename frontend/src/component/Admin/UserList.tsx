import React, { useState, useEffect } from "react";
import { getUsers, User } from "../../lib/data/User";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Utilisateurs enregistrés</h2>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">Aucun utilisateur trouvé.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {users.map((user, index) => (
            <li key={index} className="py-3 flex justify-between items-center">
              <span className="font-semibold">{user.pseudo}</span>
              <span className="text-gray-500">{user.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}