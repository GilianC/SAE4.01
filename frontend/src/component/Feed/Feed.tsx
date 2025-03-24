import React, { useEffect, useState } from "react";
import { getPosts, Post } from "../../lib/data/Post";
import { useNavigate } from "react-router-dom";


export default function Feed() {
    const [posts, setPosts] = useState<Post[]>(getPosts());
  
    useEffect(() => {
      const updateFeed = () => setPosts(getPosts());
      window.addEventListener("storage", updateFeed);
      return () => window.removeEventListener("storage", updateFeed);
    }, []);
    const navigate = useNavigate();
    const handleOpenPost = () => {
        navigate("/post");
    };
    return (
      <div className="flex flex-col">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Aucun post pour l'instant.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4 border-b border-gray-200">
              <p className="font-semibold">{post.pseudo}</p>
              <p className="mt-1">{post.content}</p>
            </div>
          ))
        )}
        <button onClick={handleOpenPost} className="fixed bottom-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-1.5l-9.192 9.192a2.121 2.121 0 01-1.5.621H4v-3.023a2.121 2.121 0 01.621-1.5l9.192-9.192a2.121 2.121 0 012.964 0z" />
            </svg>
        </button>
      </div>
    );
  }