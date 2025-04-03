// src/component/Post/Post.tsx
import React, { useState } from "react";
import { createPost } from "../../lib/data/Post";
import { useNavigate } from "react-router-dom";

export default function PostForm() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await createPost(content);
      setSuccessMessage("Post créé avec succès !");
      // Vous pouvez rediriger ou rafraîchir la page si nécessaire
      navigate("/auth/home"); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mx-auto p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrivez votre post (max 280 caractères)..."
        maxLength={280}
        className="w-full px-4 py-2 border rounded-lg"
      />
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <button
        type="submit"
        className="bg-[#0D1B2A] text-white px-4 py-2 rounded-full hover:bg-[#1B263B] transition-all"
      >
        Publier
      </button>
    </form>
  );
}