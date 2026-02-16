import { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Planning() {
    const moisNoms = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const moisNomsAbr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    const aujourdHui = new Date();
    const [vue, setVue] = useState('semaine'); // 'jour', 'semaine', 'mois', 'annee'
    const [annee, setAnnee] = useState(aujourdHui.getFullYear());
    const [mois, setMois] = useState(aujourdHui.getMonth());
    const [jour, setJour] = useState(aujourdHui.getDate());
    const nbJours = new Date(annee, mois + 1, 0).getDate();

    // États pour les réservations
    const [reservations, setReservations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        duree: 1 // durée en heures
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingReservationId, setEditingReservationId] = useState(null);
    const { user } = useAuth();

    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const joursSemaineAbr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // Fonction pour capitaliser chaque mot
    const capitalizeWords = (str) => {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Charger les réservations au montage du composant et lors des changements de période
    useEffect(() => {
        loadReservations();
    }, [annee, mois, vue]);

    // Charger les réservations
    const loadReservations = async () => {
        try {
            setLoading(true);
            const reservations = await reservationService.getAll();
            setReservations(reservations);
            setError(null);
        } catch (err) {
            console.error('Erreur chargement réservations:', err);
            setError('Erreur lors du chargement des réservations');
        } finally {
            setLoading(false);
        }
    };

    // Ouvrir la modal de réservation
    const openModal = (date, heure) => {
        const dateDebut = new Date(date);
        dateDebut.setHours(heure, 0, 0, 0);

        // Vérifier si le créneau est dans le passé
        const maintenant = new Date();
        if (dateDebut <= maintenant) {
            setError('Vous ne pouvez pas réserver sur un créneau passé ou en cours');
            return;
        }

        setSelectedSlot({ date, heure, dateDebut });
        setFormData({ titre: '', duree: 1 });
        setShowModal(true);
        setError(null);
    };

    // Fermer la modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedSlot(null);
        setFormData({ titre: '', duree: 1 });
        setError(null);
        setIsEditing(false);
        setEditingReservationId(null);
    };

    // Ouvrir la modal de sélection d'horaire pour la vue mois
    const openTimeSelectionModal = (dateStr) => {
        setSelectedDate(dateStr);
        setShowTimeModal(true);
        setError(null);
    };

    // Fermer la modal de sélection d'horaire
    const closeTimeModal = () => {
        setShowTimeModal(false);
        setSelectedDate(null);
        setError(null);
    };

    // Ouvrir la modal de détails d'une réservation
    const openDetailsModal = (reservation, e) => {
        e.stopPropagation();
        setSelectedReservation(reservation);
        setShowDetailsModal(true);
    };

    // Fermer la modal de détails
    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedReservation(null);
    };

    // Ouvrir la modal en mode édition
    const openEditModal = (reservation, e) => {
        if (e) e.stopPropagation();

        // Fermer la modal de détails si elle est ouverte
        setShowDetailsModal(false);

        // Vérifier que c'est bien la réservation de l'utilisateur
        if (Number(reservation.users_id) !== Number(user?.id)) {
            setError("Vous ne pouvez modifier que vos propres réservations");
            return;
        }

        const debut = new Date(reservation.debut);
        const fin = new Date(reservation.fin);
        const dureeHeures = Math.round((fin - debut) / (1000 * 60 * 60));

        // Préparer les données pour le formulaire
        setIsEditing(true);
        setEditingReservationId(reservation.id);
        setFormData({
            titre: reservation.titre,
            duree: dureeHeures
        });
        setSelectedSlot({
            date: debut.toISOString().split('T')[0],
            heure: debut.getHours(),
            dateDebut: debut
        });
        setShowModal(true);
        setError(null);
    };

    // Sélectionner un horaire depuis la modal
    const selectTimeSlot = (heure) => {
        closeTimeModal();
        openModal(selectedDate, heure);
    };

    // Gérer les changements dans le formulaire
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Créer ou modifier la réservation
    const handleCreateReservation = async (e) => {
        e.preventDefault();

        if (!formData.titre.trim()) {
            setError('Le titre est requis');
            return;
        }

        try {
            setLoading(true);

            const debut = new Date(selectedSlot.dateDebut);
            const fin = new Date(debut);
            fin.setHours(debut.getHours() + parseInt(formData.duree));

            // Vérifier que le créneau n'est pas dans le passé (sauf en mode édition)
            if (!isEditing && debut <= new Date()) {
                setError('Vous ne pouvez pas réserver sur un créneau passé ou en cours');
                setLoading(false);
                return;
            }

            const reservationData = {
                titre: formData.titre,
                debut: debut.toISOString(),
                fin: fin.toISOString()
            };

            if (isEditing && editingReservationId) {
                // MODE ÉDITION
                await reservationService.update(editingReservationId, reservationData);
                alert('Réservation modifiée avec succès !');
            } else {
                // MODE CRÉATION
                await reservationService.create(reservationData);
                alert('Réservation créée avec succès !');
            }

            await loadReservations();
            closeModal();
        } catch (err) {
            console.error('Erreur réservation:', err);
            setError(err.response?.data?.error || err.message || 'Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    // Supprimer une réservation
    const handleDeleteReservation = async (reservation, e) => {
        if (e) e.stopPropagation();

        // Vérifier que c'est bien la réservation de l'utilisateur
        if (Number(reservation.users_id) !== Number(user?.id)) {
            setError("Vous ne pouvez supprimer que vos propres réservations");
            return;
        }

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
            closeDetailsModal();
        } catch (err) {
            console.error('Erreur suppression:', err);
            setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    // Vérifier si un créneau est réservé
    const isSlotReserved = (date, heure) => {
        return reservations.some(reservation => {
            const debut = new Date(reservation.debut);
            const fin = new Date(reservation.fin);
            const slotDate = new Date(date);
            slotDate.setHours(heure, 0, 0, 0);
            const slotEnd = new Date(slotDate);
            slotEnd.setHours(heure + 1, 0, 0, 0);

            return (debut < slotEnd && fin > slotDate);
        });
    };

    // Obtenir les réservations pour un créneau
    const getReservationsForSlot = (date, heure) => {
        return reservations.filter(reservation => {
            const debut = new Date(reservation.debut);
            const fin = new Date(reservation.fin);
            const slotDate = new Date(date);
            slotDate.setHours(heure, 0, 0, 0);
            const slotEnd = new Date(slotDate);
            slotEnd.setHours(heure + 1, 0, 0, 0);

            return (debut < slotEnd && fin > slotDate);
        });
    };

    // Vérifier si un créneau est dans le passé ou en cours
    const isSlotPast = (date, heure) => {
        const slotDate = new Date(date);
        slotDate.setHours(heure, 0, 0, 0);
        const maintenant = new Date();
        return slotDate <= maintenant;
    };

    // Choix d'affichage par jour, semaine, mois ou année
    const precedent = () => {
        if (vue === 'jour') {
            const dateActuelle = new Date(annee, mois, jour);
            dateActuelle.setDate(dateActuelle.getDate() - 1);
            setJour(dateActuelle.getDate());
            setMois(dateActuelle.getMonth());
            setAnnee(dateActuelle.getFullYear());
        } else if (vue === 'semaine') {
            const dateActuelle = new Date(annee, mois, jour);
            dateActuelle.setDate(dateActuelle.getDate() - 7);
            setJour(dateActuelle.getDate());
            setMois(dateActuelle.getMonth());
            setAnnee(dateActuelle.getFullYear());
        } else if (vue === 'mois') {
            if (mois === 0) {
                setMois(11);
                setAnnee(annee - 1);
            } else {
                setMois(mois - 1);
            }
        } else if (vue === 'annee') {
            setAnnee(annee - 1);
        }
    };

    const suivant = () => {
        if (vue === 'jour') {
            const dateActuelle = new Date(annee, mois, jour);
            dateActuelle.setDate(dateActuelle.getDate() + 1);
            setJour(dateActuelle.getDate());
            setMois(dateActuelle.getMonth());
            setAnnee(dateActuelle.getFullYear());
        } else if (vue === 'semaine') {
            const dateActuelle = new Date(annee, mois, jour);
            dateActuelle.setDate(dateActuelle.getDate() + 7);
            setJour(dateActuelle.getDate());
            setMois(dateActuelle.getMonth());
            setAnnee(dateActuelle.getFullYear());
        } else if (vue === 'mois') {
            if (mois === 11) {
                setMois(0);
                setAnnee(annee + 1);
            } else {
                setMois(mois + 1);
            }
        } else if (vue === 'annee') {
            setAnnee(annee + 1);
        }
    };

    // Obtenir le titre selon la vue
    const getTitre = () => {
        if (vue === 'jour') {
            return `${jour} ${moisNoms[mois]} ${annee}`;
        } else if (vue === 'semaine') {
            const dateDebut = getDebutSemaine();
            const dateFin = new Date(dateDebut);
            dateFin.setDate(dateFin.getDate() + 6);
            return `Semaine du ${dateDebut.getDate()} ${moisNomsAbr[dateDebut.getMonth()]} au ${dateFin.getDate()} ${moisNomsAbr[dateFin.getMonth()]} ${annee}`;
        } else if (vue === 'mois') {
            return `${moisNoms[mois]} ${annee}`;
        } else {
            return `${annee}`;
        }
    };

    // Obtenir le début de la semaine (lundi)
    const getDebutSemaine = () => {
        const date = new Date(annee, mois, jour);
        const jourSemaine = date.getDay();
        const diff = jourSemaine === 0 ? -6 : 1 - jourSemaine;
        const lundi = new Date(date);
        lundi.setDate(date.getDate() + diff);
        return lundi;
    };

    // Obtenir les jours de la semaine
    const getJoursSemaine = () => {
        const debut = getDebutSemaine();
        const jours = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(debut);
            date.setDate(debut.getDate() + i);
            jours.push(date);
        }
        return jours;
    };

    // Premier jour du mois (0=dimanche, 1=lundi...)
    const premierJour = new Date(annee, mois, 1).getDay();
    const decalage = premierJour === 0 ? 6 : premierJour - 1;

    // Calculer les jours du mois précédent à afficher
    const joursMoisPrecedent = new Date(annee, mois, 0).getDate();
    const jours = [];

    // Ajouter les jours du mois précédent
    for (let i = decalage - 1; i >= 0; i--) {
        const jourPrecedent = joursMoisPrecedent - i;
        jours.push({
            type: 'autre-mois',
            numero: jourPrecedent,
            key: `prev-${jourPrecedent}`
        });
    }

    // Ajouter tous les jours du mois actuel
    for (let jour = 1; jour <= nbJours; jour++) {
        const dateStr = `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
        const dateJour = new Date(dateStr + "T00:00:00");
        const estPasse = dateJour < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());

        jours.push({
            type: 'jour-actuel',
            numero: jour,
            date: dateStr,
            estPasse,
            key: `jour-${jour}`
        });
    }

    // Compléter avec les jours du mois suivant pour remplir la grille
    const joursRestants = 42 - jours.length; // 6 semaines * 7 jours
    for (let i = 1; i <= joursRestants; i++) {
        jours.push({
            type: 'autre-mois',
            numero: i,
            key: `next-${i}`
        });
    }

    // Rendu de la vue jour
    const renderVueJour = () => {
        const dateActuelle = new Date(annee, mois, jour);
        const dateStr = `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
        const estPasse = dateActuelle < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
        const horaires = Array.from({ length: 11 }, (_, i) => i + 8); // 8h à 19h

        return (
            <div className="bg-white rounded-lg shadow-xl/30 overflow-hidden mb-8">
                <div className="p-6">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-cyan-600">
                            {joursSemaine[dateActuelle.getDay() === 0 ? 6 : dateActuelle.getDay() - 1]}
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {horaires.map((heure) => {
                            const isReserved = isSlotReserved(dateStr, heure);
                            const slotReservations = getReservationsForSlot(dateStr, heure);
                            const isPast = isSlotPast(dateStr, heure);
                            const isMyReservation = slotReservations.some(res => {
                                console.log('Comparaison:', { res_users_id: res.users_id, user_id: user?.id, match: Number(res.users_id) === Number(user?.id) });
                                return Number(res.users_id) === Number(user?.id);
                            });

                            let bgClass = 'bg-white hover:bg-cyan-50 cursor-pointer';
                            if (isReserved) {
                                bgClass = isMyReservation ? 'bg-amber-200 cursor-not-allowed' : 'bg-red-300 cursor-not-allowed';
                            } else if (isPast) {
                                bgClass = 'bg-gray-200 cursor-not-allowed';
                            }

                            return (
                                <div
                                    key={`horaire-${heure}`}
                                    className={`p-4 border border-cyan-200 rounded ${bgClass} transition-colors`}
                                    onClick={() => !isPast && !isReserved && openModal(dateStr, heure)}
                                >
                                    <span className="font-semibold text-cyan-700">{heure}h00 - {heure + 1}h00</span>
                                    {isReserved && slotReservations.map(res => (
                                        <div key={res.id} className="mt-2 text-sm text-cyan-900 font-medium">
                                            🔒 {res.titre}
                                            {res.user_name && <p className="text-xs text-cyan-700 mt-1">👤 {capitalizeWords(res.user_name)}</p>}
                                            {res.description && <p className="text-xs text-cyan-700">{res.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Rendu de la vue semaine
    const renderVueSemaine = () => {
        const joursSemaineVue = getJoursSemaine();
        const horaires = Array.from({ length: 11 }, (_, i) => i + 8); // 8h à 19h

        return (
            <div className="bg-white rounded-lg shadow-xl/30 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <div className="min-w-full inline-block">
                        <div className="grid grid-cols-8 border-l border-t border-cyan-800">
                            {/* En-tête vide pour la colonne des horaires */}
                            <div className="bg-cyan-400 text-white font-semibold text-center py-3 border-r border-b border-cyan-800">
                                Heure
                            </div>
                            {/* En-têtes des jours */}
                            {joursSemaineVue.map((date, index) => {
                                const estPasse = date < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
                                return (
                                    <div
                                        key={`jour-${index}`}
                                        className={`${estPasse ? 'bg-cyan-300' : 'bg-cyan-400'
                                            } text-white font-semibold text-center py-3 border-r border-b border-cyan-800`}
                                    >
                                        <div>{joursSemaineAbr[index]}</div>
                                        <div className="text-sm">{date.getDate()}/{date.getMonth() + 1}</div>
                                    </div>
                                );
                            })}

                            {/* Lignes des horaires */}
                            {horaires.map((heure) => (
                                <div key={`horaire-row-${heure}`} className="contents">
                                    <div className="bg-cyan-50 text-cyan-700 font-medium text-center py-4 border-r border-b border-cyan-800">
                                        {heure}h
                                    </div>
                                    {joursSemaineVue.map((date, index) => {
                                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                        const isPast = isSlotPast(dateStr, heure);
                                        const isReserved = isSlotReserved(dateStr, heure);
                                        const slotReservations = getReservationsForSlot(dateStr, heure);
                                        const isMyReservation = slotReservations.some(res => {
                                            console.log('Comparaison semaine:', { res_users_id: res.users_id, user_id: user?.id, match: Number(res.users_id) === Number(user?.id) });
                                            return Number(res.users_id) === Number(user?.id);
                                        });

                                        // Déterminer la classe CSS selon l'état
                                        let bgClass = 'bg-white hover:bg-cyan-50 cursor-pointer';
                                        if (isReserved) {
                                            bgClass = isMyReservation ? 'bg-amber-200 cursor-pointer hover:bg-amber-300' : 'bg-red-300 cursor-pointer hover:bg-red-400';
                                        } else if (isPast) {
                                            bgClass = 'bg-gray-200 cursor-not-allowed';
                                        }

                                        return (
                                            <div
                                                key={`cell-${heure}-${index}`}
                                                className={`${bgClass} border-r border-b border-cyan-800 h-16 transition-colors relative group`}
                                                onClick={(e) => {
                                                    if (isReserved && slotReservations.length > 0) {
                                                        openDetailsModal(slotReservations[0], e);
                                                    } else if (!isPast && !isReserved) {
                                                        openModal(dateStr, heure);
                                                    }
                                                }}
                                            >
                                                {isReserved && slotReservations.length > 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center p-1 pointer-events-none">
                                                        <span className="text-xs font-bold text-cyan-900 text-center truncate px-1">
                                                            {slotReservations[0].titre}
                                                        </span>
                                                    </div>
                                                )}
                                                {isReserved && (
                                                    <div className="hidden group-hover:block absolute z-10 bg-cyan-700 text-white p-2 rounded shadow-lg text-xs whitespace-nowrap pointer-events-none">
                                                        {slotReservations.map(res => (
                                                            <div key={res.id}>
                                                                <div>{res.titre}</div>
                                                                {res.user_name && <div className="text-cyan-200">👤 {capitalizeWords(res.user_name)}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Obtenir les réservations pour un jour spécifique
    const getReservationsForDay = (dateStr) => {
        return reservations.filter(reservation => {
            const debut = new Date(reservation.debut);
            const dateJour = new Date(dateStr + "T00:00:00");
            const dateJourFin = new Date(dateStr + "T23:59:59");

            return debut >= dateJour && debut <= dateJourFin;
        }).sort((a, b) => new Date(a.debut) - new Date(b.debut));
    };

    // Rendu de la vue mois (améliorée avec affichage des réservations)
    const renderVueMois = () => {
        return (
            <div id="calendrier" className="bg-white rounded-lg shadow-xl/30 overflow-hidden text-cyan-600 mb-8">
                <div className="grid grid-cols-7 border-l border-t border-cyan-800 ">
                    {/* En-têtes des jours */}
                    {joursSemaine.map((jour, index) => (
                        <div
                            key={`semaine-${index}`}
                            className="bg-cyan-400 text-white font-semibold text-center py-3 border-r border-b border-cyan-800"
                        >
                            {jour}
                        </div>
                    ))}

                    {/* Cellules des jours */}
                    {jours.map((item) => {
                        if (item.type === 'autre-mois') {
                            return (
                                <div
                                    key={item.key}
                                    className="min-h-28 p-2 border-r border-b border-cyan-800 bg-cyan-100 text-cyan-600"
                                >
                                    <span className="text-sm">{item.numero}</span>
                                </div>
                            );
                        }

                        // Obtenir les réservations du jour
                        const reservationsJour = getReservationsForDay(item.date);
                        const maxDisplayed = 3; // Nombre max d'événements affichés
                        const hasMore = reservationsJour.length > maxDisplayed;

                        const cellClass = item.estPasse
                            ? "min-h-28 p-2 border-r border-b border-cyan-800 bg-cyan-100 text-cyan-600 cursor-not-allowed"
                            : "min-h-28 p-2 border-r border-b border-cyan-800 bg-white hover:bg-cyan-50 cursor-pointer transition-colors";

                        return (
                            <div
                                key={item.key}
                                className={cellClass}
                                onClick={() => !item.estPasse && openTimeSelectionModal(item.date)}
                            >
                                <div className="font-semibold text-sm mb-1">{item.numero}</div>

                                {/* Liste des réservations */}
                                <div className="space-y-1">
                                    {reservationsJour.slice(0, maxDisplayed).map((reservation) => {
                                        // Déterminer la couleur selon le propriétaire
                                        const isMyReservation = Number(reservation.users_id) === Number(user?.id);
                                        const colorClass = isMyReservation
                                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                            : 'bg-red-200 text-red-800 border-red-300 hover:bg-red-300';

                                        return (
                                            <div
                                                key={reservation.id}
                                                className={`text-xs px-2 py-1 rounded border ${colorClass} truncate cursor-pointer transition-colors`}
                                                onClick={(e) => openDetailsModal(reservation, e)}
                                            >
                                                <div className="font-semibold truncate">{reservation.titre}</div>
                                            </div>
                                        );
                                    })}

                                    {/* Indicateur "+ X plus" */}
                                    {hasMore && (
                                        <div className="text-xs text-cyan-600 font-semibold pl-2">
                                            + {reservationsJour.length - maxDisplayed} plus...
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Rendu de la vue année
    const renderVueAnnee = () => {
        const moisAnnee = Array.from({ length: 12 }, (_, i) => i);

        return (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {moisAnnee.map((moisIndex) => {
                    const nbJoursMois = new Date(annee, moisIndex + 1, 0).getDate();
                    const premierJourMois = new Date(annee, moisIndex, 1).getDay();
                    const decalageMois = premierJourMois === 0 ? 6 : premierJourMois - 1;

                    return (
                        <div
                            key={`mois-${moisIndex}`}
                            className="bg-white rounded-lg shadow-md p-3 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => {
                                setMois(moisIndex);
                                setVue('mois');
                            }}
                        >
                            <h3 className="text-center font-semibold text-cyan-600 mb-2">
                                {moisNoms[moisIndex]}
                            </h3>
                            <div className="grid grid-cols-7 gap-1 text-xs">
                                {joursSemaineAbr.map((jour, index) => (
                                    <div key={`jour-${index}`} className="text-center text-cyan-500 font-medium">
                                        {jour.charAt(0)}
                                    </div>
                                ))}
                                {Array.from({ length: decalageMois }).map((_, i) => (
                                    <div key={`empty-${i}`} className="text-center"></div>
                                ))}
                                {Array.from({ length: nbJoursMois }, (_, i) => i + 1).map((jourNum) => {
                                    const dateActuelle = new Date(annee, moisIndex, jourNum);
                                    const estAujourdHui =
                                        jourNum === aujourdHui.getDate() &&
                                        moisIndex === aujourdHui.getMonth() &&
                                        annee === aujourdHui.getFullYear();
                                    const estPasse = dateActuelle < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());

                                    return (
                                        <div
                                            key={`jour-${jourNum}`}
                                            className={`text-center p-1 rounded ${estAujourdHui
                                                ? 'bg-cyan-500 text-white font-bold'
                                                : estPasse
                                                    ? 'text-cyan-300'
                                                    : 'text-cyan-600'
                                                }`}
                                        >
                                            {jourNum}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div id="calendrier-container" className="w-full flex flex-col items-center justify-center px-4 py-8">
            <div className={`w-full ${vue === 'annee' ? 'max-w-6xl' : 'max-w-4xl'}`}>
                {/* Sélecteur de vue */}
                <div className="flex justify-center gap-2 mb-6">
                    <button
                        onClick={() => setVue('jour')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${vue === 'jour'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-cyan-600 border-2 border-cyan-500 hover:bg-cyan-50'
                            }`}
                    >
                        Jour
                    </button>
                    <button
                        onClick={() => setVue('semaine')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${vue === 'semaine'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-cyan-600 border-2 border-cyan-500 hover:bg-cyan-50'
                            }`}
                    >
                        Semaine
                    </button>
                    <button
                        onClick={() => setVue('mois')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${vue === 'mois'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-cyan-600 border-2 border-cyan-500 hover:bg-cyan-50'
                            }`}
                    >
                        Mois
                    </button>
                    <button
                        onClick={() => setVue('annee')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${vue === 'annee'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-cyan-600 border-2 border-cyan-500 hover:bg-cyan-50'
                            }`}
                    >
                        Année
                    </button>
                </div>

                {/* Navigation et titre */}
                <div className="flex items-center justify-between py-6">
                    <button
                        onClick={precedent}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md cursor-pointer"
                    >
                        Précédent
                    </button>
                    <h2 className="text-3xl font-bold text-cyan-600 text-shadow-lg tracking-widest text-center">
                        {getTitre().toUpperCase()}
                    </h2>
                    <button
                        onClick={suivant}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md cursor-pointer"
                    >
                        Suivant
                    </button>
                </div>

                {/* Affichage de la vue sélectionnée */}
                {vue === 'jour' && renderVueJour()}
                {vue === 'semaine' && renderVueSemaine()}
                {vue === 'mois' && renderVueMois()}
                {vue === 'annee' && renderVueAnnee()}
            </div>

            {/* Modal de réservation */}
            {showModal && (
                <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border-4 border-solid border-cyan-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-cyan-600">
                                {isEditing ? '✏️ Modifier la réservation' : '📅 Nouvelle Réservation'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {selectedSlot && (
                            <div className="mb-4 p-3 bg-cyan-50 rounded">
                                <p className="text-sm text-cyan-700">
                                    <strong>Date :</strong> {new Date(selectedSlot.dateDebut).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-sm text-cyan-700">
                                    <strong>Heure de début :</strong> {selectedSlot.heure}h00
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateReservation}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Objet de la réservation *
                                </label>
                                <input
                                    type="text"
                                    name="titre"
                                    value={formData.titre}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
                                    placeholder="Ex: Réunion d'équipe"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Durée (heures) *
                                </label>
                                <select
                                    name="duree"
                                    value={formData.duree}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
                                    required
                                >
                                    {(() => {
                                        // Calculer la durée maximale selon l'heure de début (fin à 19h)
                                        const heureDebut = selectedSlot.heure;
                                        const heureFin = 19; // Les réservations s'arrêtent à 19h
                                        const dureeMax = heureFin - heureDebut;
                                        const heuresDisponibles = Array.from({ length: dureeMax }, (_, i) => i + 1);

                                        return heuresDisponibles.map(h => (
                                            <option key={h} value={h}>{h} heure{h > 1 ? 's' : ''}</option>
                                        ));
                                    })()}
                                </select>
                                {selectedSlot.heure >= 18 && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        ⚠️ Réservation limitée car les réservations se terminent à 19h
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold cursor-pointer"
                                    disabled={loading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading ? 'Sauvegarde...' : (isEditing ? '💾 Enregistrer' : '✅ Confirmer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de sélection d'horaire (vue mois) */}
            {showTimeModal && selectedDate && (
                <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border-3 border-solid border-cyan-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-cyan-600">Sélectionner un horaire</h3>
                            <button
                                onClick={closeTimeModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-cyan-50 rounded">
                            <p className="text-sm text-cyan-700">
                                <strong>Date :</strong> {new Date(selectedDate).toLocaleDateString('fr-FR')}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {Array.from({ length: 11 }, (_, i) => i + 8).map((heure) => {
                                const isReserved = isSlotReserved(selectedDate, heure);
                                const isPast = isSlotPast(selectedDate, heure);
                                const slotReservations = getReservationsForSlot(selectedDate, heure);
                                const isMyReservation = slotReservations.some(res => {
                                    console.log('Comparaison modale:', { res_users_id: res.users_id, user_id: user?.id, match: Number(res.users_id) === Number(user?.id) });
                                    return Number(res.users_id) === Number(user?.id);
                                });

                                let buttonClass = 'bg-white hover:bg-cyan-50 cursor-pointer';
                                if (isReserved) {
                                    buttonClass = isMyReservation ? 'bg-amber-200 cursor-not-allowed opacity-60' : 'bg-red-300 cursor-not-allowed opacity-60';
                                } else if (isPast) {
                                    buttonClass = 'bg-gray-200 cursor-not-allowed opacity-60';
                                }

                                return (
                                    <button
                                        key={`time-${heure}`}
                                        onClick={() => !isReserved && !isPast && selectTimeSlot(heure)}
                                        disabled={isReserved || isPast}
                                        className={`w-full p-4 border border-cyan-200 rounded text-left transition-colors ${buttonClass}`}
                                    >
                                        <span className="font-semibold text-cyan-700">
                                            {heure}h00 - {heure + 1}h00
                                        </span>
                                        {isReserved && slotReservations.map(res => (
                                            <div key={res.id} className="mt-2 text-sm text-cyan-900 font-medium">
                                                🔒 {res.titre}
                                                {res.user_name && <div className="text-xs text-cyan-700">👤 {capitalizeWords(res.user_name)}</div>}
                                            </div>
                                        ))}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={closeTimeModal}
                                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de détails de réservation */}
            {showDetailsModal && selectedReservation && (
                <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border-4 border-solid border-cyan-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-cyan-600">Détails de la réservation</h3>
                            <button
                                onClick={closeDetailsModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:scale-110 transition-transform cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Titre */}
                            <div className="p-3 bg-cyan-50 rounded">
                                <p className="text-sm text-cyan-600 font-semibold mb-1">Titre</p>
                                <p className="text-base text-cyan-900 font-bold">{selectedReservation.titre}</p>
                            </div>

                            {/* Date et heure */}
                            <div className="p-3 bg-cyan-50 rounded">
                                <p className="text-sm text-cyan-600 font-semibold mb-1">Date et heure</p>
                                <div className="text-base text-cyan-900">
                                    <p>
                                        <strong>Début :</strong>{' '}
                                        {new Date(selectedReservation.debut).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {' à '}
                                        {new Date(selectedReservation.debut).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p>
                                        <strong>Fin :</strong>{' '}
                                        {new Date(selectedReservation.fin).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {' à '}
                                        {new Date(selectedReservation.fin).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Réservé par */}
                            {selectedReservation.user_name && (
                                <div className="p-3 bg-cyan-50 rounded">
                                    <p className="text-sm text-cyan-600 font-semibold mb-1">Réservé par</p>
                                    <p className="text-base text-cyan-900">
                                        👤 {capitalizeWords(selectedReservation.user_name)}
                                    </p>
                                </div>
                            )}

                            {/* Description si disponible */}
                            {selectedReservation.description && (
                                <div className="p-3 bg-cyan-50 rounded">
                                    <p className="text-sm text-cyan-600 font-semibold mb-1">Description</p>
                                    <p className="text-base text-cyan-900">{selectedReservation.description}</p>
                                </div>
                            )}

                            {/* Badge propriétaire */}
                            {Number(selectedReservation.users_id) === Number(user?.id) && (
                                <div className="flex items-center justify-center p-2 bg-amber-100 text-amber-800 rounded-lg border border-amber-300">
                                    <span className="font-semibold">✓ Votre réservation</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex gap-3">
                            {/* Afficher les boutons Modifier et Supprimer uniquement pour ses propres réservations */}
                            {Number(selectedReservation.users_id) === Number(user?.id) && (
                                <>
                                    <button
                                        onClick={(e) => openEditModal(selectedReservation, e)}
                                        className="flex-1 px-4 py-2 bg-orange-300 text-white rounded-lg hover:bg-amber-600 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        ✏️ Modifier
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteReservation(selectedReservation, e)}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
                                        disabled={loading}
                                    >
                                        🗑️ Supprimer
                                    </button>
                                </>
                            )}
                            <button
                                onClick={closeDetailsModal}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold cursor-pointer"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}