import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { UsersPage } from '../pages/UsersPage.tsx';
import { AdminPage } from '../pages/AdminPage.tsx';
import { RoomsPage } from '../pages/RoomsPage.tsx';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { MyRoomsPage } from '../pages/MyRoomsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RoomPage } from '../pages/RoomPage';
import { LegalPage } from '../pages/LegalPage';

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
        { path: 'admin', element: <AdminPage /> },
        { path: 'users', element: <UsersPage />, handle: { layout: 'wide' } },
        { path: 'rooms', element: <RoomsPage />, handle: { layout: 'wide' } },
        { path: 'legal', element: <LegalPage /> },
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
