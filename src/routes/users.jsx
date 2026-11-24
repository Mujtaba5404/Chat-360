import { Route } from "react-router";
import SuperAdminOnly from "../components/SuperAdminOnly";
import UsersPage from "../pages/UsersPage";

// Users is for super admins only; workspace users don't get this page.
export const userRoutes = (
  <Route
    path="users"
    element={
      <SuperAdminOnly>
        <UsersPage />
      </SuperAdminOnly>
    }
  />
);
