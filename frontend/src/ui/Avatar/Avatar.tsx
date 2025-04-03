import React, { useState, useRef } from "react";

interface AvatarUploaderProps {
  initialSrc?: string;
  uploadUrl: string; // URL du backend pour l'upload
}

export default function Avatar({ initialSrc, uploadUrl }: AvatarUploaderProps) {
  const [avatar, setAvatar] = useState(initialSrc || "https://via.placeholder.com/100");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("avatar", file);
  
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json(); // 👀 Ajout pour voir la réponse JSON
      if (!response.ok) throw new Error(data.message || "Upload échoué");
  
      setAvatar(data.avatarUrl);
    } catch (error) {
      console.error("Erreur d'upload:", error);
    }
  };
  

  return (
    <div className="relative w-24 h-24">
      <img
        src={avatar}
        alt="Avatar"
        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      />
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