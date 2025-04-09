import { useState, useEffect } from "react";
import FollowFeed from "./FollowFeed";
import NonFollowedFeed from "./NonFollowFeed";
import { FeedSkeleton } from "../../ui/Skeleton/FeedSkeleton";

export default function Feed() {
  const [activeFeed, setActiveFeed] = useState<"follow" | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement minimal pour éviter un flash du skeleton
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeFeed]);

  if (loading) {
    return <FeedSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeFeed === "follow" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setLoading(true);
            setActiveFeed("follow");
          }}
        >
          Abonnements
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeFeed === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setLoading(true);
            setActiveFeed("all");
          }}
        >
          Tous les posts
        </button>
      </div>
      {activeFeed === "follow" ? <FollowFeed /> : <NonFollowedFeed />}
    </div>
  );
}