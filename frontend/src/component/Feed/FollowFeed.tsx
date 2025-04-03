import React , { useEffect, useState } from "react";
import { getRequest, deleteRequest, postRequest } from "../../lib/utils";
import { PostCard } from "../../ui/Post/Post";
import { Post } from "../../lib/data/Post";
import { Link } from "react-router-dom";

export default function FollowFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchFollowedPosts = () => {
    setLoading(true);
    getRequest("/post/followed")
      .then(setPosts)
      .catch(() => setError("Erreur lors du chargement des posts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFollowedPosts();
  }, []);

  const handleLike = (id: number, liked: boolean, likes: number) => {
    postRequest(`/posts/${id}/like`)
      .then(() => {
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
          onClick={fetchFollowedPosts}
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

      {/* Affichage des posts */}
      {loading ? (
        <p className="text-center text-gray-500 mt-4">Chargement...</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-4">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">Aucun post de vos abonnements.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={handleDelete}
            onLike={handleLike}
          />
        ))
      )}
      
      {/* Floating Button for New Post */}
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