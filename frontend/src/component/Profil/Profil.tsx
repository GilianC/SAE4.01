import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRequest, postRequest, deleteRequest, blockUser, getBlockedUsers, isUserBlocked } from "../../lib/utils";
import { PostCard } from "../../ui/Post/Post";
import { Post } from "../../lib/data/Post";
import Avatar from "../../ui/Avatar/Avatar";
import { useAuth } from "../Auth/AuthContext";
import { EditPostModal } from "../../ui/Post/EditPostModal";
import { ProfileSkeleton } from "../../ui/Skeleton/ProfileSkeleton";
import BlockButton from "./BlockButton";
import BlockedUsers from "./BlockedUsers";

const compressImage = async (file: File, maxSizeMB = 1, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (file.size <= maxSizeMB * 1024 * 1024) {
      console.log('Image déjà dans la limite de taille:', file.size / 1024 / 1024, 'MB');
      return resolve(file);}
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        if (width > MAX_WIDTH) {
          height = Math.round(height * MAX_WIDTH / width);
          width = MAX_WIDTH;}
        if (height > MAX_HEIGHT) {
          width = Math.round(width * MAX_HEIGHT / height);
          height = MAX_HEIGHT;}
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Échec de compression'));}
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          console.log('Image compressée de', file.size / 1024 / 1024, 'MB à', newFile.size / 1024 / 1024, 'MB');
          resolve(newFile);
        }, file.type, quality);};
      img.onerror = () => {
        reject(new Error('Erreur chargement image'));
      };};
    reader.onerror = () => {
      reject(new Error('Erreur lecture fichier'));
    };
  });
};

interface UserProfile {
  id: number;
  pseudo: string;
  bio: string;
  avatar: string;
  banner: string;
  location: string;
  website: string;
}

