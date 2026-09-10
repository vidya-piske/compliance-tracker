import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./store/authSlice";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const CreateIncident = lazy(() => import("./pages/CreateIncident"));
const RuleBook = lazy(() => import("./pages/RuleBook"));
const Employees = lazy(() => import("./pages/Employees"));

function App() {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user) dispatch(setUser(user));
      })
      .finally(() => setChecking(false));
  }, [dispatch]);

  if (checking) return <Loader />;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/create" replace />} />
          <Route path="employees" element={<Employees />} />
          <Route path="create" element={<CreateIncident />} />
          <Route path="rules" element={<RuleBook />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Suspense>
  );
}

export default App;
