import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Prelogin from './routes/prelogin';
import { AuthProvider } from "./component/Auth/AuthContext"; // Vérifie le bon chemin
import Register from './routes/register';
import Login from './routes/login';
import Home from './routes/home';
import Admin from './routes/admin';
import NavBar from './routes/navbar';
import AdminEdit from './routes/adminEdit';
import ProfilPage from './routes/profile';
import Post from './routes/post';

import './index.css';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Prelogin />,

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
      path: '/auth',
      element: <NavBar />,
      children: [ 
      {
        path: 'home',
        element: <Home />,
    
      },
    {
      path: 'post',
      element: <Post />
    },
    {
      path: 'admin',
      element: <Admin />,
      
    },  {
      path: 'admin/user/:id',
      element: <AdminEdit />
    },
    {
      path: 'profil/:id',
      element: <ProfilPage />
    },
    ]
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
