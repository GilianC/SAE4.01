import React, { useEffect, useState } from "react";
import { getUsers, toggleUserBlock } from "../../lib/data/User"; 
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId: number) => {
    try {
      await toggleUserBlock(userId);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user
      ));
    } catch (error) {
      console.error("Erreur lors du blocage:", error);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">Dashboard Admin</h1>
      <h2 className="text-xl text-gray-300 mb-6">Liste des utilisateurs</h2>

      <ul className="space-y-4">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex justify-between items-center p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out"
          >
            <div className="text-lg font-medium text-gray-200">{user.email}</div>
            <div className="flex space-x-4">
              <Link
                to={`/auth/admin/user/${user.id}`}
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md transition duration-300"
              >
                Modifier
              </Link>
              <button
                onClick={() => handleToggleBlock(user.id)}
                className={`py-2 px-4 rounded-md transition duration-300 ${
                  user.isBlocked ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"
                }`}
              >
                {user.isBlocked ? "Débloquer" : "Bloquer"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;