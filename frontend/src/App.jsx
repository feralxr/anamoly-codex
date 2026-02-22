import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import GameFlowPage from './pages/GameFlowPage';
import { useAuthStore } from './store/useAuthStore';

function GuardedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/game/:slug" element={<GameFlowPage />} />
      <Route
        path="/profile"
        element={(
          <GuardedRoute>
            <ProfilePage />
          </GuardedRoute>
        )}
      />
    </Routes>
  );
}
