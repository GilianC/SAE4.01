export interface Post {
  id: number;
  content: string;
  author: string; 
  authorId: number; 
  avatar: string; 
  createdAt: string;
  likes: number; 
  liked?: boolean; 
  media?: string;
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


  return data.map((post: any) => ({
    ...post,
    likes: Number(post.likes) || 0, 
  }));
}

/**
 * Crée un post en envoyant le contenu et éventuellement un média au backend.
 * Retourne la réponse JSON de l'API.
 */
export async function createPost(content: string, mediaFile?: File): Promise<any> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token non trouvé, veuillez vous connecter.");
  }
  let mediaFilename = null;
  if (mediaFile) {
    try {
      const formData = new FormData();
      formData.append("file", mediaFile);
      
      const uploadResponse = await fetch("http://localhost:8080/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Erreur d'upload: ${uploadResponse.status}`);
      }
      
      const uploadData = await uploadResponse.json();
      mediaFilename = uploadData.filename || (uploadData.url ? uploadData.url.split('/').pop() : uploadData);
    } catch (error) {
      throw new Error("Impossible d'uploader le média. Veuillez réessayer.");
    }
  }
  const postData: any = { content };
  if (mediaFilename) {
    postData.media = mediaFilename;
  }

  const response = await fetch("http://localhost:8080/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
