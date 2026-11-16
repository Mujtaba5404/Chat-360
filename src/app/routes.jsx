import { Navigate, createBrowserRouter } from 'react-router';
import AppLayout from '../components/layout/AppLayout';
import { ErrorState, NotFoundState } from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';

// Route-level code splitting: each module is its own chunk, loaded on first navigation.
const page = (load) => () => load().then((module) => ({ Component: module.default }));

export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: page(() => import('../features/auth/LoginPage')),
    errorElement: <ErrorState fullPage />,
    hydrateFallbackElement: <LoadingState />,
  },
  {
    // Authenticated app shell — AppLayout redirects to /login when there is no session.
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorState fullPage />,
    hydrateFallbackElement: <LoadingState />,
    children: [
      { index: true, element: <Navigate to="/chat" replace /> },
      { path: 'chat/:conversationId?', lazy: page(() => import('../features/chat/ChatPage')), handle: { title: 'Chat' } },
      { path: 'visitors', lazy: page(() => import('../features/visitors/VisitorsPage')), handle: { title: 'Visitors' } },
      { path: 'widgets', lazy: page(() => import('../features/widgets/WidgetsPage')), handle: { title: 'Widgets' } },
      {
        path: 'widgets/:widgetId',
        lazy: page(() => import('../features/widgets/WidgetEditorPage')),
        handle: { title: 'Widgets', detail: 'Editor' },
      },
      { path: 'website', lazy: page(() => import('../features/website/WebsitePage')), handle: { title: 'Website' } },
      {
        path: 'canned-responses',
        lazy: page(() => import('../features/canned-responses/CannedResponsesPage')),
        handle: { title: 'Canned Responses' },
      },
      { path: 'users', lazy: page(() => import('../features/users/UsersPage')), handle: { title: 'Users' } },
      { path: 'workspace/:section?', lazy: page(() => import('../features/workspace/WorkspacePage')), handle: { title: 'Workspace' } },
      { path: '*', element: <NotFoundState />, handle: { title: 'Not found' } },
    ],
  },
]);
