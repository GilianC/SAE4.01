
// fake a cache so we don't slow down stuff we've already seen
let fakeCache = {};

export async function fakeNetwork(key) {
  if (!key) {
    fakeCache = {};
  }

  if (fakeCache[key]) {
    return;
  }

  fakeCache[key] = true;
  return new Promise(res => {
    setTimeout(res, Math.random() * 3000);
  });
}
export const getRequest = async (url) => {
  const response = await fetch(`http://localhost:8080${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Tu peux ajouter ici un en-tête d'autorisation si nécessaire, par exemple :
      // 'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
const API_URL = "http://localhost:8080";
export const postRequest = async (url, data) => {
  const token = localStorage.getItem("token"); // Si tu as un token stocké
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData; 
  } catch (error) {
    console.error("Erreur dans postRequest:", error);
    throw error;
  }
};
