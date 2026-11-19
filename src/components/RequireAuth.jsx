import { Navigate, Outlet, useLocation } from "react-router";
import { useCurrentUser } from "../api/auth";

// Nothing behind this renders without an active session.
const RequireAuth = () => {
  const user = useCurrentUser();
  const location = useLocation();

  if (!user || user.status !== "active") {
    const next = encodeURIComponent(location.pathname + location.search);

    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
