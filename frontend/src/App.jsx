import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import { useAuthContext } from "./hooks/useAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Checkout from "./pages/Common/Checkout";
import PaymentSuccess from "./pages/Common/PaymentSuccess";
import CardInfo from "./components/CardInfo";
import PurchaseHistory from "./components/PurchaseHistory";
import Profile from "./components/Profile";
import OrderTracking from "./components/OrderTraking";
import ContactProvider from "./components/contactProvider";
import PurchasePaymentPage from "./pages/Provider/purchasePaymentPage";
// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const SignupPage = lazy(() => import("./pages/auth/Signup"));
const LoginPage = lazy(() => import("./pages/auth/Signin"));
const Provider = lazy(() => import("./pages/Provider/provider"));
const Admin = lazy(() => import("./pages/admin/admin"));
const UserManage = lazy(() => import("./pages/admin/userManage"));
const CustomerSms = lazy(() => import("./pages/admin/customerSms"));
const About = lazy(() => import("./pages/Common/about"));
const Contact = lazy(() => import("./pages/Common/contact"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const Cart = lazy(() => import("./pages/Common/Cart"));
const AddCategories = lazy(() => import("./pages/admin/addCategories"));
const ProviderManage = lazy(() => import("./pages/admin/providerManage"));
const ProviderDashboard = lazy(() => import("./pages/Provider/providerDashboard"));
const CustomerMessage = lazy(() => import("./pages/Provider/customerSms"));
const SuccessMessage = lazy(() => import("./pages/Common/successMessage"));
const AdminSales = lazy(() => import("./pages/admin/sales"));
const ProvideSales = lazy(() => import("./pages/Provider/sales"));
const UseronProviderPage= lazy(() => import("./pages/Provider/useronProviderPage"));

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <div className="container mx-auto px-4 py-4">{children}</div>
  </>
);

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles, user }) => {
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.accountType))
    return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <Routes>
            {/* Public Route */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <PublicLayout>
                  <Cart />
                </PublicLayout>
              }
            />

            {/* Auth Routes */}
            {/* <Route
              path="/signup"
              element={
                !user ? (
                  <PublicLayout>
                    <SignupPage />
                  </PublicLayout>
                ) : ( 

                  <Navigate to="/" />
                  if(user.accountType !== 'provider') 
                    <Navigate to="/provider/dashboard" />
                    else if(user.accountType !== 'admin')
                      <Navigate to="/admin" />
                )
              }
            /> */}   
            <Route
  path="/signup"
  element={
    !user ? (
      <PublicLayout>
        <SignupPage />
      </PublicLayout>
    ) : user.accountType === "provider" ? (
      <Navigate to="/provider/dashboard" />
    ) : user.accountType === "admin" ? (
      <Navigate to="/admin" />
    ) : (
      <Navigate to="/" />
    )
  }
/>


            {/* <Route
              path="/login"
              element={
                !user ? (
                  <PublicLayout>  
                    <LoginPage />
                  </PublicLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            /> */}  


<Route
  path="/login"
  element={
    !user ? (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    ) : user.accountType === "provider" ? (
      <Navigate to="/provider/dashboard" />
    ) : user.accountType === "admin" ? (
      <Navigate to="/admin" />
    ) : (
      <Navigate to="/" />
    )
  }
/>

            <Route
              path="/contact/:email"
              element={
                user ? (
                  <PublicLayout>
                    <ContactProvider />
                  </PublicLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Provider Route */}
            <Route
              path="/provider/*"
              element={
                <ProtectedRoute user={user} allowedRoles={["provider"]}>
                  <PublicLayout>
                   <Provider />
                  
                  </PublicLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/card-info/:id"
              element={
                !user ? (
                  <Navigate to="/login" />
                ) : (
                  <PublicLayout>
                    <CardInfo />
                  </PublicLayout>
                )
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <UserManage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/providers"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <ProviderManage />
                  {/* <UserManage /> */}
                </ProtectedRoute>
              }
            />
      <Route
              path="/admin/sales"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <AdminSales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sms"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <CustomerSms />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <AddCategories />
                </ProtectedRoute>
              }
            />

            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["provider"]}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/purchase-payment"
              element={
                <ProtectedRoute user={user} allowedRoles={["provider"]}>
                  <PurchasePaymentPage />
                </ProtectedRoute>
              }
            />  
             <Route
              path="/provider/users"
              element={
                <ProtectedRoute user={user} allowedRoles={["provider"]}>
                  <UseronProviderPage/>
                </ProtectedRoute>
              }
            />  
            <Route
              path="/provider/sales"
              element={
                <ProtectedRoute user={user} allowedRoles={["provider"]}>
                  <ProvideSales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/sms"
              element={
                <ProtectedRoute user={user} allowedRoles={["provider"]}>
                  <CustomerMessage />
                </ProtectedRoute>
              }
            />

            {/* About Route */}
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              }
            />

            {/* Contact Route */}
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <Contact />
                </PublicLayout>
              }
            />

            {/* Purchase History Route */}
            <Route
              path="/order-history"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["admin", "buyer", "provider"]}
                >
                  <PublicLayout>
                    <PurchaseHistory />
                  </PublicLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-tracking"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin", "buyer", "provider"]}>
                  <PublicLayout>
                    <OrderTracking />
                  </PublicLayout>
                </ProtectedRoute>
              } />
            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin", "buyer", "provider"]}>
                  <PublicLayout>
                    <Profile />
                  </PublicLayout>
                </ProtectedRoute>
              }
            />
            {/* Checkout Route */}
            <Route path="/checkout" element={<Checkout />} />

            {/* Payment Success Route */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/success-message" element={<SuccessMessage />} />
            {/* <Route path="/order-tracking" element={<OrderTraking />} /> */}

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFoundPage />
                </PublicLayout>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
