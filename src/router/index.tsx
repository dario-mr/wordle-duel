import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { MyRoomsPage } from '../pages/MyRoomsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RoomPage } from '../pages/RoomPage';
import { AcceptableUsePage } from '../pages/legal/AcceptableUsePage';
import { CookiesPage } from '../pages/legal/CookiesPage';
import { PrivacyPage } from '../pages/legal/PrivacyPage';
import { TermsPage } from '../pages/legal/TermsPage';

const basename =
  import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'my-rooms', element: <MyRoomsPage /> },
        { path: 'privacy', element: <PrivacyPage /> },
        { path: 'cookies', element: <CookiesPage /> },
        { path: 'terms', element: <TermsPage /> },
        { path: 'acceptable-use', element: <AcceptableUsePage /> },
        { path: 'rooms/:roomId', element: <RoomPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename },
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
