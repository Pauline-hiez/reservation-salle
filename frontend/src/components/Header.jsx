import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-cyan-500 text-white flex items-center justify-between px-6 py-4 shadow-md">
            {/* Logo à gauche */}
            <Link to='/' className="flex-shrink-0">
                <img src="/assets/img/techspace-logo.webp" className="w-32 brightness-0 invert" alt="Logo TechSpace" />
            </Link>

            {/* Navigation au centre */}
            <nav className="flex-1 flex justify-center gap-8">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `hover:text-cyan-100 transition-colors ${isActive ? 'font-semibold' : ''}`
                    }
                >
                    Accueil
                </NavLink>
                {isAuthenticated ? (
                    <>
                        <NavLink
                            to="/profil"
                            className={({ isActive }) =>
                                `hover:text-cyan-100 transition-colors ${isActive ? 'font-semibold' : ''}`
                            }
                        >
                            Authentification/Profil
                        </NavLink>
                        <NavLink
                            to="/planning"
                            className={({ isActive }) =>
                                `hover:text-cyan-100 transition-colors ${isActive ? 'font-semibold' : ''}`
                            }
                        >
                            Planning
                        </NavLink>
                    </>
                ) : (
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            `hover:text-cyan-100 transition-colors ${isActive ? 'font-semibold' : ''}`
                        }
                    >
                        Me connecter
                    </NavLink>
                )}
            </nav>

            {/* Icône de déconnexion à droite */}
            <div className="flex-shrink-0">
                {isAuthenticated ? (
                    <button
                        onClick={handleLogout}
                        className="hover:text-cyan-100 transition-colors p-2"
                        title="Se déconnecter"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-9 text-red-800 hover:text-red-600 transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="hover:text-cyan-100 transition-colors p-2"
                        title="Se connecter"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-800 hover:text-red-600 transition-colors drop-shadow-xl">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;
