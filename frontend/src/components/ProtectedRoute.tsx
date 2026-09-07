import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

type Props = { children: ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const user = useSelector((state: any) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}