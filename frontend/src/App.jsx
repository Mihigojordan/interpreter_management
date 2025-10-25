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
import InterpreterDashboard from "./pages/dashboard/InterpreterDashboard";
import ReportDashboard from "./pages/dashboard/ReportManagement";
import AbyTechLocations from "./pages/Location";
import InterpreterLogin from "./pages/auth/interpreter/InterpreterLogin";
import ProtectPrivateInterpreterRoute from "./components/protectors/ProtectPrivateInterpreterRoute";
import InterpreterProfilePage from "./pages/dashboard/InterpreterProfilePage";
import InterpreterRequest from "./pages/dashboard/InterpreterRequest";
import InterpretationRequestDetails from "./pages/dashboard/InterpretationRequestDetails";
import InterpreterRequestDashboard from "./pages/dashboard/InterpreterRequestDashboard";
import RequestDetailsPage from "./pages/dashboard/RequestDetails";



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
    element: <ProtectPrivateAdminRoute><Outlet context={{role:'admin'}} /></ProtectPrivateAdminRoute>,
    children:[
       { index: true, element: <Navigate to={'/dashboard'}></Navigate>},
       { 
        path: 'dashboard', 
        element: <SuspenseWrapper><DashboardLayout /> </SuspenseWrapper>,
        children:[
          {index:true , element:<DashboardHome />},
          {path:'interpreter' , element:<InterpreterDashboard />},
          {path:'interpreter-request' , element:<InterpreterRequest />},
          {path:'interpreter-request/:id' , element:<InterpretationRequestDetails />},
          {path:'report' , element:<ReportDashboard />},
          {path:'profile' , element:<AdminProfilePage />},
          
        ]
       },

    ]
  },
  {
    path:'/interpreter',
    element: <ProtectPrivateInterpreterRoute><Outlet context={{role:'interpreter'}} /></ProtectPrivateInterpreterRoute>,
    children:[
       { index: true, element: <Navigate to={'/interpreter/dashboard'}></Navigate>},
       { 
        path: 'dashboard', 
        element: <SuspenseWrapper><DashboardLayout /> </SuspenseWrapper>,
        children:[
          {index:true , element:<DashboardHome />},
       
          {path:'profile' , element:<InterpreterProfilePage />},
          {path:'request' , element:<InterpreterRequestDashboard />},
          {path:'request/:id' , element:<RequestDetailsPage />},
          
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
    path: '/auth/interpreter/login',
    element: (
      <SuspenseWrapper>
        <InterpreterLogin />
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