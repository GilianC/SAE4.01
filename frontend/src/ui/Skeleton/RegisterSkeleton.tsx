import React from 'react';

export const RegisterSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="mb-8">
        <div className="w-32 h-32 bg-gray-700 rounded-full animate-pulse"></div>
      </div>

      <div className="w-full max-w-2xl bg-gray-700 p-8 rounded-lg shadow-lg animate-pulse">
        <div className="h-8 bg-gray-600 rounded w-1/3 mx-auto mb-8"></div>
        <div className="space-y-6">
          <div>
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-12 bg-gray-600 rounded-lg w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-12 bg-gray-600 rounded-lg w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-12 bg-gray-600 rounded-lg w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-12 bg-gray-600 rounded-lg w-full"></div>
          </div>
          <div className="h-12 bg-gray-600 rounded-lg w-full mt-8"></div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSkeleton; 