import React, { useState, useEffect } from 'react';
import { getRequest, postRequest, deleteRequest } from '../../lib/utils';
import { getUserId } from '../../lib/data/User';

interface Comment {
  id: number;
  content: string;
  author: string;
  authorId: number;
  avatar: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await getRequest(`/posts/${postId}/comments`);
      setComments(data);
    } catch (err) {
      setError('Erreur lors du chargement des commentaires');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const comment = await postRequest(`/posts/${postId}/comments`, {
        content: newComment.trim()
      });
      setComments([...comments, comment]);
      setNewComment('');
      setIsReplying(false);
    } catch (err) {
      setError('Erreur lors de l\'ajout du commentaire');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteRequest(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      setError('Erreur lors de la suppression du commentaire');
    }
  };

  const currentUserId = getUserId();

  return (
    <div className="mt-4">
      {!isReplying ? (
        <button
          onClick={() => setIsReplying(true)}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          Répondre
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded resize-none"
            rows={3}
            placeholder="Votre réponse..."
            maxLength={280}
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setIsReplying(false);
                setNewComment('');
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading || !newComment.trim()}
            >
              {loading ? 'Envoi...' : 'Répondre'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 mt-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <img
                src={comment.avatar ? `http://localhost:8080/uploads/${comment.avatar}` : '/default-avatar.jpg'}
                alt={`Avatar de ${comment.author}`}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.jpg';
                }}
              />
              <div>
                <p className="font-semibold text-sm">@{comment.author}</p>
                <p className="text-gray-500 text-xs">{comment.created_at}</p>
              </div>
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
            {currentUserId === comment.authorId && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-red-500 hover:text-red-600 text-xs mt-2"
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 