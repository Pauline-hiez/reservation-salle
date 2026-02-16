import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation des mots de passe
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            await authService.register({ email, password });
            navigate('/login', {
                replace: true,
                state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' }
            });
        } catch (err) {
            setError(err.message || 'Erreur d\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>

            <div className="min-h-screen flex items-start justify-center bg-gradient-to-t from-cyan-100 to-cyan-50 pt-12 pb-12">
                <div className="bg-cyan-400 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    {/* Titre */}
                    <h1 className="text-4xl font-bold text-white text-center mb-6">Inscription</h1>

                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <img src="/assets/img/techspace-logo.webp" alt="Logo TechSpace" className="h-20 brightness-0 invert" />
                    </div>

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
                            <label className="text-white font-medium text-sm block mb-1">Mot de passe</label>
                            <p className="text-white/90 text-xs mb-2">*6 caractères minimum</p>
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
                                    minLength="6"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border-2 border-transparent focus:border-cyan-600 focus:outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirmation mot de passe */}
                        <div>
                            <label className="text-white font-medium text-sm block mb-2">Confirmation mot de passe</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength="6"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border-2 border-transparent focus:border-cyan-600 focus:outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Bouton S'inscrire */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-lg rounded-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Inscription...' : 'S\'inscrire'}
                        </button>
                    </form>

                    <p className="text-center text-white mt-6 text-sm">
                        Déjà inscrit ? <Link to="/login" className="font-semibold underline hover:text-cyan-100">Se connecter</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Register;