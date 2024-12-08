import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@app/redux/selectors/user";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps extends PropsWithChildren {
  redirectPath?: string;
  creatorRequired?: boolean;
}

export function ProtectedRoute({
  redirectPath = "/not-found",
  children,
  creatorRequired = false,
}: ProtectedRouteProps) {
  const user = useSelector(selectUser);

  const isCreatorRequired = creatorRequired && !user?.is_creator;

  if (!user || user.authDataPending) {
    // Render a loading indicator, such as a spinner
    return <LoadingSpinner />;
  }

  if (!user.loggedIn || isCreatorRequired) {
    // Redirect the user to the login page or the redirect path
    return <Navigate to={redirectPath} replace />;
  }
  // Render the protected content
  return children;
}
