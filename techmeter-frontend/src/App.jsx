import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Public & Auth Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import Contact from './pages/contact/Contact';

// Courses & Learning Pages
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import CreateCourse from './pages/courses/CreateCourse';
import EditCourse from './pages/courses/EditCourse';
import CourseCurriculum from './pages/courses/CourseCurriculum';
import MyCourses from './pages/courses/MyCourses';
import CoursePlayer from './pages/courses/CoursePlayer';

// Commerce & Account Pages
import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';
import Profile from './pages/profile/Profile';
import Wishlist from './pages/wishlist/Wishlist';
import Notifications from './pages/notifications/Notifications';
import Orders from './pages/orders/Orders';
import OrderDetail from './pages/orders/OrderDetail';
import Messages from './pages/messages/Messages';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderOrders from './pages/provider/ProviderOrders';
import ProviderTransactions from './pages/provider/ProviderTransactions';
import ProviderStudents from './pages/provider/ProviderStudents';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCourses from './pages/admin/AdminCourses';
import AdminOrders from './pages/admin/AdminOrders';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminReviews from './pages/admin/AdminReviews';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <Router>
            <Routes>
              {/* Fullscreen Video Player Route */}
              <Route
                path="/learn/:courseId"
                element={
                  <ProtectedRoute>
                    <CoursePlayer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/:courseId/lesson/:lessonId"
                element={
                  <ProtectedRoute>
                    <CoursePlayer />
                  </ProtectedRoute>
                }
              />

              {/* Admin Panel Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>

              {/* Main Public & Authenticated Application Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="verify-otp" element={<VerifyOtp />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="contact" element={<Contact />} />

                {/* Student Protected Routes */}
                <Route
                  path="my-learning"
                  element={
                    <ProtectedRoute requireRole="student">
                      <MyCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute requireRole="student">
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders/:id"
                  element={
                    <ProtectedRoute requireRole="student">
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Common Protected Routes */}
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />

                {/* Provider Protected Routes */}
                <Route
                  path="courses/create"
                  element={
                    <ProtectedRoute requireRole="provider">
                      <CreateCourse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="provider/courses/:id/edit"
                  element={
                    <ProtectedRoute requireRole="provider">
                      <EditCourse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="provider/courses/:id/curriculum"
                  element={
                    <ProtectedRoute requireRole="provider">
                      <CourseCurriculum />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="provider/dashboard"
                  element={
                    <ProtectedRoute requireRole="provider">
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="provider/orders"
                  element={
                    <ProtectedRoute requireRole="provider">
                      <ProviderOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="provider/transactions"
                  element={
                    <ProtectedRoute requireRole="provider">
                      <ProviderTransactions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="provider/students"
                  element={
                    <ProtectedRoute requireRole="provider">
                      <ProviderStudents />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
            </WishlistProvider>
        </AuthProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'text-xs font-semibold rounded-2xl shadow-xl border border-gray-100 bg-white text-gray-800 py-3 px-4',
            duration: 3500,
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
