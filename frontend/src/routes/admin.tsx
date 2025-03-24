import React from "react";
import UserList from "../component/Admin/UserList.tsx";

export default function Admin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <UserList />
    </div>
  );
}