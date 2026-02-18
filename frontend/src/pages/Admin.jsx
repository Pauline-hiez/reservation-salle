import { useState, useEffect } from 'react';
import { reservationService, authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Admin = () => {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // États pour la modification des réservations
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        debut: '',
        fin: ''
    });

    // États pour la modification des utilisateurs
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        email: '',
        role: '',
        password: ''
    });

    useEffect(() => {
        const loadData = async () => {
            await fetchReservations();
            await fetchUsers();
        };
        loadData();
    }, []);

    const fetchReservations = async () => {
        try {
            const data = await reservationService.getAll();
            setReservations(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des réservations');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Erreur lors du chargement des utilisateurs:', err);
            // Ne pas bloquer l'affichage si les utilisateurs ne se chargent pas
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
            return;
        }

        try {
            setDeleteError(null);
            await reservationService.delete(id);
            setSuccessMessage('Réservation supprimée avec succès');
            setTimeout(() => setSuccessMessage(''), 3000);
            // Rafraîchir la liste
            fetchReservations();
        } catch (err) {
            setDeleteError(err.message || 'Erreur lors de la suppression');
            setTimeout(() => setDeleteError(null), 3000);
        }
    };

    // Gestion des utilisateurs
    const handleDeleteUser = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }

        try {
            setDeleteError(null);
            await authService.deleteUser(id);
            setSuccessMessage('Utilisateur supprimé avec succès');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchUsers();
        } catch (err) {
            setDeleteError(err.message || 'Erreur lors de la suppression');
            setTimeout(() => setDeleteError(null), 3000);
        }
    };

    const openEditUserModal = (utilisateur) => {
        setEditingUser(utilisateur);
        setUserFormData({
            email: utilisateur.email,
            role: utilisateur.role,
            password: '' // Laisser vide, sera modifié uniquement si rempli
        });
        setShowEditUserModal(true);
        setError(null);
    };

    const closeEditUserModal = () => {
        setShowEditUserModal(false);
        setEditingUser(null);
        setUserFormData({
            email: '',
            role: '',
            password: ''
        });
        setError(null);
    };

    const handleUserFormChange = (e) => {
        setUserFormData({
            ...userFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        if (!userFormData.email.trim()) {
            setError('L\'email est requis');
            return;
        }

        try {
            setLoading(true);
            const updateData = {
                email: userFormData.email,
                role: userFormData.role
            };
            
            // N'inclure le mot de passe que s'il a été modifié
            if (userFormData.password.trim()) {
                updateData.password = userFormData.password;
            }

            await authService.updateUser(editingUser.id, updateData);
            setSuccessMessage('Utilisateur modifié avec succès !');
            setTimeout(() => setSuccessMessage(''), 3000);
            await fetchUsers();
            closeEditUserModal();
        } catch (err) {
            console.error('Erreur modification utilisateur:', err);
            setError(err.message || 'Erreur lors de la modification');
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

            setSuccessMessage('Réservation modifiée avec succès !');
            setTimeout(() => setSuccessMessage(''), 3000);
            await fetchReservations();
            closeEditModal();
        } catch (err) {
            console.error('Erreur modification:', err);
            setError(err.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fonction pour capitaliser chaque mot
    const capitalizeWords = (str) => {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6 md:py-8">
                <p className="text-center text-gray-600">Chargement des réservations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6 md:py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center text-sm md:text-base">
                    Erreur: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-800 mb-2 md:mb-4 text-center">Administration</h1>
            <p className="text-center text-cyan-700 mb-6 md:mb-8 text-sm md:text-base">Bienvenue {user?.email} (Administrateur)</p>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center text-sm md:text-base">
                    {successMessage}
                </div>
            )}
            {deleteError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center text-sm md:text-base">
                    {deleteError}
                </div>
            )}

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg border-2 border-cyan-950 shadow-xl p-4 sm:p-6">
                    <div className="text-center">
                        <p className="text-lg sm:text-xl md:text-2xl text-cyan-800 font-bold mb-2">Total des réservations</p>
                        <p className="text-4xl sm:text-5xl md:text-6xl text-cyan-800 font-bold">{reservations.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg border-2 border-cyan-950 shadow-xl p-4 sm:p-6">
                    <div className="text-center">
                        <p className="text-lg sm:text-xl md:text-2xl text-cyan-800 font-bold mb-2">Total des utilisateurs</p>
                        <p className="text-4xl sm:text-5xl md:text-6xl text-cyan-800 font-bold">{users.length}</p>
                    </div>
                </div>
            </div>

            {/* Grille pour les deux tableaux côte à côte sur grands écrans */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Section Réservations */}
                <div className="overflow-x-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mb-4 text-center">Réservations</h2>

                    {reservations.length === 0 ? (
                        <p className="text-center text-gray-600 text-sm md:text-base">Aucune réservation trouvée</p>
                    ) : (
                        <>
                            {/* Vue desktop (tableau) */}
                            <div className="hidden md:block overflow-x-auto rounded-md border border-cyan-950 shadow-2xl mb-8">
                                <table className="table-auto mx-auto w-full min-w-max">
                                    <thead>
                                        <tr className="bg-cyan-100">
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Titre</th>
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Début</th>
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Fin</th>
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Utilisateur</th>
                                            <th className="border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((reservation, index) => {
                                    const isLast = index === reservations.length - 1;
                                    return (
                                        <tr key={reservation.id} className={`${index % 2 === 0 ? 'bg-cyan-100' : 'bg-white'} hover:bg-cyan-50`}>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-cyan-800 text-center font-bold text-xs lg:text-sm whitespace-nowrap`}>
                                                {reservation.titre}
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center text-cyan-800 font-bold text-xs lg:text-sm whitespace-nowrap`}>
                                                {formatDate(reservation.debut)}
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center text-cyan-800 font-bold text-xs lg:text-sm whitespace-nowrap`}>
                                                {formatDate(reservation.fin)}
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center text-cyan-800 text-xs font-bold lg:text-sm whitespace-nowrap`}>
                                                {capitalizeWords(reservation.user_name || 'Utilisateur inconnu')}
                                            </td>
                                            <td className={`${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center`}>
                                                <div className="flex justify-evenly items-center">
                                                    <button
                                                        onClick={() => openEditModal(reservation)}
                                                        className="px-1 py-1 text-gray-800 rounded-lg transition-colors font-semibold cursor-pointer transform hover:scale-150"
                                                        title="Modifier"
                                                    >
                                                        <img src="/assets/icons/update.png" alt="Modifier" className="w-6 h-6" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(reservation.id)}
                                                        className="px-1 py-1 text-red-600 rounded-lg transition-colors font-semibold cursor-pointer transform hover:scale-150"
                                                        title="Supprimer"
                                                    >
                                                        <img src="/assets/icons/delete.png" alt="Supprimer" className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Vue mobile (cards) */}
                    <div className="md:hidden space-y-4 mb-8">
                        {reservations.map((reservation) => (
                            <div key={reservation.id} className="bg-white border-2 border-cyan-950 rounded-lg shadow-lg p-4">
                                <div className="mb-3">
                                    <h3 className="text-lg font-bold text-cyan-800">{reservation.titre}</h3>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 font-semibold">Début :</span>
                                        <span className="text-sm text-cyan-800 font-bold">{formatDate(reservation.debut)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 font-semibold">Fin :</span>
                                        <span className="text-sm text-cyan-800 font-bold">{formatDate(reservation.fin)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 font-semibold">Utilisateur :</span>
                                        <span className="text-sm text-cyan-800 font-bold">{capitalizeWords(reservation.user_name || 'Utilisateur inconnu')}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-gray-200">
                                    <button
                                        onClick={() => openEditModal(reservation)}
                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                        title="Modifier"
                                    >
                                        <img src="/assets/icons/update.png" alt="Modifier" className="w-6 h-6" /> Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(reservation.id)}
                                        className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                        title="Supprimer"
                                    >
                                        <img src="/assets/icons/delete.png" alt="Supprimer" className="w-6 h-6" /> Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
                </div>

                {/* Section Utilisateurs */}
                <div className="overflow-x-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mb-4 text-center">Utilisateurs</h2>

                    {users.length === 0 ? (
                        <p className="text-center text-gray-600 text-sm md:text-base">Aucun utilisateur trouvé</p>
                    ) : (
                        <>
                            {/* Vue desktop (tableau) */}
                            <div className="hidden md:block overflow-x-auto rounded-md border border-cyan-950 shadow-2xl mb-8">
                                <table className="table-auto mx-auto w-full min-w-max">
                                    <thead>
                                        <tr className="bg-cyan-100">
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Nom</th>
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Email</th>
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Rôle</th>
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Inscription</th>
                                            <th className="border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((utilisateur, index) => {
                                    const isLast = index === users.length - 1;
                                    const inscriptionDate = new Date(utilisateur.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    });
                                    return (
                                        <tr key={utilisateur.id} className={`${index % 2 === 0 ? 'bg-cyan-100' : 'bg-white'} hover:bg-cyan-50`}>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-cyan-800 text-center font-bold text-xs lg:text-sm whitespace-nowrap`}>
                                                {capitalizeWords(utilisateur.name || 'N/A')}
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center text-cyan-800 font-bold text-xs lg:text-sm whitespace-nowrap`}>
                                                {utilisateur.email}
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center text-cyan-800 font-bold text-xs lg:text-sm whitespace-nowrap`}>
                                                <span className={`px-2 py-1 rounded text-xs lg:text-sm ${utilisateur.role === 'admin' ? 'text-cyan-900 font-bold' : 'text-cyan-700'}`}>
                                                    {utilisateur.role}
                                                </span>
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center text-cyan-800 font-bold text-xs lg:text-sm whitespace-nowrap`}>
                                                {inscriptionDate}
                                            </td>
                                            <td className={`${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center`}>
                                                <div className="flex justify-evenly items-center">
                                                    <button
                                                        onClick={() => openEditUserModal(utilisateur)}
                                                        className="px-1 py-1 text-gray-800 rounded-lg transition-colors font-semibold cursor-pointer transform hover:scale-150"
                                                        title="Modifier"
                                                    >
                                                        <img src="/assets/icons/update.png" alt="Modifier" className="w-6 h-6" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(utilisateur.id)}
                                                        className="px-1 py-1 text-red-600 rounded-lg transition-colors font-semibold cursor-pointer transform hover:scale-150"
                                                        title="Supprimer"
                                                        disabled={utilisateur.id === user?.id}
                                                    >
                                                        <img 
                                                            src="/assets/icons/delete.png" 
                                                            alt="Supprimer" 
                                                            className={`w-6 h-6 ${utilisateur.id === user?.id ? 'opacity-30' : ''}`}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Vue mobile (cards) */}
                    <div className="md:hidden space-y-4 mb-8">
                        {users.map((utilisateur) => {
                            const inscriptionDate = new Date(utilisateur.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                            return (
                                <div key={utilisateur.id} className="bg-white border-2 border-cyan-950 rounded-lg shadow-lg p-4">
                                    <div className="mb-3">
                                        <h3 className="text-lg font-bold text-cyan-800">{capitalizeWords(utilisateur.name || 'N/A')}</h3>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 font-semibold">Email :</span>
                                            <span className="text-sm text-cyan-800 font-bold">{utilisateur.email}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 font-semibold">Rôle :</span>
                                            <span className={`text-sm font-bold px-2 py-1 rounded ${utilisateur.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {utilisateur.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 font-semibold">Inscription :</span>
                                            <span className="text-sm text-cyan-800 font-bold">{inscriptionDate}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                                        <button
                                            onClick={() => openEditUserModal(utilisateur)}
                                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                            title="Modifier"
                                        >
                                            <img src="/assets/icons/update.png" alt="Modifier" className="w-6 h-6" /> Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(utilisateur.id)}
                                            className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Supprimer"
                                            disabled={utilisateur.id === user?.id}
                                        >
                                            <img src="/assets/icons/delete.png" alt="Supprimer" className="w-6 h-6" /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
                </div>
            </div>

            {/* Modal de modification des réservations */}
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

            {/* Modal de modification des utilisateurs */}
            {showEditUserModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 border-2 border-cyan-950 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-600 flex items-center gap-2">
                                <img src="/assets/icons/update.png" alt="Modifier" className="w-8 h-8" /> Modifier l'utilisateur
                            </h3>
                            <button
                                onClick={closeEditUserModal}
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

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={userFormData.email}
                                    onChange={handleUserFormChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Rôle *
                                </label>
                                <select
                                    name="role"
                                    value={userFormData.role}
                                    onChange={handleUserFormChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                    disabled={editingUser.id === user?.id}
                                >
                                    <option value="user">Utilisateur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                                {editingUser.id === user?.id && (
                                    <p className="text-xs text-gray-500 mt-1">Vous ne pouvez pas modifier votre propre rôle</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Nouveau mot de passe (optionnel)
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={userFormData.password}
                                    onChange={handleUserFormChange}
                                    placeholder="Laisser vide pour ne pas modifier"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                />
                            </div>

                            <div className="flex gap-2 sm:gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEditUserModal}
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
};

export default Admin;