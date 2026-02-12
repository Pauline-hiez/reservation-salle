import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Header from '../components/Header.jsx';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-start justify-center bg-gradient-to-t from-cyan-100 to-cyan-50 pt-12 pb-12">
                <div className="bg-cyan-400 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    {/* Titre */}
                    <h1 className="text-4xl font-bold text-white text-center mb-6">Connexion</h1>

                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <img src="/assets/img/techspace-logo.webp" alt="Logo TechSpace" className="h-20 brightness-0 invert" />
                    </div>

                    {successMessage && <p className="text-green-700 bg-green-100 p-2 rounded mb-4 text-sm">{successMessage}</p>}
                    {error && <p className="text-red-600 bg-white/80 p-2 rounded mb-4 text-sm">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="text-white font-medium text-sm block mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border-2 border-transparent focus:border-cyan-600 focus:outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="text-white font-medium text-sm block mb-2">Mot de passe</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border-2 border-transparent focus:border-cyan-600 focus:outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Bouton Se connecter */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-lg rounded-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <p className="text-center text-white mt-6 text-sm">
                        Pas de compte ? <Link to="/register" className="font-semibold underline hover:text-cyan-100">S'inscrire</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;