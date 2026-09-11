import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
const Cases = lazy(()=>import("./pages/Cases"));
const Overview = lazy(() => import("./pages/Overview"));
const HRReview = lazy(() => import("./pages/HRReview"));
const HROverview = lazy(() => import("./pages/HROverview"));
const MyCases = lazy(() => import("./pages/MyCases"));
const AdminOverview = lazy(() => import("./pages/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminRules = lazy(() => import("./pages/AdminRules"));

function App() {
  const dispatch = useDispatch();
  const user = useSelector((s: any) => s.auth.user);
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
          <Route
            index
            element={
              user?.role === "hr" ? (
                <HROverview />
              ) : user?.role === "employee" ? (
                <MyCases />
              ) : user?.role === "admin" ? (
                <AdminOverview />
              ) : (
                <Overview />
              )
            }
          />
          <Route path="users" element={<AdminUsers />} />
          <Route path="manage-rules" element={<AdminRules />} />
          <Route path="review" element={<HRReview />} />
          <Route path="employees" element={<Employees />} />
          <Route path="create" element={<CreateIncident />} />
          <Route path="cases" element={<Cases/>} />
          <Route path="rules" element={<RuleBook />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Suspense>
  );
}

export default App;
