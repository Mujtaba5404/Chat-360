import { Navigate, Route, Routes } from "react-router";
import Authenticated from "./components/Authenticated";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import { REGISTER_PATHS } from "./features/auth/registerPaths";
import AppLayout from "./layouts/AppLayout";
import { ADMIN_HOME_PATH, HOME_PATH } from "./layouts/navigation";
import NotFound from "./pages/NotFound";
import { adminRoutes } from "./routes/admin";
import { cannedResponseRoutes } from "./routes/cannedResponses";
import { chatRoutes } from "./routes/chat";
import { tagRoutes } from "./routes/tags";
import { userRoutes } from "./routes/users";
import { visitorRoutes } from "./routes/visitors";
import { websiteRoutes } from "./routes/website";
import { widgetDetailRoutes, widgetRoutes } from "./routes/widgets";
import { workspaceRoutes } from "./routes/workspace";

const App = () => (
  <Routes>
    <Route path="login" element={<Login />} />
    <Route element={<Register />}>
      {Object.values(REGISTER_PATHS).map((path) => (
        <Route key={path} path={path} element={null} />
      ))}
    </Route>

    {/* Super admin console. Authenticated sends anyone else to their workspace. */}
    <Route element={<Authenticated />}>
      <Route index element={<Navigate to={ADMIN_HOME_PATH} replace />} />
      <Route path="admin" element={<AppLayout />}>
        <Route index element={<Navigate to={ADMIN_HOME_PATH} replace />} />
        {adminRoutes}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>

    {/* A workspace: /:workspaceId/chat. Its own users, or a super admin who opened it. */}
    <Route path=":workspaceId" element={<Authenticated />}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={HOME_PATH.slice(1)} replace />} />
        {chatRoutes}
        {visitorRoutes}
        {widgetRoutes}
        {widgetDetailRoutes}
        {websiteRoutes}
        {cannedResponseRoutes}
        {tagRoutes}
        {userRoutes}
        {workspaceRoutes}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>
  </Routes>
);

export default App;
