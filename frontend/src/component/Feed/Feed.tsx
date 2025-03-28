import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts, Post } from "../../lib/data/Post";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        console.log("Réponse API :", data);
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-4">
      {/* Header avec Logo Karmine Corp */}
      <div className="p-4 border-b border-gray-300 bg-white flex justify-center items-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 1078 1078"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#1DA1F2">
            {/* Insérez ici le contenu du logo SVG */}
            <path d="M 169.89 37.08 C 218.50 26.96 268.74 27.30 317.88 33.09 C 317.88 84.62 317.89 136.14 317.88 187.67 C 295.33 185.47 272.51 184.98 250.01 187.90 C 221.77 191.56 192.98 201.01 172.11 221.16 C 153.54 238.71 143.82 263.90 141.70 289.03 C 138.64 324.23 146.68 359.33 157.63 392.58 C 167.29 421.45 179.73 449.33 193.50 476.46 C 227.33 542.62 268.71 604.62 312.47 664.56 C 313.90 666.94 316.67 668.93 316.48 671.95 C 316.45 726.04 316.49 780.14 316.46 834.23 C 223.09 747.30 143.64 644.85 86.25 530.74 C 60.86 480.21 38.30 428.08 21.92 373.90 C 9.68 333.15 1.11 291.04 0.00 248.40 L 0.00 237.52 C 0.58 209.76 4.70 181.82 14.83 155.87 C 25.81 127.22 44.42 101.53 68.41 82.38 C 97.62 58.83 133.44 44.78 169.89 37.08 Z" />
          </g>
        </svg>
      </div>

      {/* Affichage des posts */}
      {loading ? (
        <p className="text-center text-gray-500 mt-4">Chargement...</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-4">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">Aucun post pour l'instant.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-300 p-4 rounded-xl shadow-sm mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div>
                <p className="font-bold text-gray-900">@{post.author}</p>
                <p className="text-gray-500 text-sm">il y a 2h</p>
              </div>
            </div>
            <p className="mt-2 text-gray-800">{post.content}</p>
            <div className="flex justify-between mt-3 text-gray-500">
              <button className="flex items-center space-x-1 hover:text-blue-500">
                💬 <span>Commenter</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-green-500">
                🔁 <span>Partager</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-red-500">
                ❤️ <span>J'aime</span>
              </button>
            </div>
          </div>
        ))
      )}

      {/* Floating Button for New Post */}
      <Link
        to="/post"
        className="fixed bottom-16 right-4 bg-[#0D1B2A] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#1B263B] transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-7 h-7"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}