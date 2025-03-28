import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Prelogin from './routes/prelogin';
import { AuthProvider } from "./component/Auth/AuthContext"; // Vérifie le bon chemin
import Register from './routes/register.tsx';
import Login from './routes/login.tsx';
import Home from './routes/home.tsx';
import Admin from './routes/admin.tsx';
import AdminEdit from './routes/adminEdit.tsx';
import Post from './routes/post.tsx';
// import OurTeam, {loader as tLoader} from './routes/team.jsx';
import './index.css';
// const response = await fetch('http://localhost:8080/posts?page=1');
// console.log(await response.json());

const router = createBrowserRouter([
  {
    path: '/',
    element: <Prelogin />,
    // children: [
    //   // {
    //   //   path: '/prelogin',
    //   //   element: <Prelogin />
    //   // },
     
    // ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/home',
    element: <Home />,

  },
  {
    path: '/post',
    element: <Post />
  },
  {
    path: '/admin',
    element: <Admin />,
    
  },  {
    path: '/admin/user/:id',
    element: <AdminEdit />
  },
  
]);



const rootElement = document.querySelector('#root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
       <AuthProvider>
      <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>,
  )
} else {
  console.error('No root element found');
}
