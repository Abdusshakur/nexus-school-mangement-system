import { Route } from "react-router-dom";
import Home from "../pages/public/home/Home";
import Login from "../pages/public/auth/Login";
import RequestDemo from "../pages/public/RequestDemo";

export const publicRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/request-demo" element={<RequestDemo />} />
    {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
  </>
);