export default function Profil() {
  const { id } = useParams();
  const { user } = useAuth();  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    website: "",
    location: "",
  });
  const [banner, setBanner] = useState<File | null>(null);
  const isOwnProfile = user && profile && String(user.id) === String(profile.id);
  useEffect(() => {
    if (user && profile) {
      console.log("User ID:", user.id, "Type:", typeof user.id);
      console.log("Profile ID:", profile.id, "Type:", typeof profile.id);
      console.log("Is own profile:", isOwnProfile);
      console.log("String comparison:", String(user.id) === String(profile.id));
    }
  }, [user, profile, isOwnProfile]);
  useEffect(() => {
    if (id) {
      getRequest(`/profile/${id}`)
        .then((data) => {
          console.log("API Response:", data);
          setProfile(data);
          setFormData({ bio: data.bio, website: data.website, location: data.location });
        })
        .catch(() => setError("Utilisateur non trouvé"))
        .finally(() => setLoading(false));
    }
  }, [id, user]);
  useEffect(() => {
    if (!user) {
      console.log("Utilisateur non connecté");
    } else {
      console.log("Utilisateur connecté:", user);
    }
  }, [user]);
  useEffect(() => {
    if (user && profile && String(user.id) !== String(profile.id)) {
      console.log("Vérification du statut de suivi pour le profil", profile.id);
      getRequest(`/follow/status/${profile.id}`)
        .then((response) => {
          setIsFollowing(response.isFollowing);
        })
        .catch((error) => {
          setIsFollowing(false);
        });
    }
  }, [user, profile]);
  useEffect(() => {
    if (profile) {
      getRequest(`/posts?userId=${profile.id}`)
        .then((data) => setPosts(data))
        .catch(() => setError("Erreur lors de la récupération des posts"));
    }
  }, [profile]);
  useEffect(() => {
    if (user && profile && !isOwnProfile) {
      isUserBlocked(profile.id)
        .then(({ isBlocked }) => setIsBlocked(isBlocked))
        .catch(() => setError("Erreur lors de la vérification du statut de blocage"));
    }
  }, [user, profile, isOwnProfile]);
  const handleFollow = () => {
    postRequest(`/follow/${profile?.id}`)
      .then((response) => {
        setIsFollowing(!isFollowing);
      })
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (banner) {
        try {
          if (banner.size > 5 * 1024 * 1024) {
            console.warn("Bannière trop volumineuse:", banner.size / 1024 / 1024, "MB");}
          const compressedBanner = await compressImage(banner, 1, 0.7);
          const formData = new FormData();
          formData.append("file", compressedBanner);
          const response = await fetch("http://localhost:8080/upload", {
            method: "POST",
            body: formData
          });
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);}
          const data = await response.json();
          const bannerFilename = data.filename || (data.url ? data.url.split('/').pop() : data);
          setFormData(prev => ({...prev, banner: bannerFilename}));} 
        catch (uploadError) {
          console.error("Erreur lors de l'upload direct de la bannière:", uploadError);
        }}
      try {
        await postRequest(`/profile/edit`, formData);
        setProfile({ ...profile!, ...formData });
        setEditing(false);
        setSuccessMessage("Profil mis à jour avec succès !");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (saveError) {
        setError("Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      setError("Erreur lors de la modification du profil");
    }};
  const handleAvatarUpload = async (filename: string) => {
    console.log("Avatar uploadé:", filename);
    if (!filename || filename === "undefined" || filename === "null") {
      console.error("Nom de fichier d'avatar invalide:", filename);
      setError("Erreur lors de l'upload de l'avatar: nom de fichier invalide");
      return;}
    setFormData(prev => ({...prev, avatar: filename}));
    if (profile) {
      setProfile({...profile, avatar: filename});}
    try {
      await postRequest(`/profile/edit`, { avatar: filename });
      setSuccessMessage("Avatar mis à jour avec succès !");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'avatar:", error);
      setError("Erreur lors de la sauvegarde de l'avatar");
    }};
  const handleAvatarError = (error: string) => {
    setError(error);};
  const handleUpload = async (file: File, type: string) => {
    try {let maxSize = 5 * 1024 * 1024; 
      if (type === "banner") {
        maxSize = 10 * 1024 * 1024}
      if (file.size > maxSize) {
        setError(`Le fichier est trop volumineux (maximum ${maxSize / (1024 * 1024)}MB pour les ${type})`);
        console.warn("Fichier trop volumineux:", file.size / 1024 / 1024, "MB");
        return;}
      const compressedFile = await compressImage(file, type === "banner" ? 2 : 1, 0.7);
      const formData = new FormData();
      formData.append("file", compressedFile);
      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData
      });
      
      console.log(`Réponse d'upload ${type}:`, response.status);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const filename = data.filename || (data.url ? data.url.split('/').pop() : data);
      
      setFormData(prev => ({...prev, [type]: filename}));
      if (type === "banner" && profile) {
        setProfile({...profile, banner: filename});
      }
      setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} mis à jour avec succès !`);
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      setError(`Erreur lors de l'upload du fichier ${type}`);
    }
  };

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

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleSaveEdit = (updatedPost: Post) => {
    setPosts(posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const getImageUrl = (filename: string | undefined, defaultImage: string) => {
    if (!filename) return defaultImage;
    if (filename.includes('mock-')) {
      console.log("Utilisation d'une image simulée:", filename);
      return defaultImage;
    }
    if (filename.startsWith('http')) return filename;
    return `http://localhost:8080/uploads/${filename}`;
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <p className="text-center text-red-500 mt-5">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto bg-blue-50 shadow-lg rounded-lg overflow-hidden mt-10 border border-blue-300">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <div className="h-40 relative">
        <img 
          src={getImageUrl(profile?.banner, '/default-banner.jpg')} 
          alt="Bannière" 
          className="w-full h-full object-cover" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/default-banner.jpg';
          }}
        />
        {editing && (
          <div className="absolute top-2 right-2">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => e.target.files && setBanner(e.target.files[0])} 
              className="text-white text-sm"
            />
            <button 
              onClick={() => banner && handleUpload(banner, "banner")} 
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mt-2 hover:bg-gray-300"
            >
              Changer Bannière
            </button>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center">
          <Avatar 
            initialSrc={profile?.avatar ? `http://localhost:8080/uploads/${profile.avatar}` : '/default-avatar.jpg'}
            onUploadSuccess={handleAvatarUpload}
            onUploadError={handleAvatarError}
            size="lg"
            editable={editing}
          />
          <div className="ml-4">
            <h2 className="text-xl font-bold text-blue-900">{profile?.pseudo}</h2>
            <p className="text-blue-700">{profile?.location}</p>
          </div>
          
          <div className="ml-auto flex flex-col gap-2">
            {!isOwnProfile && (
              <>
                <button 
                  onClick={handleFollow} 
                  className={`${isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md`}
                  disabled={isBlocked}
                >
                  {isFollowing ? "Ne plus suivre" : "Suivre"}
                </button>
                <BlockButton 
                  userId={profile?.id || 0} 
                  onBlockChange={(blocked) => setIsBlocked(blocked)}
                />
              </>
            )}
            {isOwnProfile && (
              <>
                <button 
                  onClick={() => setEditing(!editing)} 
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  {editing ? "Annuler" : "Modifier le profil"}
                </button>
                <button
                  onClick={() => setShowBlockedUsers(!showBlockedUsers)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                >
                  {showBlockedUsers ? "Masquer les utilisateurs bloqués" : "Voir les utilisateurs bloqués"}
                </button>
              </>
            )}
          </div>
        </div>

        {showBlockedUsers && isOwnProfile && (
          <div className="mt-4">
            <BlockedUsers />
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                className="w-full p-2 rounded border border-gray-300" 
                placeholder="Parlez-nous de vous..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site web</label>
              <input 
                type="url" 
                name="website" 
                value={formData.website} 
                onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                className="w-full p-2 rounded border border-gray-300" 
                placeholder="https://votresite.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Localisation</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                className="w-full p-2 rounded border border-gray-300" 
                placeholder="Votre ville, pays" 
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Sauvegarder
              </button>
              <button 
                type="button" 
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500" 
                onClick={() => setEditing(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="mt-4 text-blue-800">{profile?.bio}</p>
            {profile?.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline mt-2 block"
              >
                {profile.website}
              </a>
            )}
          </>
        )}
      </div>
      <div className="px-5 py-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Aucun post pour ce profil.</p>
        ) : (
          posts
            .filter(post => post.authorId === profile?.id)
            .map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                onLike={handleLike}
                onEdit={handleEdit}
                image={post.media || ''}
              />
            ))
        )}
      </div>

      {/* Modal d'édition */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}


