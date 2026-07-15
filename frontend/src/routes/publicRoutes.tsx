import { Route } from "react-router-dom";
import Home from "../pages/public/home/Home";
import Login from "../pages/public/auth/Login";

export const publicRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
  </>
);
