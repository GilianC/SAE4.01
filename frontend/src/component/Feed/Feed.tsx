import { useState } from "react";
import FollowFeed from "./FollowFeed";
import NonFollowedFeed from "./NonFollowFeed";

export default function Feed() {
  const [activeFeed, setActiveFeed] = useState<"follow" | "all">("all");

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Boutons de sélection */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeFeed === "follow" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveFeed("follow")}
        >
          Abonnements
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeFeed === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveFeed("all")}
        >
          Tous les posts
        </button>
      </div>

      {/* Affichage du bon feed */}
      {activeFeed === "follow" ? <FollowFeed /> : <NonFollowedFeed />}
    </div>
  );
}