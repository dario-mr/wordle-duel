import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../features/auth/LoginPage';
import { MyRoomsPage } from '../features/rooms/my-rooms/MyRoomsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RoomPage } from '../features/rooms/game/RoomPage';
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
        {
          path: 'admin',
          lazy: async () => ({
            Component: (await import('../features/admin/AdminPage')).AdminPage,
          }),
        },
        {
          path: 'users',
          lazy: async () => ({
            Component: (await import('../features/admin/users/UsersPage')).UsersPage,
          }),
          handle: { layout: 'wide' },
        },
        {
          path: 'rooms',
          lazy: async () => ({
            Component: (await import('../features/admin/rooms/RoomsPage')).RoomsPage,
          }),
          handle: { layout: 'wide' },
        },
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
