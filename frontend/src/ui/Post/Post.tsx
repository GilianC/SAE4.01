import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Post } from "../../lib/data/Post";
import { postRequest, deleteRequest } from "../../lib/utils";

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
  onLike: (id: number, liked: boolean, likes: number) => void;
}

export const PostCard = ({ post, onDelete, onLike }: PostCardProps): React.ReactElement => {
  const [liked, setLiked] = useState(post.liked || false);
  const [likes, setLikes] = useState(post.likes || 0);

  const handleLike = () => {
    onLike(post.id, liked, likes);
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleDelete = () => {
    onDelete(post.id);
  };

  return (
    <div key={post.id} className="bg-white border border-gray-300 p-4 rounded-xl shadow-sm mb-4">
      <div className="flex items-center space-x-3">
        <Link to={`/auth/profil/${post.authorId}`} className="w-10 h-10 rounded-full block">
          {post.avatar ? (
            <img
              src={`http://localhost:8080/assets/${post.avatar}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          )}
        </Link>
        <div>
          <p className="font-bold text-gray-900">@{post.author}</p>
          <p className="text-gray-500 text-sm">{post.createdAt}</p>
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
        <button
          className={`flex items-center space-x-1 ${liked ? "text-red-500" : "hover:text-red-500"}`}
          onClick={handleLike}
        >
          ❤️ <span>{likes} J'aime</span>
        </button>
        <button
          className="flex items-center space-x-1 hover:text-red-500"
          onClick={handleDelete}
        >
          🗑️ <span>Supprimer</span>
        </button>
      </div>
    </div>
  );
};
