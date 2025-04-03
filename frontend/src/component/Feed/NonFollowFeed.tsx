import React, { useEffect, useState } from "react";
import { getRequest, deleteRequest, postRequest } from "../../lib/utils";
import { PostCard } from "../../ui/Post/Post"; // Import du composant PostCard
import { Post } from "../../lib/data/Post";
import { Link } from "react-router-dom";
export default function NonFollowFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    getRequest("/posts")
      .then(setPosts)
      .catch(() => setError("Erreur lors du chargement des posts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = (id: number, liked: boolean, likes: number) => {
    postRequest(`/posts/${id}/like`)
      .then(() => {
        // Met à jour les likes après avoir interagi avec le bouton
        setPosts(posts.map((post) =>
          post.id === id
            ? { ...post, likes: liked ? likes - 1 : likes + 1, liked: !liked }
            : post
        ));
      })
      .catch(() => setError("Erreur lors du like"));
  };

  const handleDelete = (id: number) => {
    deleteRequest(`/posts/${id}`)
      .then(() => {
        setPosts(posts.filter((post) => post.id !== id));
      })
      .catch(() => setError("Erreur de suppression"));
  };

  return (
    <div className="max-w-xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={fetchPosts}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
        >
          🔄 Rafraîchir
        </button>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
            className="cursor-pointer"
          />
          <span>Auto-refresh</span>
        </label>
      </div>

      {posts.map(post => (
        <PostCard  post={post} onLike={handleLike} onDelete={handleDelete} />
      ))}
      <Link
        to="/auth/post"
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