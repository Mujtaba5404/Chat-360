import { Route } from "react-router";
import ChatPage from "../pages/ChatPage";

export const chatRoutes = (
  <Route path="chat/:conversationId?" element={<ChatPage />} />
);
