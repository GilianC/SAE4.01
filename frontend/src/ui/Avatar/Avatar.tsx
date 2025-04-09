import React, { useState, useRef, useEffect } from "react";
import { uploadFile } from "../../lib/utils";

interface AvatarProps {
  initialSrc?: string;
  onUploadSuccess?: (filename: string) => void;
  onUploadError?: (error: string) => void;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
}


const compressImage = async (file: File, maxSizeMB = 1, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {

    if (file.size <= maxSizeMB * 1024 * 1024) {
      console.log('Image déjà dans la limite de taille:', file.size / 1024 / 1024, 'MB');
      return resolve(file);
    }


    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');

        let width = img.width;
        let height = img.height;
        

        const MAX_WIDTH = 800; 
        const MAX_HEIGHT = 800;
        
        if (width > MAX_WIDTH) {
          height = Math.round(height * MAX_WIDTH / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round(width * MAX_HEIGHT / height);
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        

        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Échec de compression'));
          }
          

          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          
          console.log('Avatar compressé de', file.size / 1024 / 1024, 'MB à', newFile.size / 1024 / 1024, 'MB');
          resolve(newFile);
        }, file.type, quality);
      };
      
      img.onerror = () => {
        reject(new Error('Erreur chargement image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lecture fichier'));
    };
  });
};

export default function Avatar({ 
  initialSrc, 
  onUploadSuccess, 
  onUploadError,
  size = "md",
  editable = true
}: AvatarProps) {
  const [avatar, setAvatar] = useState(initialSrc || "/default-avatar.jpg");
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSrc) {
      setAvatar(initialSrc);
      setImageError(false);
    }
  }, [initialSrc]);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;


    if (file.size > 1 * 1024 * 1024) {
      onUploadError?.("Le fichier est trop volumineux (maximum 1MB pour les avatars)");
      return;
    }

    if (!file.type.startsWith('image/')) {
      onUploadError?.("Le fichier doit être une image");
      return;
    }

    setIsLoading(true);
    try {
   
      const compressedFile = await compressImage(file, 0.5, 0.7); // Limite à 500KB pour les avatars
     
      
      const formData = new FormData();
      formData.append("file", compressedFile);
      
      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData
      });
      

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();

      

      const filename = data.filename || (data.url ? data.url.split('/').pop() : data);

      
      const newAvatarUrl = `http://localhost:8080/uploads/${filename}`;

      const img = new Image();
      img.onload = () => {
        setAvatar(newAvatarUrl);
        setImageError(false);
        onUploadSuccess?.(filename);
      };
      img.onerror = () => {

        setImageError(true);
        onUploadError?.("Impossible de charger l'image");
      };
      img.src = newAvatarUrl;
    } catch (error) {

      onUploadError?.("Erreur lors de l'upload de l'image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setAvatar("/default-avatar.jpg");
  };

  const openFileSelector = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  // Déterminer l'URL de l'avatar
  const getAvatarUrl = (src: string) => {
    if (!src) return "/default-avatar.jpg";
    

    if (src.includes('mock-')) {
      console.log("Utilisation d'un avatar simulé:", src);
      return "/default-avatar.jpg";
    }
    
    if (src.startsWith('http')) return src;
    
    return `http://localhost:8080/uploads/${src}`;
  };

  return (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} relative group ${editable ? 'cursor-pointer' : ''}`}
        onClick={openFileSelector}
      >
        <img
          src={getAvatarUrl(avatar)}
          alt="Avatar"
          className={`${sizeClasses[size]} rounded-full border-4 border-white shadow-md object-cover transition-opacity duration-200 ${
            isLoading ? 'opacity-50' : editable ? 'group-hover:opacity-80' : ''
          }`}
          onError={handleImageError}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        {editable && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={openFileSelector}
          >
            <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Changer
            </span>
          </div>
        )}
      </div>
      

      {editable && (
        <button
          onClick={openFileSelector}
          className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition-colors duration-200"
        >
          Changer l'avatar
        </button>
      )}
      
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}