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
                        to="/register"
                        className={({ isActive }) =>
                            `hover:text-cyan-100 transition-colors ${isActive ? 'font-semibold' : ''}`
                        }
                    >
                        Me connecter
                    </NavLink>
                )}
            </nav>

            {/* Icône de déconnexion à droite */}
            <div className="flex-shrink-0 flex items-center">
                {isAuthenticated ? (
                    <button
                        onClick={handleLogout}
                        className="hover:text-cyan-100 transition-colors"
                        title="Se déconnecter"
                    >
                        <img src="/assets/img/deco.png" alt="Déconnexion" className="w-10 h-10 hover:opacity-80 transition-opacity drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" />
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="hover:text-cyan-100 transition-colors"
                        title="Se connecter"
                    >
                        <img src="/assets/img/deco.png" alt="Connexion" className="w-10 h-10 hover:opacity-80 transition-opacity drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" />
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;
