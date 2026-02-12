import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Header() {
    const { isAuthenticated } = useAuth();

    return (
        <header className="bg-cyan-500 text-white text-2xl text-shadow-lg flex items-center justify-between px-6 py-4 shadow-[0_4px_15px_rgba(22,78,99,0.5)]">
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
                            Mon profil
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
                    <>
                        <NavLink
                            to="/register"
                            className={({ isActive }) =>
                                `hover:text-cyan-100 transition-colors ${isActive ? 'font-semibold' : ''}`
                            }
                        >
                            S'inscrire
                        </NavLink>
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `hover:text-cyan-100 transition-colors ${isActive ? 'font-semibold' : ''}`
                            }
                        >
                            Se connecter
                        </NavLink>
                    </>
                )}
            </nav>

            {/* Espace vide à droite pour l'équilibre visuel */}
            <div className="flex-shrink-0 w-10"></div>
        </header>
    );
}

export default Header;
