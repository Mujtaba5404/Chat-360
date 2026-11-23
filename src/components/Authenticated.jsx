import { useLocalStorage } from "@mantine/hooks";
import { Navigate, Outlet, useLocation } from "react-router";

// The token lives in an httpOnly cookie (JS can't read it), so only the login data is checked here.
// If the session expires the API returns 401 and the api interceptor sends the user to login.
const Authenticated = () => {
  const [auth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const location = useLocation();

  if (!auth?.id) {
    const next = encodeURIComponent(location.pathname + location.search);

    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
};

export default Authenticated;
