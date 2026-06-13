import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-xl font-bold text-emerald-600">
          Splitwise Clone
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="text-slate-600 hover:text-emerald-600">
            Dashboard
          </Link>
          <Link to="/profile" className="text-slate-600 hover:text-emerald-600">
            Profile
          </Link>
          {user && (
            <span className="hidden text-slate-500 sm:inline">{user.name}</span>
          )}
          <button
            onClick={logout}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
