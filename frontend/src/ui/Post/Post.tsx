import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Post as PostType } from "../../lib/data/Post";
import { postRequest, deleteRequest, blockUser, isUserBlocked } from "../../lib/utils";
import { getUserId } from "../../lib/data/User";
import { CommentSection } from "../Comment/CommentSection";

interface PostCardProps {
  post: PostType;
  onDelete: (id: number) => void;
  onLike: (id: number, liked: boolean, likes: number) => void;
  onEdit?: (post: PostType) => void;
  image: string;
}

export const PostCard = ({ post, onDelete, onLike, onEdit, image }: PostCardProps): React.ReactElement => {
  const [liked, setLiked] = useState(post.liked || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [mediaError, setMediaError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const currentUserId = getUserId();
  const isAuthor = currentUserId !== null && post.authorId !== null && currentUserId === post.authorId;
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  useEffect(() => {
    setLiked(post.liked || false);
    setLikes(post.likes || 0);
  }, [post.liked, post.likes]);
  
  useEffect(() => {
    const checkBlockStatus = async () => {
      try {
        if (!post.authorId) {
          setIsBlocked(false);
          return;
        }
        const blocked = await isUserBlocked(post.authorId);
        setIsBlocked(blocked);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut de blocage:', error);
        setIsBlocked(false);
      }
    };
    checkBlockStatus();
  }, [post.authorId]);
  
  const handleLike = () => {
    onLike(post.id, liked, likes);
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleDelete = () => {
    onDelete(post.id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const isVideo = post.media?.match(/\.(mp4|webm|ogv|mov)$/i);
  const isImage = post.media?.match(/\.(jpe?g|png|gif|webp)$/i);

  const getMediaUrl = (filename: string) => {
    if (filename.startsWith('http')) return filename;
    return `http://localhost:8080/uploads/${filename}`;
  };

  const handleBlock = async () => {
    try {
      await blockUser(post.authorId);
      setIsBlocked(true);
      setShowBlockConfirm(false);
    } catch (error) {
      console.error('Erreur lors du blocage de l\'utilisateur:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-300 p-4 rounded-xl shadow-sm mb-4">
      <div className="flex items-center space-x-3">
        <Link to={`/auth/profil/${post.authorId}`} className="w-10 h-10 rounded-full block">
          {post.avatar ? (
            <img
              src={`http://localhost:8080/uploads/${post.avatar}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default-avatar.jpg";
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-xs">Avatar</span>
            </div>
          )}
        </Link>
        <div>
          <p className="font-bold text-gray-900">@{post.author}</p>
          <p className="text-gray-500 text-sm">{post.createdAt}</p>
        </div>
      </div>
      
      <p className="mt-2 text-gray-800">{post.content}</p>

      {post.media && !mediaError && (
        <div className="mt-3 rounded-lg overflow-hidden">
          {isImage ? (
            <img
              src={getMediaUrl(post.media)}
              alt="Image jointe"
              className="max-h-96 w-full object-contain bg-black"
              onError={() => setMediaError(true)}
              loading="lazy"
            />
          ) : isVideo ? (
            <video
              src={getMediaUrl(post.media)}
              controls
              className="max-h-96 w-full"
              onError={() => setMediaError(true)}
            />
          ) : (
            <div className="bg-gray-100 p-3 rounded text-gray-500">
              Pièce jointe: {post.media}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-3 text-gray-500">
        <button 
          className="flex items-center space-x-1 hover:text-blue-500"
          onClick={toggleComments}
        >
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
        {isAuthor && (
          <>
            <button
              className="flex items-center space-x-1 hover:text-blue-500"
              onClick={handleEdit}
            >
              ✏️ <span>Modifier</span>
            </button>
            <button
              className="flex items-center space-x-1 hover:text-red-500"
              onClick={handleDelete}
            >
              🗑️ <span>Supprimer</span>
            </button>
          </>
        )}
      </div>

      {showComments && (
        <CommentSection postId={post.id} />
      )}

      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          {/* ... existing code ... */}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              {isAuthor ? (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (onEdit) {
                        onEdit(post);
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(post.id);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Supprimer
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowBlockConfirm(true);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Bloquer l'utilisateur
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de blocage */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bloquer l'utilisateur
            </h3>
            <p className="text-gray-500 mb-4">
              Êtes-vous sûr de vouloir bloquer cet utilisateur ? Vous ne verrez plus ses publications.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleBlock}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Bloquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
