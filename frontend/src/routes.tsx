import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home/pages/Home";
import Login from "./components/auth/Login";
// import ForgotPassword from "./components/pages/auth/ForgotPassword";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
