import { Navigate, Route, Routes } from "react-router";
import Authenticated from "./components/Authenticated";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import { REGISTER_PATHS } from "./features/auth/registerPaths";
import AppLayout from "./layouts/AppLayout";
import { HOME_PATH } from "./layouts/navigation";
import NotFound from "./pages/NotFound";
import { cannedResponseRoutes } from "./routes/cannedResponses";
import { chatRoutes } from "./routes/chat";
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

    {/* Everything else needs an active session. */}
    <Route element={<Authenticated />}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={HOME_PATH} replace />} />
        {chatRoutes}
        {visitorRoutes}
        {widgetRoutes}
        {widgetDetailRoutes}
        {websiteRoutes}
        {cannedResponseRoutes}
        {userRoutes}
        {workspaceRoutes}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>
  </Routes>
);

export default App;
