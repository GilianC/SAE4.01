import React from 'react';

export const ProfileSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto bg-blue-50 shadow-lg rounded-lg overflow-hidden mt-10 border border-blue-300 animate-pulse">
      <div className="h-40 bg-gray-200"></div>
      <div className="p-5">
        <div className="flex items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>  
          <div className="ml-4 flex-1">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-10 bg-gray-200 rounded-md w-32"></div>
            <div className="h-10 bg-gray-200 rounded-md w-32"></div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="mt-4 h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="px-5 py-4 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSkeleton; 