export interface User {
    email: string;
    pseudo: string;
    password: string;
  }
  
  const STORAGE_KEY = "users_db";
  
  // Récupérer les utilisateurs depuis localStorage
  export const getUsers = (): User[] => {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  };
  
  // Ajouter un utilisateur
  export const addUser = (newUser: User): boolean => {
    const users = getUsers();
    if (users.some((user) => user.email === newUser.email)) return false;
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return true;
  };
  
  // Vérifier les identifiants
  export const authenticateUser = (email: string, password: string): User | null => {
    return getUsers().find((user) => user.email === email && user.password === password) || null;
  };