import { Navigate} from 'react-router-dom';
import React from 'react';
import  Logo  from '../ui/Logo/index.jsx';
import { Outlet } from 'react-router-dom';

export default function Root() {

  return (
    <>
    <Logo />
    
    <Outlet  />

      
    </>
  );
}
