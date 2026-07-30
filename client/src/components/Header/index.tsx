import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { LogOut, User, ChevronDown, LayoutDashboard, Users } from 'lucide-react';
import api from '../../lib/axios';
import type { User as UserType } from '../../types';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('offlineMode');
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Tableau de bord';
    if (location.pathname === '/candidates') return 'Candidats';
    if (location.pathname === '/candidates/create') return 'Nouveau candidat';
    if (location.pathname.includes('/edit')) return 'Modifier un candidat';
    if (location.pathname.startsWith('/candidates/')) return 'Détail candidat';
    return 'TiahMHeranto';
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
      isActive
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <header className="bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="Accueil TiahMHeranto Company"
            >
              <img
                src="/logo.svg"
                alt=""
                className="h-8 w-8"
                width={32}
                height={32}
              />
              <div className="hidden sm:block text-left">
                <p className="font-brand text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none group-hover:opacity-80 transition">
                  TiahMHeranto
                </p>
                <p className="font-brand text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mt-0.5">
                  Company
                </p>
              </div>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/candidates" className={linkClass}>
                <Users className="w-4 h-4" />
                Candidats
              </NavLink>
            </nav>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block" />
            <h1 className="hidden lg:block text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.email || 'Compte'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || 'user'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border z-20">
                  <div className="py-1 md:hidden border-b border-light-border dark:border-dark-border">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/candidates');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Candidats
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
