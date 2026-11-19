import { Route } from "react-router";
import WidgetEditorPage from "../pages/WidgetEditorPage";
import WidgetsPage from "../pages/WidgetsPage";

export const widgetRoutes = <Route path="widgets" element={<WidgetsPage />} />;

export const widgetDetailRoutes = (
  <Route path="widgets/:widgetId" element={<WidgetEditorPage />} />
);
