import { Route } from "react-router-dom";
import Home from "../pages/public/home/Home";
import Login from "../pages/public/auth/Login";
import Register from "../pages/public/auth/Register";
import RequestDemo from "../pages/public/RequestDemo";
import SchoolOnboardingPage from "../pages/public/onboarding/SchoolOnboardingPage";
import OnboardingSuccessPage from "../pages/public/onboarding/OnboardingSuccessPage";

export const publicRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/request-demo" element={<RequestDemo />} />
    <Route path="/register" element={<Register />} />
    <Route path="/onboarding" element={<SchoolOnboardingPage />} />
    <Route path="/onboarding/success" element={<OnboardingSuccessPage />} />
    {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
  </>
);
