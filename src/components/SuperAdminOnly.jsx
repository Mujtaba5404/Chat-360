import { Navigate } from "react-router";
import useIsSuperAdmin from "../hooks/useIsSuperAdmin";
import { HOME_PATH } from "../layouts/navigation";

// Renders a workspace page only for a super admin; anyone else who opens the URL is
// sent to the workspace inbox.
const SuperAdminOnly = ({ children }) =>
  useIsSuperAdmin() ? (
    children
  ) : (
    <Navigate to={`..${HOME_PATH}`} relative="path" replace />
  );

export default SuperAdminOnly;
