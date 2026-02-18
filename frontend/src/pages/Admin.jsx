import { useState, useEffect } from 'react';
import { reservationService, authService, salleService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const Admin = () => {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [users, setUsers] = useState([]);
    const [salles, setSalles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    // États pour la gestion des salles
    const [showAddSalleModal, setShowAddSalleModal] = useState(false);
    const [showEditSalleModal, setShowEditSalleModal] = useState(false);
    const [editingSalle, setEditingSalle] = useState(null);
    const [salleFormData, setSalleFormData] = useState({
        nom: '',
        description: '',
        capacite: '',
        image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // États pour l'affichage accordéon mobile
    const [showReservationsTable, setShowReservationsTable] = useState(false);
    const [showUsersTable, setShowUsersTable] = useState(false);
    const [showSallesTable, setShowSallesTable] = useState(false);

    // Fonction utilitaire pour afficher un message temporaire
    const showTemporaryMessage = (setter, message, duration = 3000) => {
        setter(message);
        setTimeout(() => setter(null), duration);
    };

    // Fonction utilitaire pour obtenir le bon chemin d'image
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('/uploads/')) {
            return `http://localhost:5000${imagePath}`;
        }
        return `/assets/img/${imagePath}`;
    };

    // Fonction pour capitaliser chaque mot
    const capitalizeWords = (str) => {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
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

    useEffect(() => {
        const loadData = async () => {
            await fetchReservations();
            await fetchUsers();
            await fetchSalles();
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

    const fetchSalles = async () => {
        try {
            const data = await salleService.getAll();
            setSalles(data);
        } catch (err) {
            console.error('Erreur lors du chargement des salles:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
            return;
        }

        try {
            await reservationService.delete(id);
            showTemporaryMessage(setSuccessMessage, 'Réservation supprimée avec succès');
            fetchReservations();
        } catch (err) {
            showTemporaryMessage(setError, err.message || 'Erreur lors de la suppression');
        }
    };

    // Gestion des utilisateurs
    const handleDeleteUser = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }

        try {
            await authService.deleteUser(id);
            showTemporaryMessage(setSuccessMessage, 'Utilisateur supprimé avec succès');
            fetchUsers();
        } catch (err) {
            showTemporaryMessage(setError, err.message || 'Erreur lors de la suppression');
        }
    };

    // Gestion des salles
    const openAddSalleModal = () => {
        setSalleFormData({
            nom: '',
            description: '',
            capacite: '',
            image: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setShowAddSalleModal(true);
        setError(null);
    };

    const closeAddSalleModal = () => {
        setShowAddSalleModal(false);
        setSalleFormData({
            nom: '',
            description: '',
            capacite: '',
            image: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setError(null);
    };

    const openEditSalleModal = (salle) => {
        setEditingSalle(salle);
        setSalleFormData({
            nom: salle.nom,
            description: salle.description || '',
            capacite: salle.capacite,
            image: salle.image || ''
        });
        setImageFile(null);
        // Afficher l'image existante si elle existe
        if (salle.image) {
            setImagePreview(`http://localhost:5000${salle.image}`);
        } else {
            setImagePreview(null);
        }
        setShowEditSalleModal(true);
        setError(null);
    };

    const closeEditSalleModal = () => {
        setShowEditSalleModal(false);
        setEditingSalle(null);
        setSalleFormData({
            nom: '',
            description: '',
            capacite: '',
            image: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setError(null);
    };

    const handleSalleFormChange = (e) => {
        setSalleFormData({
            ...salleFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Type de fichier non autorisé. Seuls les fichiers JPG, PNG, GIF et WebP sont acceptés.');
                return;
            }

            // Vérifier la taille (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Le fichier est trop volumineux. Taille maximale : 5MB');
                return;
            }

            setImageFile(file);
            
            // Créer un aperçu
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setSalleFormData({
            ...salleFormData,
            image: ''
        });
    };

    const handleCreateSalle = async (e) => {
        e.preventDefault();

        if (!salleFormData.nom.trim() || !salleFormData.capacite) {
            setError('Le nom et la capacité sont requis');
            return;
        }

        if (parseInt(salleFormData.capacite) <= 0) {
            setError('La capacité doit être supérieure à 0');
            return;
        }

        try {
            setLoading(true);
            let imagePath = salleFormData.image;

            // Si un fichier image a été sélectionné, l'uploader d'abord
            if (imageFile) {
                setUploadingImage(true);
                const uploadResult = await salleService.uploadImage(imageFile);
                imagePath = uploadResult.path;
                setUploadingImage(false);
            }

            await salleService.create({
                nom: salleFormData.nom,
                description: salleFormData.description,
                capacite: parseInt(salleFormData.capacite),
                image: imagePath
            });

            showTemporaryMessage(setSuccessMessage, 'Salle créée avec succès !');
            await fetchSalles();
            closeAddSalleModal();
        } catch (err) {
            console.error('Erreur création salle:', err);
            setError(err.message || 'Erreur lors de la création');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    const handleUpdateSalle = async (e) => {
        e.preventDefault();

        if (!salleFormData.nom.trim() || !salleFormData.capacite) {
            setError('Le nom et la capacité sont requis');
            return;
        }

        if (parseInt(salleFormData.capacite) <= 0) {
            setError('La capacité doit être supérieure à 0');
            return;
        }

        try {
            setLoading(true);
            let imagePath = salleFormData.image;

            // Si un nouveau fichier image a été sélectionné, l'uploader d'abord
            if (imageFile) {
                setUploadingImage(true);
                const uploadResult = await salleService.uploadImage(imageFile);
                imagePath = uploadResult.path;
                setUploadingImage(false);
            }

            await salleService.update(editingSalle.id, {
                nom: salleFormData.nom,
                description: salleFormData.description,
                capacite: parseInt(salleFormData.capacite),
                image: imagePath
            });

            showTemporaryMessage(setSuccessMessage, 'Salle modifiée avec succès !');
            await fetchSalles();
            closeEditSalleModal();
        } catch (err) {
            console.error('Erreur modification salle:', err);
            setError(err.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    const handleDeleteSalle = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ? Toutes les réservations associées seront également supprimées.')) {
            return;
        }

        try {
            await salleService.delete(id);
            showTemporaryMessage(setSuccessMessage, 'Salle supprimée avec succès');
            fetchSalles();
            fetchReservations(); // Recharger les réservations car certaines peuvent avoir été supprimées
        } catch (err) {
            showTemporaryMessage(setError, err.message || 'Erreur lors de la suppression');
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
            showTemporaryMessage(setSuccessMessage, 'Utilisateur modifié avec succès !');
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

            showTemporaryMessage(setSuccessMessage, 'Réservation modifiée avec succès !');
            await fetchReservations();
            closeEditModal();
        } catch (err) {
            console.error('Erreur modification:', err);
            setError(err.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6 md:py-8 flex justify-center items-center min-h-[50vh]">
                <Spinner />
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

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8 max-w-6xl mx-auto">
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
                <div className="bg-white rounded-lg border-2 border-cyan-950 shadow-xl p-4 sm:p-6">
                    <div className="text-center">
                        <p className="text-lg sm:text-xl md:text-2xl text-cyan-800 font-bold mb-2">Total des salles</p>
                        <p className="text-4xl sm:text-5xl md:text-6xl text-cyan-800 font-bold">{salles.length}</p>
                    </div>
                </div>
            </div>

            {/* Grille pour les deux tableaux côte à côte sur grands écrans */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Section Réservations */}
                <div className="overflow-x-auto">
                    <h2 
                        className="text-2xl sm:text-3xl font-bold text-cyan-800 mb-4 text-center cursor-pointer md:cursor-default flex items-center justify-center gap-2 md:block"
                        onClick={() => setShowReservationsTable(!showReservationsTable)}
                    >
                        <span>Réservations</span>
                        <span className="md:hidden text-xl">{showReservationsTable ? '▼' : '▶'}</span>
                    </h2>

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
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Date et heure</th>
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Salle</th>
                                            <th className="border-r border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Utilisateur</th>
                                            <th className="border-b border-cyan-950 bg-cyan-800 px-2 py-2 text-white text-sm lg:text-base whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((reservation, index) => {
                                    const isLast = index === reservations.length - 1;
                                    const dateTime = formatDateTime(reservation.debut, reservation.fin);
                                    return (
                                        <tr key={reservation.id} className={`${index % 2 === 0 ? 'bg-cyan-100' : 'bg-white'} hover:bg-cyan-50`}>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-cyan-800 text-center font-bold text-xs lg:text-sm whitespace-nowrap`}>
                                                {reservation.titre}
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center text-cyan-800 text-xs lg:text-sm`}>
                                                <div className="font-bold">{dateTime.time}</div>
                                                <div className="font-bold">{dateTime.date}</div>
                                            </td>
                                            <td className={`border-r ${!isLast ? 'border-b' : ''} border-cyan-950 px-2 py-2 text-center text-cyan-800 text-xs font-bold lg:text-sm whitespace-nowrap`}>
                                                {reservation.salle_nom || 'N/A'}
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
                    {showReservationsTable && (
                        <div className="md:hidden space-y-4 mb-8">
                        {reservations.map((reservation) => {
                            const dateTime = formatDateTime(reservation.debut, reservation.fin);
                            return (
                            <div key={reservation.id} className="bg-white border-2 border-cyan-950 rounded-lg shadow-lg p-4">
                                <div className="mb-3">
                                    <h3 className="text-lg font-bold text-cyan-800">{reservation.titre}</h3>
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
                                        <span className="text-sm text-gray-600 font-semibold">Salle :</span>
                                        <span className="text-sm text-cyan-800 font-bold">{reservation.salle_nom || 'N/A'}</span>
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
                                        className="flex-1 px-3 py-2 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                        title="Supprimer"
                                    >
                                        <img src="/assets/icons/delete.png" alt="Supprimer" className="w-6 h-6" /> Supprimer
                                    </button>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                    )}
                </>
            )}
                </div>

                {/* Section Utilisateurs */}
                <div className="overflow-x-auto">
                    <h2 
                        className="text-2xl sm:text-3xl font-bold text-cyan-800 mb-4 text-center cursor-pointer md:cursor-default flex items-center justify-center gap-2 md:block"
                        onClick={() => setShowUsersTable(!showUsersTable)}
                    >
                        <span>Utilisateurs</span>
                        <span className="md:hidden text-xl">{showUsersTable ? '▼' : '▶'}</span>
                    </h2>

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
                    {showUsersTable && (
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
                                            <span className={`text-sm font-bold px-2 py-1 rounded ${utilisateur.role === 'admin' ? 'text-cyan-800' : 'bg-gray-100 text-gray-700'}`}>
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
                                            className="flex-1 px-3 py-2 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    )}
                </>
            )}
                </div>
            </div>

            {/* Section Salles */}
            <div className="mb-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 
                        className="text-2xl sm:text-3xl font-bold text-cyan-800 text-center cursor-pointer md:cursor-default flex items-center justify-center gap-2 md:block flex-1"
                        onClick={() => setShowSallesTable(!showSallesTable)}
                    >
                        <span>Gestion des Salles</span>
                        <span className="md:hidden text-xl">{showSallesTable ? '▼' : '▶'}</span>
                    </h2>
                    <button
                        onClick={openAddSalleModal}
                        className="px-4 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold cursor-pointer flex items-center gap-2 text-sm md:text-base"
                    >
                        <span className="text-xl">+</span> Ajouter
                    </button>
                </div>

                {salles.length === 0 ? (
                    <p className="text-center text-gray-600 text-sm md:text-base">Aucune salle trouvée</p>
                ) : (
                    <>
                        {/* Vue desktop (cartes) */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {salles.map((salle) => (
                                <div key={salle.id} className="bg-white border-2 border-cyan-950 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                    {salle.image && (
                                        <img 
                                            src={getImageUrl(salle.image)} 
                                            alt={salle.nom}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h3 className="text-xl font-bold text-cyan-800 mb-2">{salle.nom}</h3>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{salle.description}</p>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-gray-600 font-semibold">Capacité :</span>
                                            <span className="text-sm text-cyan-800 font-bold">{salle.capacite} personnes</span>
                                        </div>
                                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                                            <button
                                                onClick={() => openEditSalleModal(salle)}
                                                className="flex-1 px-3 py-2 text-gray-800 rounded-lg transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                            >
                                                <img src="/assets/icons/update.png" alt="Modifier" className="w-5 h-5" /> Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSalle(salle.id)}
                                                className="flex-1 px-3 py-2 text-red-600 rounded-lg transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                            >
                                                <img src="/assets/icons/delete.png" alt="Supprimer" className="w-5 h-5" /> Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vue mobile (cards) */}
                        {showSallesTable && (
                            <div className="md:hidden space-y-4">
                                {salles.map((salle) => (
                                    <div key={salle.id} className="bg-white border-2 border-cyan-950 rounded-lg shadow-lg overflow-hidden">
                                        {salle.image && (
                                            <img 
                                                src={getImageUrl(salle.image)} 
                                                alt={salle.nom}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-cyan-800 mb-2">{salle.nom}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{salle.description}</p>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm text-gray-600 font-semibold">Capacité :</span>
                                                <span className="text-sm text-cyan-800 font-bold">{salle.capacite} personnes</span>
                                            </div>
                                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                                                <button
                                                    onClick={() => openEditSalleModal(salle)}
                                                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                                >
                                                    <img src="/assets/icons/update.png" alt="Modifier" className="w-5 h-5" /> Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSalle(salle.id)}
                                                    className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold cursor-pointer flex items-center justify-center gap-1"
                                                >
                                                    <img src="/assets/icons/delete.png" alt="Supprimer" className="w-5 h-5" /> Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
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

            {/* Modal d'ajout d'une salle */}
            {showAddSalleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 border-2 border-cyan-950 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-600 flex items-center gap-2">
                                <img src="/assets/icons/add.svg" alt="Ajouter" className="w-6 h-6 stroke-cyan-800" style={{ filter: 'invert(24%) sepia(72%) saturate(2038%) hue-rotate(166deg) brightness(95%) contrast(101%)' }} /> Ajouter une salle
                            </h3>
                            <button
                                onClick={closeAddSalleModal}
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

                        <form onSubmit={handleCreateSalle} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Nom de la salle *
                                </label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={salleFormData.nom}
                                    onChange={handleSalleFormChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                    placeholder="Ex: Salle Innovation"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={salleFormData.description}
                                    onChange={handleSalleFormChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                    placeholder="Description de la salle..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Capacité *
                                </label>
                                <input
                                    type="number"
                                    name="capacite"
                                    value={salleFormData.capacite}
                                    onChange={handleSalleFormChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                    placeholder="Ex: 15"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Formats acceptés : JPG, PNG, GIF, WebP (max 5MB)
                                </p>
                                
                                {/* Aperçu de l'image */}
                                {imagePreview && (
                                    <div className="mt-3 relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Aperçu" 
                                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                            title="Supprimer l'image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {uploadingImage && (
                                    <div className="mt-2 text-sm text-cyan-600 flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                                        Upload en cours...
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 sm:gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeAddSalleModal}
                                    className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold cursor-pointer text-sm md:text-base"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-3 sm:px-4 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold disabled:opacity-50 cursor-pointer text-sm md:text-base"
                                    disabled={loading}
                                >
                                    {loading ? 'Création...' : '💾 Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de modification d'une salle */}
            {showEditSalleModal && editingSalle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 border-2 border-cyan-950 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-600 flex items-center gap-2">
                                <img src="/assets/icons/update.png" alt="Modifier" className="w-8 h-8" /> Modifier la salle
                            </h3>
                            <button
                                onClick={closeEditSalleModal}
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

                        <form onSubmit={handleUpdateSalle} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Nom de la salle *
                                </label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={salleFormData.nom}
                                    onChange={handleSalleFormChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={salleFormData.description}
                                    onChange={handleSalleFormChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Capacité *
                                </label>
                                <input
                                    type="number"
                                    name="capacite"
                                    value={salleFormData.capacite}
                                    onChange={handleSalleFormChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-cyan-950 text-sm md:text-base"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Formats acceptés : JPG, PNG, GIF, WebP (max 5MB)
                                </p>
                                
                                {/* Aperçu de l'image */}
                                {imagePreview && (
                                    <div className="mt-3 relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Aperçu" 
                                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                            title="Supprimer l'image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {uploadingImage && (
                                    <div className="mt-2 text-sm text-cyan-600 flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                                        Upload en cours...
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 sm:gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEditSalleModal}
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