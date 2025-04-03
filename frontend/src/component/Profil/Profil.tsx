import { useEffect, useState } from "react";
import { getRequest, postRequest, deleteRequest } from "../../lib/utils"; 
import Avatar from "../../ui/Avatar/Avatar";
import { useParams } from "react-router-dom";
import { PostCard } from "../../ui/Post/Post";
import { Post } from "../../lib/data/Post";
import { Link } from "react-router-dom";
import { Button } from "../../ui/Common/Button";
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<number>(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);
  const [postsError, setPostsError] = useState("");

  // On récupère le profil de l'utilisateur
  useEffect(() => {
    if (id) {
      getRequest(`/profile/${id}`)
        .then((data) => setProfile(data))
        .catch(() => setError("Utilisateur non trouvé"))
        .finally(() => setLoading(false));
    }
  }, [id]);
  useEffect(() => {
    if (id) {
      getRequest(`/profile/${id}`).then(setProfile);
      getRequest(`/followed`).then((data) => {
        setIsFollowing(data.includes(parseInt(id)));
      });
    }
  }, [id]);

  const handleFollow = () => {
    postRequest(`/follow/${id}`).then(() => {
      setIsFollowing(!isFollowing);
    });
  };
  // Une fois le profil chargé, on récupère les posts associés à cet utilisateur
  useEffect(() => {
    if (profile) {
      getRequest(`/posts?userId=${profile.id}`)
        .then((data) => setPosts(data))
        .catch(() => setPostsError("Erreur lors de la récupération des posts"))
        .finally(() => setPostsLoading(false));
    }
  }, [profile]);

  // Fonction pour gérer le like
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

  // Fonction pour gérer la suppression d'un post
  const handleDelete = (id: number) => {
    deleteRequest(`/posts/${id}`)
      .then(() => {
        setPosts(posts.filter((post) => post.id !== id));
      })
      .catch(() => setError("Erreur de suppression"));
  };

  // Affichage conditionnel pendant le chargement des données
  if (loading) return <p className="text-center mt-5">Chargement...</p>;
  if (error) return <p className="text-center text-red-500 mt-5">{error}</p>;

  // Afficher les posts de l'utilisateur du profil
  return (
    <div className="max-w-2xl mx-auto bg-blue-50 shadow-lg rounded-lg overflow-hidden mt-10 border border-blue-300">
      {/* Bannière */}
 
      <div className="h-40 bg-blue-600">
        <img
          src={`http://localhost:8080/assets/${profile?.banner}`}
          alt="Bannière"
          className="w-full h-full object-cover opacity-90"
        />
      </div>

      {/* Avatar et infos */}
      <div className="p-5">
        
        <div className="flex items-center">
          <img
            src={`http://localhost:8080/assets/${profile?.avatar}`}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-white"
          />
          <div className="ml-4">
            <h2 className="text-xl font-bold text-blue-900">{profile?.pseudo}</h2>
            <p className="text-blue-700">{profile?.location}</p>
          </div>
         <Button
                  type="button"
                  onClick={handleFollow}
                  variant="primary"
                  width="small"
                  size="sm"
                  font="normal"
                  rounded="full"
                >
            {isFollowing ? "Ne plus suivre" : "Suivre"}
          </Button>
        </div>

        {/* Bio */}
        <p className="mt-4 text-blue-800">{profile?.bio}</p>

        {/* Site Web */}
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
      </div>

      {/* Affichage des posts */}
      <div className="px-5 py-4">
  {postsLoading ? (
    <p className="text-center text-gray-500 mt-4">Chargement des posts...</p>
  ) : postsError ? (
    <p className="text-center text-red-500 mt-4">{postsError}</p>
  ) : posts.length === 0 ? (
    <p className="text-center text-gray-500 mt-4">Aucun post pour ce profil.</p>
  ) : (
    // On filtre les posts pour ne garder que ceux correspondant à profile.id
    posts
      .filter(post => post.authorId === profile?.id) // Filtrage par `authorId`
      .map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={handleDelete}
          onLike={handleLike}
        />
      ))
  )}
</div>
    </div>
  );
}