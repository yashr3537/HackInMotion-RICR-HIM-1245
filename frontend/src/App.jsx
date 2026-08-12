import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import MyLocations from './pages/MyLocations'
import HistoryPage from './pages/HistoryPage'
import Alerts from './pages/Alerts'
import ActivityAdvisor from './pages/ActivityAdvisor'
import Compare from './pages/Compare'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { AuthProvider, useAuth } from './auth'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/locations" element={<MyLocations />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/activity" element={<ActivityAdvisor />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
