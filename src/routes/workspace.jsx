import { Route } from "react-router";
import WorkspacePage from "../pages/WorkspacePage";

export const workspaceRoutes = (
  <Route path="workspace/:section?" element={<WorkspacePage />} />
);
