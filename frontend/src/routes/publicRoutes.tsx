import { Route } from "react-router-dom";
import Home from "../pages/public/home/Home";
import Login from "../pages/public/auth/Login";
import Register from "../pages/public/auth/Register";
import RequestDemo from "../pages/public/RequestDemo";

export const publicRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/request-demo" element={<RequestDemo />} />
    <Route path="/register" element={<Register />} />
    {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
  </>
);
