import { Route } from "react-router";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminWorkspacesPage from "../pages/admin/AdminWorkspacesPage";

export const adminRoutes = (
  <>
    <Route path="workspaces" element={<AdminWorkspacesPage />} />
    <Route path="users" element={<AdminUsersPage />} />
  </>
);
