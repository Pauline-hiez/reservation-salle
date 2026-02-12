import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function LogoutButton() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="fixed bottom-6 right-6 z-50 hover:opacity-80 transition-opacity"
            title="Se déconnecter"
        >
            <img
                src="/assets/img/deco.png"
                alt="Déconnexion"
                className="w-14 h-14 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
            />
        </button>
    );
}

export default LogoutButton;
