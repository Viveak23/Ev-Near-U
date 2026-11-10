import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { FindChargersPage } from './pages/FindChargersPage';
import { ChargerDetailsPage } from './pages/ChargerDetailsPage';
import { PostChargerPage } from './pages/PostChargerPage';
import { LiveSessionPage } from './pages/LiveSessionPage';
import { DashboardPage } from './pages/DashboardPage';
import { EarningsPage } from './pages/EarningsPage';
import { InvoicePage } from './pages/InvoicePage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/find-chargers" element={<FindChargersPage />} />
                <Route path="/charger/:id" element={<ChargerDetailsPage />} />
                <Route
                  path="/post-charger"
                  element={
                    <ProtectedRoute>
                      <PostChargerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/session/:id"
                  element={
                    <ProtectedRoute>
                      <LiveSessionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/session/live"
                  element={
                    <ProtectedRoute>
                      <LiveSessionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/earnings"
                  element={
                    <ProtectedRoute>
                      <EarningsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoice/:id"
                  element={
                    <ProtectedRoute>
                      <InvoicePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/account" element={<Navigate to="/profile" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
