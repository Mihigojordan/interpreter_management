import React, { Suspense, lazy } from "react";
import { BrowserRouter, createBrowserRouter, Navigate, Outlet, Route, RouterProvider, Routes } from "react-router-dom"
const HomePage = lazy(() => import("./pages/HomePage"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const BlogPage = lazy(() => import("./pages/blogs/BlogPage"));
const BlogSingle = lazy(() => import("./pages/blogs/Blogsingle"));
const ServicePage = lazy(() => import("./pages/services/ServicePage"));
const ServiceSingle = lazy(() => import("./pages/services/ServiceSingle"));
const BlogContainer = lazy(() => import("../src/pages/blogs/blogContainer"));
const AboutUs = lazy(() => import('./pages/about us/aboutUs'));
const TeamMember = lazy(() => import('./pages/Team'))

import MainLayout from "./layouts/MainLayout";
import ProjectsPage from "./pages/Projects/ProjectPages";
import AdminLogin from "./pages/auth/admin/Login";
import ProtectPrivateAdminRoute from "./components/protectors/ProtectPrivateAdminRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AdminProfilePage from "./pages/dashboard/AdminProfile";
import UnlockScreen from "./pages/auth/admin/UnlockScreen";
import ExpenseDashboard from "./pages/dashboard/ExpenseDashboard";
import ReportDashboard from "./pages/dashboard/ReportManagement";
import AbyTechLocations from "./pages/Location";



// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const SuspenseWrapper = ({ children }) => {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

const router = createBrowserRouter([
  
  {
    path:'/',
    element: <ProtectPrivateAdminRoute><Outlet /></ProtectPrivateAdminRoute>,
    children:[
       { index: true, element: <Navigate to={'/dashboard'}></Navigate>},
       { 
        path: 'dashboard', 
        element: <SuspenseWrapper><DashboardLayout /> </SuspenseWrapper>,
        children:[
          {index:true , element:<DashboardHome />},
          {path:'expense' , element:<ExpenseDashboard />},
          {path:'report' , element:<ReportDashboard />},
          {path:'profile' , element:<AdminProfilePage />},
          
        ]
       },

    ]
  },
  {
    path: '/auth/admin/login',
    element: (
      <SuspenseWrapper>
        <AdminLogin />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/auth/admin/unlock',
    element: (
      <SuspenseWrapper>
        <UnlockScreen />
      </SuspenseWrapper>
    ),
  },
])




function App() {



  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App