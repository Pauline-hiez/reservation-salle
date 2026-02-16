import { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function Profil() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États pour la modification
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        debut: '',
        fin: ''
    });

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            setLoading(true);
            const data = await reservationService.getMyReservations();
            setReservations(data);
            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des réservations:', err);
            setError(err.message || 'Erreur lors du chargement des réservations');
        } finally {
            setLoading(false);
        }
    };

    // Ouvrir la modal de modification
    const openEditModal = (reservation) => {
        const debut = new Date(reservation.debut);
        const fin = new Date(reservation.fin);

        setEditingReservation(reservation);
        setFormData({
            titre: reservation.titre,
            debut: debut.toISOString().slice(0, 16),
            fin: fin.toISOString().slice(0, 16)
        });
        setShowEditModal(true);
        setError(null);
    };

    // Fermer la modal de modification
    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingReservation(null);
        setFormData({
            titre: '',
            debut: '',
            fin: ''
        });
        setError(null);
    };

    // Gérer les changements du formulaire
    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Mettre à jour la réservation
    const handleUpdateReservation = async (e) => {
        e.preventDefault();

        if (!formData.titre.trim()) {
            setError('Le titre est requis');
            return;
        }

        if (new Date(formData.debut) >= new Date(formData.fin)) {
            setError('La date de début doit être avant la date de fin');
            return;
        }

        try {
            setLoading(true);
            await reservationService.update(editingReservation.id, {
                titre: formData.titre,
                debut: new Date(formData.debut).toISOString(),
                fin: new Date(formData.fin).toISOString()
            });

            alert('Réservation modifiée avec succès !');
            await loadReservations();
            closeEditModal();
        } catch (err) {
            console.error('Erreur modification:', err);
            setError(err.response?.data?.error || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };



    // Fonction pour extraire le nom depuis l'email (partie avant @)
    const extractNameFromEmail = (email) => {
        if (!email) return '';
        const namePart = email.split('@')[0];
        // Remplacer les points, tirets et underscores par des espaces
        return namePart.replace(/[-_.]/g, ' ');
    };

    // Fonction pour capitaliser chaque mot
    const capitalizeWords = (str) => {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Fonction pour obtenir les initiales
    const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    };

    // Fonction pour formater la date d'inscription
    const formatInscriptionDate = (dateStr) => {
        if (!dateStr) return 'Non disponible';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Fonction pour déterminer le statut d'une réservation
    const getReservationStatus = (debut, fin) => {
        const now = new Date();
        const dateDebut = new Date(debut);
        const dateFin = new Date(fin);

        if (dateFin < now) {
            return { label: 'Terminé', color: 'text-red-400 font-bold' };
        } else if (dateDebut <= now && now <= dateFin) {
            return { label: 'En cours', color: 'text-green-600 font-bold' };
        } else {
            return { label: 'A venir', color: 'text-cyan-800 font-bold' };
        }
    };

    // Fonction pour formater la date et l'heure
    const formatDateTime = (debut, fin) => {
        const dateDebut = new Date(debut);
        const dateFin = new Date(fin);

        const dateStr = dateDebut.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const heureDebut = dateDebut.toLocaleTimeString('fr-FR', {
            hour: 'numeric',
            minute: '2-digit'
        }).replace(':', 'h');

        const heureFin = dateFin.toLocaleTimeString('fr-FR', {
            hour: 'numeric',
            minute: '2-digit'
        }).replace(':', 'h');

        return { time: `${heureDebut} - ${heureFin}`, date: dateStr };
    };

    // Fonction pour trier les réservations
    const sortReservations = (reservations) => {
        return [...reservations].sort((a, b) => {
            const now = new Date();
            const aDebut = new Date(a.debut);
            const aFin = new Date(a.fin);
            const bDebut = new Date(b.debut);
            const bFin = new Date(b.fin);

            // Déterminer le statut de chaque réservation
            const getStatus = (debut, fin) => {
                if (fin < now) return 'termine';
                if (debut <= now && now <= fin) return 'en_cours';
                return 'a_venir';
            };

            const statusA = getStatus(aDebut, aFin);
            const statusB = getStatus(bDebut, bFin);

            // Ordre de priorité : a_venir > en_cours > termine
            const priorite = { 'a_venir': 1, 'en_cours': 2, 'termine': 3 };

            if (priorite[statusA] !== priorite[statusB]) {
                return priorite[statusA] - priorite[statusB];
            }

            // Si même statut, trier par date
            // Pour "à venir" et "en cours" : ordre chronologique (plus tôt en premier)
            // Pour "terminé" : ordre chronologique (plus récent en premier)
            if (statusA === 'termine') {
                return bDebut - aDebut; // Plus récent en premier
            }
            return aDebut - bDebut; // Plus tôt en premier
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-4xl font-bold text-cyan-800 mb-6 text-center">Mon Profil</h2>

            {/* Section informations utilisateur */}
            {user && (
                <div className="bg-white rounded-lg border-2 border-cyan-800 shadow-xl p-6 mb-8 max-w-2xl mx-auto">
                    <div className="flex items-center gap-6">


                        {/* Informations */}
                        <div className="flex-1 rounded-lg p-4">
                            <div className="flex justify-center mb-8">
                                <img src="/assets/img/techspace-logo.webp" alt="Logo TechSpace" className="h-30" />
                            </div>
                            <div className="mb-3">
                                <p className="text-2xl text-cyan-800 font-bold">Nom :</p>
                                <p className="text-xl text-cyan-800 font-bold">
                                    {capitalizeWords(extractNameFromEmail(user.email))}
                                </p>
                            </div>

                            <div className="mb-3">
                                <p className="text-2xl text-cyan-800 font-bold">Email :</p>
                                <p className="text-xl text-cyan-700">
                                    {user.email}
                                </p>
                            </div>

                            <div className="mb-3">
                                <p className="text-2xl text-cyan-800 font-bold">Date d'inscription :</p>
                                <p className="text-xl text-cyan-700">
                                    {formatInscriptionDate(user.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-4xl font-bold text-cyan-800 mb-6 text-center">Mes réservations</h2>

            {loading && (
                <p className="text-center text-gray-600">Chargement des réservations...</p>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                    {error}
                </div>
            )}

            {!loading && !error && reservations.length === 0 && (
                <p className="text-center text-gray-600">Vous n'avez aucune réservation pour le moment.</p>
            )}

            {!loading && !error && reservations.length > 0 && (
                <div className="overflow-hidden rounded-md border border-cyan-800 shadow-2xl mb-8">
                    <table className="table-fixed mx-auto w-full">
                        <thead>
                            <tr className="bg-cyan-100">
                                <th className="border-r border-b border-cyan-800 bg-cyan-300 px-4 py-2 text-cyan-800 text-2xl">Date et heure</th>
                                <th className="border-r border-b border-cyan-800 bg-cyan-300 px-4 py-2 text-cyan-800 text-2xl">Objet</th>
                                <th className="border-r border-b border-cyan-800 bg-cyan-300 px-4 py-2 text-cyan-800 text-2xl">Statut</th>
                                <th className="border-b border-cyan-800 bg-cyan-300 px-4 py-2 text-cyan-800 text-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortReservations(reservations).map((reservation, index) => {
                                const status = getReservationStatus(reservation.debut, reservation.fin);
                                const dateTime = formatDateTime(reservation.debut, reservation.fin);
                                const isLast = index === reservations.length - 1;
                                const isPast = new Date(reservation.fin) < new Date();

                                return (
                                    <tr key={reservation.id} className={`${index % 2 === 0 ? 'bg-cyan-100' : 'bg-white'} hover:bg-cyan-50`}>
                                        <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-800 px-4 py-2 text-center text-cyan-800`}>
                                            <div className="font-bold">{dateTime.time}</div>
                                            <div className="text-sm font-bold">{dateTime.date}</div>
                                        </td>
                                        <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-800 px-4 py-2 text-cyan-800 text-center font-bold`}>
                                            <div>{reservation.titre}</div>
                                            {reservation.description && (
                                                <div className="text-sm text-gray-600">{reservation.description}</div>
                                            )}
                                        </td>
                                        <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-800 px-4 py-2 text-center ${status.color}`}>
                                            {status.label}
                                        </td>
                                        <td className={`${!isLast ? 'border-b' : ''} border-cyan-800 px-4 py-2 text-center`}>
                                            {!isPast && (
                                                <button
                                                    onClick={() => openEditModal(reservation)}
                                                    className="px-3 py-1 bg-orange-300 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold cursor-pointer"
                                                    title="Modifier"
                                                >
                                                    ✏️ Modifier
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de modification */}
            {showEditModal && editingReservation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-cyan-800">
                        <div className="flex items-start justify-between mb-6">
                            <h3 className="text-2xl font-bold text-cyan-600">
                                ✏️ Modifier la réservation
                            </h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpdateReservation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    name="titre"
                                    value={formData.titre}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Date et heure de début *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="debut"
                                    value={formData.debut}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Date et heure de fin *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="fin"
                                    value={formData.fin}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold disabled:opacity-50 cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading ? 'Sauvegarde...' : '💾 Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profil;
