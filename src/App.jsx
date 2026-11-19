import { Navigate, Route, Routes } from "react-router";
import RequireAuth from "./components/RequireAuth";
import Login from "./features/auth/Login";
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

    {/* Everything else needs an active session. */}
    <Route element={<RequireAuth />}>
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
