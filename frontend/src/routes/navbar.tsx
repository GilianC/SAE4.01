import { Outlet } from "react-router-dom";
import NavBar from "../component/Auth/NavBar";
import React from "react";

const Navbar = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};

export default Navbar;