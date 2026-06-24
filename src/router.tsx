import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import SignIn from "@/views/signin/SignIn";
import MainApplication from "@/views/mainapplication/MainApplication";
import Merchants from "@/views/merchants/Merchants";
import Shlog from "@/views/shlog/Shlog";
import Layout from "@/components/Layout";
import { useAuth } from "@/utilities/shared/auth";

/** Gate that redirects unauthenticated users to the sign-in view. */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <MainApplication /> },
          { path: "/merchants", element: <Merchants /> },
          { path: "/shlog", element: <Shlog /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
