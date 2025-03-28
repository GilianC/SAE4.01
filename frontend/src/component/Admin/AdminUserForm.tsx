import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../../lib/data/User"; // Importer la fonction getUserById et updateUser

const AdminUserEdit = () => {
  const { id } = useParams<{ id: string }>(); // Récupérer l'ID de l'utilisateur depuis l'URL
  const [user, setUser] = useState<any | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
    const navigate = useNavigate(); // Pour la navigation
  const [error, setError] = useState<string | null>(null); // Pour gérer les erreurs

  useEffect(() => {
    // Si l'id est disponible, on effectue la requête pour obtenir les informations de l'utilisateur
    if (id) {
      const fetchUser = async () => {
        try {
          const userData = await getUserById(id); // Remplacer par ta fonction pour récupérer l'utilisateur
          setUser(userData);
        } catch (error: any) {
          console.error("Erreur lors de la récupération de l'utilisateur:", error);
          setError("Une erreur est survenue lors de la récupération des données de l'utilisateur.");
        }
      };

      fetchUser();
    } else {
      setError("Aucun ID d'utilisateur fourni.");
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      console.error("L'ID de l'utilisateur est manquant.");
      return;
    }

    try {
      await updateUser(parseInt(id),  email, name ); // Mettre à jour l'utilisateur
      alert("Utilisateur mis à jour !");
      navigate("/admin"); // Rediriger vers le tableau de bord admin
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    }
  };

  return (
    user && (
      <div className="bg-gray-900 text-white min-h-screen p-8">
        <h1 className="text-4xl font-bold text-blue-500 mb-6">Modifier l'utilisateur</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg text-gray-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 p-3 w-full bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-lg text-gray-200">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 p-3 w-full bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            Sauvegarder les modifications
          </button>
        </form>
      </div>
    )
  );
};

export default AdminUserEdit;