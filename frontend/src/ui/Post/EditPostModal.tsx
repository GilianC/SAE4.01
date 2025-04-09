import React, { useState, useEffect } from 'react';
import { Post } from '../../lib/data/Post';
import { putRequest } from '../../lib/utils';

interface EditPostModalProps {
  post: Post | null;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
}

export function EditPostModal({ post, onClose, onSave }: EditPostModalProps) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setMediaPreview(post.media ? `http://localhost:8080/uploads/${post.media}` : null);
      setRemoveExistingMedia(false);
    }
  }, [post]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRemoveExistingMedia(false);
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setRemoveExistingMedia(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setLoading(true);
    setError(null);

    try {
      // Envoyer les données au format JSON au lieu de FormData
      const postData = {
        content: content
      };

      console.log('Données envoyées:', postData);

      const updatedPost = await putRequest(`/posts/${post.id}`, postData);
      console.log('Réponse du serveur:', updatedPost);
      
      onSave(updatedPost);
      onClose();
    } catch (err) {
      setError('Erreur lors de la modification du post');
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Erreur</h2>
          <p className="text-gray-600">Impossible de modifier ce post.</p>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Modifier le post</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Contenu du post"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Média (optionnel)
            </label>
            <input
              type="file"
              onChange={handleMediaChange}
              accept="image/*,video/*"
              className="w-full"
            />
            {mediaPreview && (
              <div className="mt-2 relative">
                {mediaPreview.startsWith('data:image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-40 rounded" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-40 rounded" />
                )}
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}