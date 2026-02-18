import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import DecoButton from './DecoButton.jsx';

function Header() {
    const { isAuthenticated, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="relative z-50 bg-cyan-800 text-white shadow-2xl">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                {/* Logo à gauche */}
                <Link to='/' className="flex-shrink-0 z-50" onClick={closeMobileMenu}>
                    <img src="/assets/img/logo.png" className="w-12 sm:w-15 brightness-0 invert" alt="Logo TechSpace" />
                </Link>

                {/* Navigation desktop (cachée sur mobile) */}
                <nav className="hidden lg:flex flex-1 justify-center gap-20 xl:gap-22 text-lg xl:text-2xl">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `inline-block hover:text-cyan-950 hover:scale-125 transition-all ${isActive ? 'font-semibold' : ''}`
                        }
                    >
                        Accueil
                    </NavLink>
                    {isAuthenticated ? (
                        <>
                            <NavLink
                                to="/planning"
                                className={({ isActive }) =>
                                    `inline-block hover:text-cyan-950 hover:scale-125 transition-all ${isActive ? 'font-semibold' : ''}`
                                }
                            >
                                Planning
                            </NavLink>
                            <NavLink
                                to="/profil"
                                className={({ isActive }) =>
                                    `inline-block hover:text-cyan-950 hover:scale-125 transition-all ${isActive ? 'font-semibold' : ''}`
                                }
                            >
                                Mon profil
                            </NavLink>
                            {user?.role === 'admin' && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        `inline-block hover:text-cyan-950 hover:scale-125 transition-all ${isActive ? 'font-semibold' : ''}`
                                    }
                                >
                                   🛠️ Admin
                                </NavLink>
                            )}
                            <DecoButton />
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    `inline-block hover:text-cyan-950 hover:scale-125 transition-all ${isActive ? 'font-semibold' : ''}`
                                }
                            >
                                S'inscrire
                            </NavLink>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `inline-block hover:text-cyan-950 hover:scale-125 transition-all ${isActive ? 'font-semibold' : ''}`
                                }
                            >
                                Se connecter
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* Bouton hamburger (visible sur mobile uniquement) */}
                <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden z-50 p-2 focus:outline-none cursor-pointer"
                    aria-label="Menu"
                >
                    <div className="w-6 h-5 flex flex-col justify-between">
                        <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </div>
                </button>

                {/* Espace vide à droite pour l'équilibre visuel (desktop) */}
                <div className="hidden lg:block flex-shrink-0 w-10"></div>
            </div>

            {/* Menu mobile (overlay) */}
            <div className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeMobileMenu}>
                <nav
                    className={`fixed top-0 right-0 h-full w-64 bg-cyan-800 shadow-2xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col pt-20 px-6 space-y-8 text-xl">
                        <NavLink
                            to="/"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `inline-block hover:text-cyan-100 hover:scale-125 transition-all py-2 ${isActive ? 'font-semibold border-b-2 border-cyan-100' : ''}`
                            }
                        >
                            Accueil
                        </NavLink>
                        {isAuthenticated ? (
                            <>
                                <NavLink
                                    to="/planning"
                                    onClick={closeMobileMenu}
                                    className={({ isActive }) =>
                                        `inline-block hover:text-cyan-100 hover:scale-125 transition-all py-2 ${isActive ? 'font-semibold border-b-2 border-cyan-100' : ''}`
                                    }
                                >
                                    Planning
                                </NavLink>
                                <NavLink
                                    to="/profil"
                                    onClick={closeMobileMenu}
                                    className={({ isActive }) =>
                                        `inline-block hover:text-cyan-100 hover:scale-125 transition-all py-2 ${isActive ? 'font-semibold border-b-2 border-cyan-100' : ''}`
                                    }
                                >
                                    Mon profil
                                </NavLink>
                                {user?.role === 'admin' && (
                                    <NavLink
                                        to="/admin"
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) =>
                                            `inline-block hover:text-cyan-100 hover:scale-125 transition-all py-2 ${isActive ? 'font-semibold border-b-2 border-cyan-100' : ''}`
                                        }
                                    >
                                        Admin
                                    </NavLink>
                                )}
                                <div onClick={closeMobileMenu}>
                                    <DecoButton isMobile={true} />
                                </div>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="/register"
                                    onClick={closeMobileMenu}
                                    className={({ isActive }) =>
                                        `inline-block hover:text-cyan-950 hover:scale-125 transition-all py-2 ${isActive ? 'font-semibold border-b-2 border-cyan-100' : ''}`
                                    }
                                >
                                    S'inscrire
                                </NavLink>
                                <NavLink
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className={({ isActive }) =>
                                        `inline-block hover:text-cyan-950 hover:scale-125 transition-all py-2 ${isActive ? 'font-semibold border-b-2 border-cyan-100' : ''}`
                                    }
                                >
                                    Se connecter
                                </NavLink>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Header;
