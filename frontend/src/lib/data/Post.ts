export interface Post {
    id: number;
    pseudo: string; // Afficher uniquement le pseudo
    content: string;
  }
  
  const STORAGE_KEY = "posts_db";
  
  // Récupérer les posts
  export const getPosts = (): Post[] => {
    const posts = localStorage.getItem(STORAGE_KEY);
    return posts ? JSON.parse(posts) : [];
  };
  
  // Ajouter un post
  export const addPost = (newPost: Post): void => {
    const posts = getPosts();
    posts.unshift(newPost); // Ajout en haut du fil
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  };