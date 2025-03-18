import React, { useState } from "react";
import { addPost } from "../../lib/data/Post";
import { getUsers } from "../../lib/data/User";

export default function PostForm() {
    const [content, setContent] = useState("");
  
    // Récupérer l'utilisateur connecté (remplace par l'auth réel si besoin)
    const user = getUsers()[0]; // ⚠️ À changer si tu as un vrai système d'auth
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim()) return;
  
      addPost({
        id: Date.now(),
        pseudo: user.pseudo, // Utiliser le pseudo
        content,
      });
  
      setContent(""); // Vider le champ après publication
      window.dispatchEvent(new Event("storage")); // Rafraîchir le feed
    };
  
    return (
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Quoi de neuf ?"
            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="self-end bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
          >
            Publier
          </button>
        </form>
      </div>
    );
  }