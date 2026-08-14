import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import MyLocations from './pages/MyLocations'
import LocationDetails from './pages/LocationDetails'

import HistoryPage from './pages/HistoryPage'
import Alerts from './pages/Alerts'
import ActivityAdvisor from './pages/ActivityAdvisor'
import Compare from './pages/Compare'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ReportIssue from './pages/ReportIssue'
import MyReports from './pages/MyReports'
import ReportDetails from './pages/ReportDetails'
import NotFound from './pages/NotFound'
import RouteRisk from './pages/RouteRisk'

import { AuthProvider, useAuth } from './auth'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated
    ? <AppLayout />
    : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/route-risk" element={<RouteRisk />} />

        {/* Protected Pages */}
        <Route element={<ProtectedRoute />}>

          {/* Main Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* My Locations */}
          <Route
            path="/locations"
            element={<MyLocations />}
          />

          <Route
            path="/locations/:locationId"
            element={<LocationDetails />}
          />

          {/* Location Details */}
          <Route
            path="/location-details"
            element={<LocationDetails />}
          />

          {/* Other Pages */}
          <Route
            path="/explore"
            element={<Explore />}
          />

          <Route
            path="/history"
            element={<HistoryPage />}
          />

          <Route
            path="/alerts"
            element={<Alerts />}
          />

          <Route
            path="/activity"
            element={<ActivityAdvisor />}
          />

          <Route
            path="/compare"
            element={<Compare />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* Pollution Reporting */}
          <Route
            path="/report"
            element={<ReportIssue />}
          />

          <Route
            path="/my-reports"
            element={<MyReports />}
          />

          <Route
            path="/my-reports/:reportId"
            element={<ReportDetails />}
          />

        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </AuthProvider>
  )
}