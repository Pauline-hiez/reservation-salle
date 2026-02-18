import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salleService } from '../services/api';
import Spinner from '../components/Spinner';

export default function Salles() {
    const navigate = useNavigate();
    const [salles, setSalles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('/uploads/')) {
            return `http://localhost:5000${imagePath}`;
        }
        return `/assets/img/${imagePath}`;
    };

    useEffect(() => {
        loadSalles();
    }, []);

    const loadSalles = async () => {
        try {
            setLoading(true);
            const data = await salleService.getAll();
            setSalles(data);
            setError(null);
        } catch (err) {
            console.error('Erreur chargement salles:', err);
            setError('Erreur lors du chargement des salles');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* En-tête */}
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-800 mb-4">
                    Nos Salles
                </h1>
                <p className="text-base sm:text-lg text-cyan-700 max-w-3xl mx-auto">
                    Découvrez nos espaces modernes et équipés, conçus pour répondre à tous vos besoins de réunion et de collaboration.
                </p>
            </div>

            {salles.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">Aucune salle disponible pour le moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {salles.map((salle) => (
                        <div 
                            key={salle.id} 
                            onClick={() => navigate(`/planning?salle=${salle.id}`)}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-cyan-950 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            {/* Image de la salle */}
                            <div className="relative h-64 overflow-hidden">
                                {salle.image ? (
                                    <img 
                                        src={getImageUrl(salle.image)} 
                                        alt={salle.nom}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-300 flex items-center justify-center">
                                        <span className="text-6xl text-cyan-800">🏢</span>
                                    </div>
                                )}
                                {/* Badge capacité */}
                                <div className="absolute top-4 right-4 bg-cyan-800 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                    <span className="text-sm flex items-center gap-1">
                                        <img src="/assets/icons/capacite.svg" alt="users" className="w-4 h-4 brightness-0 invert" />
                                        {salle.capacite} pers.
                                    </span>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-cyan-800 mb-3">
                                    {salle.nom}
                                </h3>
                                
                                {salle.description && (
                                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                        {salle.description}
                                    </p>
                                )}

                                {/* Informations supplémentaires */}
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600 text-sm font-semibold">Capacité max :</span>
                                            <span className="text-cyan-800 text-sm font-bold">{salle.capacite} personnes</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Badge de disponibilité */}
                                <div className="mt-4 flex items-center justify-center">
                                    <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                        ✓ Disponible à la réservation
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
