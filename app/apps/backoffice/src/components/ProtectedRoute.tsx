import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@backoffice/redux/selectors/user";

interface ProtectedRouteProps extends PropsWithChildren {
  redirectPath?: string;
}

export function ProtectedRoute({ redirectPath = "/not-found", children }: ProtectedRouteProps) {
  const user = useSelector(selectUser);

  if (!user.loggedIn) {
    // Redirect the user to the login page or the redirect path
    return <Navigate to={redirectPath} replace />;
  }
  // Render the protected content
  return children;
}
