import { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

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

    // Supprimer une réservation
    const handleDeleteReservation = async (reservation) => {
        // Demander confirmation
        const confirmation = window.confirm(
            `Êtes-vous sûr de vouloir supprimer la réservation "${reservation.titre}" ?`
        );

        if (!confirmation) return;

        try {
            setLoading(true);
            await reservationService.delete(reservation.id);
            alert('Réservation supprimée avec succès !');
            await loadReservations();
        } catch (err) {
            console.error('Erreur suppression:', err);
            setError(err.response?.data?.error || 'Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    const extractNameFromEmail = (email) => {
        if (!email) return '';
        const namePart = email.split('@')[0];
        return namePart.replace(/[-_.]/g, ' ');
    };

    const capitalizeWords = (str) => {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

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
        <div className="container mx-auto px-4 py-6 md:py-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-800 mb-4 md:mb-6 text-center">Mon Profil</h2>

            {/* Section informations utilisateur */}
            {user && (
                <div className="bg-white rounded-lg border-2 border-cyan-950 shadow-xl p-4 sm:p-6 mb-6 md:mb-8 max-w-2xl mx-auto">
                    {/* Logo en haut centré */}
                    <div className="flex justify-center mb-4 md:mb-8">
                        <img src="/assets/img/techspace-logo.webp" alt="Logo TechSpace" className="h-20 sm:h-24 md:h-30" />
                    </div>

                    {/* Informations et image */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        {/* Informations */}
                        <div className="flex-1 w-full">
                            <div className="mb-2 md:mb-3">
                                <p className="text-lg sm:text-xl md:text-2xl text-cyan-800 font-bold">Nom :</p>
                                <p className="text-base sm:text-lg md:text-xl text-cyan-800 font-bold">
                                    {capitalizeWords(extractNameFromEmail(user.email))}
                                </p>
                            </div>

                            <div className="mb-2 md:mb-3">
                                <p className="text-lg sm:text-xl md:text-2xl text-cyan-800 font-bold">Email :</p>
                                <p className="text-sm sm:text-base md:text-xl text-cyan-700 break-all">
                                    {user.email}
                                </p>
                            </div>

                            <div className="mb-2 md:mb-3">
                                <p className="text-lg sm:text-xl md:text-2xl text-cyan-800 font-bold">Date d'inscription :</p>
                                <p className="text-sm sm:text-base md:text-xl text-cyan-700">
                                    {formatInscriptionDate(user.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Image utilisateur */}
                        <div className="flex-shrink-0">
                            <img
                                src="/assets/icons/user.png"
                                alt="Icône utilisateur"
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-2 border-cyan-950 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-800 mb-4 md:mb-6 text-center">Mes réservations</h2>

            {loading && (
                <div className="flex justify-center py-8">
                    <Spinner />
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center text-sm md:text-base">
                    {error}
                </div>
            )}

            {!loading && !error && reservations.length === 0 && (
                <p className="text-center text-gray-600 text-sm md:text-base">Vous n'avez aucune réservation pour le moment.</p>
            )}

            {!loading && !error && reservations.length > 0 && (
                <>
                    {/* Vue desktop (tableau) - cachée sur mobile */}
                    <div className="hidden md:block overflow-hidden rounded-md border border-cyan-950 shadow-2xl mb-8">
                        <table className="table-fixed mx-auto w-full">
                            <thead>
                                <tr className="bg-cyan-100">
                                    <th className="border-r border-b border-cyan-950 bg-cyan-800 px-4 py-2 text-white text-base lg:text-xl xl:text-2xl">Date et heure</th>
                                    <th className="border-r border-b border-cyan-950 bg-cyan-800 px-4 py-2 text-white text-base lg:text-xl xl:text-2xl">Objet</th>
                                    <th className="border-r border-b border-cyan-950 bg-cyan-800 px-4 py-2 text-white text-base lg:text-xl xl:text-2xl">Statut</th>
                                    <th className="border-b border-cyan-950 bg-cyan-800 px-4 py-2 text-white text-base lg:text-xl xl:text-2xl">Actions</th>
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
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-4 py-2 text-center text-cyan-800`}>
                                                <div className="font-bold text-sm lg:text-base">{dateTime.time}</div>
                                                <div className="text-xs lg:text-sm font-bold">{dateTime.date}</div>
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-4 py-2 text-cyan-800 text-center font-bold text-sm lg:text-base`}>
                                                <div>{reservation.titre}</div>
                                                {reservation.description && (
                                                    <div className="text-xs lg:text-sm text-gray-600">{reservation.description}</div>
                                                )}
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-4 py-2 text-center ${status.color} text-sm lg:text-base`}>
                                                {status.label}
                                            </td>
                                            <td className={`${!isLast ? 'border-b' : ''} border-cyan-950 px-4 py-2 text-center`}>
                                                {!isPast && (
                                                    <div className="flex justify-evenly items-center">
                                                        <button
                                                            onClick={() => openEditModal(reservation)}
                                                            className="px-2 lg:px-3 py-1 text-gray-800 rounded-lg transition-colors font-semibold cursor-pointer transform hover:scale-150"
                                                            title="Modifier"
                                                        >
                                                            <img src="/assets/icons/update.png" alt="Modifier" className="w-7 h-7 lg:w-8 lg:h-8" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReservation(reservation)}
                                                            className="px-2 lg:px-3 py-1 text-red-600 rounded-lg transition-colors font-semibold cursor-pointer transform hover:scale-150"
                                                            title="Supprimer"
                                                            disabled={loading}
                                                        >
                                                            <img src="/assets/icons/delete.png" alt="Supprimer" className="w-7 h-7 lg:w-8 lg:h-8" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Vue mobile (cards) - visible uniquement sur mobile */}
                    <div className="md:hidden space-y-4 mb-8">
                        {sortReservations(reservations).map((reservation) => {
                            const status = getReservationStatus(reservation.debut, reservation.fin);
                            const dateTime = formatDateTime(reservation.debut, reservation.fin);
                            const isPast = new Date(reservation.fin) < new Date();

                            return (
                                <div key={reservation.id} className="bg-white border-2 border-cyan-950 rounded-lg shadow-lg p-4">
                                    <div className="mb-3">
                                        <h3 className="text-lg font-bold text-cyan-800 mb-2">{reservation.titre}</h3>
                                        {reservation.description && (
                                            <p className="text-sm text-gray-600">{reservation.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 font-semibold">Date :</span>
                                            <span className="text-sm text-cyan-800 font-bold">{dateTime.date}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 font-semibold">Horaire :</span>
                                            <span className="text-sm text-cyan-800 font-bold">{dateTime.time}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 font-semibold">Statut :</span>
                                            <span className={`text-sm font-bold ${status.color}`}>{status.label}</span>
                                        </div>
                                    </div>

                                    {!isPast && (
                                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                                            <button
                                                onClick={() => openEditModal(reservation)}
                                                className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                                title="Modifier"
                                            >
                                                <img src="/assets/icons/update.png" alt="Modifier" className="w-6 h-6" /> Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReservation(reservation)}
                                                className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                                title="Supprimer"
                                                disabled={loading}
                                            >
                                                <img src="/assets/icons/delete.png" alt="Supprimer" className="w-6 h-6" /> Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Modal de modification */}
            {showEditModal && editingReservation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 border-2 border-cyan-950 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-600 flex items-center gap-2">
                                <img src="/assets/icons/update.png" alt="Modifier" className="w-8 h-8" /> Modifier la réservation
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                />
                            </div>

                            <div className="flex gap-2 sm:gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold cursor-pointer text-sm md:text-base"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-3 sm:px-4 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold disabled:opacity-50 cursor-pointer text-sm md:text-base"
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
