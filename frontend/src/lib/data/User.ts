import { getRequest } from "../utils";

export interface User {
  id: number;
  email: string;
  pseudo: string;
  roles: string[];
  apiToken?: string;
}

/**
 * Effectue la connexion de l'utilisateur en envoyant l'email et le mot de passe.
 * Si la connexion est réussie, le token est stocké dans le localStorage et l'objet utilisateur est retourné.
 */
export async function login(email: string, password: string): Promise<User> {
  const response = await fetch("http://localhost:8080/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
  } else {
    throw new Error("Token non renvoyé par l'API.");
  }

  return data.user;
}
export function getUsers(): Promise<User[]> {
  return fetch("http://localhost:8080/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return response.json();
    });
}

export const getUserId = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
      try {
          const user = JSON.parse(userData);
          return user.id;
      } catch (error) {
          console.error('Erreur lors de la lecture des données utilisateur:', error);
          return null;
      }
  }
  return null;
};

export const getUserAvatar = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    return user.avatar;
  }
  return null;
};
/**
 * Met à jour un utilisateur.
 * @param id L'ID de l'utilisateur à mettre à jour
 * @param email Le nouvel email
 * @param pseudo Le nouveau pseudo
 */
export async function updateUser(id: number, email: string, pseudo: string): Promise<any> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token non trouvé, veuillez vous connecter.");
  }
  const response = await fetch(`http://localhost:8080/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ email, pseudo }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
  }
  return await response.json();
}
/**
 * Fonction pour effectuer une requête POST vers l'API.
 * @param url L'URL de l'API
 * @param data Les données à envoyer
 * @returns La réponse JSON de l'API
 */


export const getUserById = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/${id}`);
    
    // Vérifie si la réponse est correcte (status 200-299)
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};
export const toggleUserBlock = async (id: number) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:8080/user/${id}/toggle-block`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erreur API:", errorText);
    throw new Error("Erreur lors du blocage/déblocage de l'utilisateur.");
  }

  return await response.json();
}