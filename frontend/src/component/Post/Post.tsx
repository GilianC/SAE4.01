import React, { useState, useRef } from "react";
import { createPost } from "../../lib/data/Post";
import { useNavigate } from "react-router-dom";

const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};

const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');};

const getMaxFileSize = (file: File): number => {
  if (isVideoFile(file)) {
    return 50 * 1024 * 1024; }
  return 5 * 1024 * 1024;};

const formatFileSize = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};
export default function PostForm() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isImageFile(file) && !isVideoFile(file)) {
      setError("Veuillez sélectionner une image ou une vidéo");
      return;}
    const maxSize = getMaxFileSize(file);
    if (file.size > maxSize) {
      setError(`Le fichier est trop volumineux (maximum ${formatFileSize(maxSize)})`);
      return;}
    const previewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview(previewUrl);
    setError(null);};
  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);}
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";}};
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!content.trim() && !mediaFile) {
      setError("Votre post doit contenir du texte ou un média");
      return;}
    setLoading(true);
    try {
      const result = await createPost(content, mediaFile || undefined);
      setSuccessMessage("Post créé avec succès !");
      setContent("");
      removeMedia();
      setTimeout(() => {
        navigate("/auth/home");
      }, 1500);} 
    catch (err: any) {
      setError(err.message);} 
    finally {
      setLoading(false);}
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mx-auto p-4 bg-white rounded-lg shadow">
      <div className="flex items-start gap-3">
        <img 
          src="/default-avatar.jpg" 
          alt="Avatar" 
          className="w-10 h-10 rounded-full"/>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Qu'avez-vous en tête ?"
          maxLength={280}
          className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}/>
      </div>
      {mediaPreview && (
        <div className="relative w-full">
          {isImageFile(mediaFile!) ? (
            <img 
              src={mediaPreview} 
              alt="Image preview" 
              className="max-h-64 rounded-lg mx-auto object-contain"/>
          ) : (
            <video 
              src={mediaPreview} 
              controls 
              className="max-h-64 rounded-lg mx-auto" />
          )}
          <button 
            type="button"
            onClick={removeMedia}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none">
            &times;
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
      <div className="flex justify-between items-center mt-2 border-t pt-3">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={triggerFileInput}
            className="text-blue-500 hover:bg-blue-50 rounded-full p-2 transition"
            title="Ajouter une image ou une vidéo">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileChange}/>
          <span className="text-gray-400 text-sm self-center">{content.length}/280</span>
        </div>
        <button
          type="submit"
          disabled={loading || (!content.trim() && !mediaFile)}
          className={`bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-all ${
            loading || (!content.trim() && !mediaFile) ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
          {loading ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </form>
  );}