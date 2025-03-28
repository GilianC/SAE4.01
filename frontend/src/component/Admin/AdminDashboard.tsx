import React, { useEffect, useState } from "react";
import { getUsers } from "../../lib/data/User"; // Fonction pour récupérer les utilisateurs
import { Link } from "react-router-dom"; // Importation de Link pour la navigation

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers(); // Récupérer les utilisateurs
        setUsers(userList);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    };

    fetchUsers();
  }, []);

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
            <div>
              <Link
                to={`/admin/user/${user.id}`} // Lien vers la page de modification de l'utilisateur
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md transition duration-300"
              >
                Modifier
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;