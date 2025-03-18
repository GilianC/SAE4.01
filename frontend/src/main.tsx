import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Prelogin from './routes/prelogin';
import Root from './routes/root.tsx';
import Register from './routes/register.tsx';
import Login from './routes/login.tsx';
import Home from './routes/home.tsx';
import Admin from './routes/admin.tsx';
// import OurTeam, {loader as tLoader} from './routes/team.jsx';
import './index.css';


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
    path: '/admin',
    element: <Admin />,

  },
]);



const rootElement = document.querySelector('#root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
} else {
  console.error('No root element found');
}
