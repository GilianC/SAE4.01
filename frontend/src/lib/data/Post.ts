export interface Post {
  id: number;
  content: string;
  author: string; // Le pseudo de l'utilisateur qui a posté
  createdAt: string;
}

/**
 * Récupère tous les posts depuis l'API.
 * Lance une erreur si le token n'est pas présent ou si la réponse n'est pas correcte.
 */
export async function getPosts(): Promise<Post[]> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token non trouvé, veuillez vous connecter.");
  }

  const response = await fetch("http://localhost:8080/posts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Le format des données reçues n'est pas un tableau");
  }
  return data;
}

/**
 * Crée un post en envoyant le contenu au backend.
 * Retourne la réponse JSON de l'API.
 */
export async function createPost(content: string): Promise<any> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token non trouvé, veuillez vous connecter.");
  }

  const response = await fetch("http://localhost:8080/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
  }

  return await response.json();
}