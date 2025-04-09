import React from 'react';

export const LoginSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-700 rounded-lg w-full"></div>
          <div className="h-12 bg-gray-700 rounded-lg w-full"></div>
          <div className="h-12 bg-gray-700 rounded-lg w-full mt-6"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginSkeleton; 