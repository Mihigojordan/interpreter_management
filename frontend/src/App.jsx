import React, { Suspense, lazy } from "react";
import { BrowserRouter, createBrowserRouter, Navigate, Outlet, Route, RouterProvider, Routes } from "react-router-dom"
// const HomePage = lazy(() => import("./pages/HomePage"));
// const ContactUs = lazy(() => import("./pages/ContactUs"));
// const BlogPage = lazy(() => import("./pages/blogs/BlogPage"));
// const BlogSingle = lazy(() => import("./pages/blogs/Blogsingle"));
// const ServicePage = lazy(() => import("./pages/services/ServicePage"));
// const ServiceSingle = lazy(() => import("./pages/services/ServiceSingle"));
// const BlogContainer = lazy(() => import("../src/pages/blogs/blogContainer"));
// const AboutUs = lazy(() => import('./pages/about us/aboutUs'));
// const TeamMember = lazy(() => import('./pages/Team'))



// 🧩 Layouts (NOT lazy loaded)
// import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// 🧠 Protectors (usually small, no need to lazy load)
import ProtectPrivateAdminRoute from "./components/protectors/ProtectPrivateAdminRoute";
import ProtectPrivateInterpreterRoute from "./components/protectors/ProtectPrivateInterpreterRoute";

// 🚀 Lazy-loaded pages
const ProjectsPage = lazy(() => import("./pages/Projects/ProjectPages"));
const AdminLogin = lazy(() => import("./pages/auth/admin/Login"));
const UnlockScreen = lazy(() => import("./pages/auth/admin/UnlockScreen"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const AdminProfilePage = lazy(() => import("./pages/dashboard/AdminProfile"));
const InterpreterDashboard = lazy(() => import("./pages/dashboard/InterpreterDashboard"));
const ReportDashboard = lazy(() => import("./pages/dashboard/ReportManagement"));
const AbyTechLocations = lazy(() => import("./pages/Location"));
const InterpreterLogin = lazy(() => import("./pages/auth/interpreter/InterpreterLogin"));
const InterpreterProfilePage = lazy(() => import("./pages/dashboard/InterpreterProfilePage"));
const InterpreterRequest = lazy(() => import("./pages/dashboard/InterpreterRequest"));
const InterpretationRequestDetails = lazy(() => import("./pages/dashboard/InterpretationRequestDetails"));
const InterpreterRequestDashboard = lazy(() => import("./pages/dashboard/InterpreterRequestDashboard"));
const RequestDetailsPage = lazy(() => import("./pages/dashboard/RequestDetails"));
const InterpreterDetailView = lazy(() => import("./pages/dashboard/InterpreterViewMorePage"));



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
          {path:'interpreter/:id' , element:<InterpreterDetailView />},
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