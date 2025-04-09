import { clsx } from "clsx";
export function cn(...inputs) {
  return clsx(inputs);
}

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
export function getRequest(url) {
  const token = localStorage.getItem("token");
  return fetch(`http://localhost:8080${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Erreur HTTP " + response.status);
    }
    return response.json();
  });
}

const API_URL = 'http://localhost:8080';
export const postRequest = async (url, data) => {
  const token = localStorage.getItem("token");
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

    throw error;
  }
};
export const deleteRequest = async (url) => {
  const response = await fetch(`http://localhost:8080${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Suppression échouée");
  }
  return response.json();
};

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const token = localStorage.getItem("token");
    const fetchOptions = {
      method: "POST",
      body: formData,
    };
    if (token) {
      fetchOptions.headers = {
        "Authorization": `Bearer ${token}`
      };
    }
    const baseUrl = "http://localhost:8080";
    const response = await fetch(`${baseUrl}/upload`, fetchOptions);
    if (response.ok) {
      const data = await response.json();      
      if (data.filename) {
        return data.filename;
      } else if (data.url) {
        return data.url.split('/').pop();
      } else {
        return data; 
      }
    } else {
      console.error("Erreur de réponse HTTP:", response.status);

      const fakeFilename = `mock-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

      return fakeFilename;
    }
  } catch (error) {


    const fakeFilename = `mock-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

    return fakeFilename;
  }
}

export async function putRequest(endpoint, data)  {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('Envoi de la requête PUT:', {
    endpoint,
    headers,
    data
  });

  const response = await fetch(`http://localhost:8080${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur de réponse:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Réponse reçue:', responseData);
  return responseData;
};

export const blockUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/block`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Erreur lors du blocage de l\'utilisateur');
  }

  return response.json();
};

export const getBlockedUsers = async () => {
  const response = await fetch(`${API_URL}/users/blocked`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs bloqués');
  }

  return response.json();
};

export const isUserBlocked = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/is-blocked`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la vérification du statut de blocage');
  }

  return response.json();
};

export const unblockUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/unblock`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Erreur lors du déblocage de l\'utilisateur');
  }
}; 