import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function DecoButton({ isMobile = false }) {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isMobile) {
        return (
            <button
                onClick={handleLogout}
                className="hover:opacity-80 transition-opacity cursor-pointer py-2 flex items-center gap-2"
                title="Se déconnecter"
            >
                <img
                    src="/assets/icons/deco.png"
                    alt="Déconnexion"
                    className="w-8 h-8 invert"
                />

            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            className="right-6 z-50 hover:opacity-80 transition-opacity cursor-pointer"
            title="Se déconnecter"
        >
            <img
                src="/assets/icons/deco.png"
                alt="Déconnexion"
                className="w-10 h-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] invert transition-transform hover:scale-125 absolute inset-y-0 right-0 w-12 h-12 mr-10 mt-4"
            />
        </button>
    );
}

export default DecoButton;
