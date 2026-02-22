import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-black text-stone-100 terminal-font">
      <header className="border-b border-red-900/60 p-4 flex items-center justify-between">
        <Link to="/" className="tracking-[0.4em] text-lime-300 glitch">ANOMALY</Link>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-stone-300">{user.username}</span>
              <Link className="btn-terminal" to="/profile">DOSSIER</Link>
              <button className="btn-terminal" onClick={logout}>LOGOUT</button>
            </>
          ) : (
            <Link className="btn-terminal" to="/auth">LOGIN / REGISTER</Link>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
