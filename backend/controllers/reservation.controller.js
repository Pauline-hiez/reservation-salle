import Reservation from '../models/reservation.model.js';

export const reservationController = {
    // Créer une réservation
    async create(req, res) {
        try {
            const { titre, description, debut, fin } = req.body;
            const users_id = req.userId; // vient du middleware auth

            // Validation des données
            if (!titre || !debut || !fin) {
                return res.status(400).json({ error: 'Titre, date de début et de fin sont requis' });
            }

            // Vérifier que la date de début est avant la date de fin
            const dateDebut = new Date(debut);
            const dateFin = new Date(fin);

            if (dateDebut >= dateFin) {
                return res.status(400).json({ error: 'La date de début doit être avant la date de fin' });
            }

            // Vérifier que la réservation est au minimum d'1 heure
            const dureeHeures = (dateFin - dateDebut) / (1000 * 60 * 60);
            if (dureeHeures < 1) {
                return res.status(400).json({ error: 'La durée minimale de réservation est d\'1 heure' });
            }

            // Vérifier que la réservation est dans le futur
            if (dateDebut < new Date()) {
                return res.status(400).json({ error: 'Impossible de réserver dans le passé' });
            }

            const reservation = await Reservation.create({
                titre,
                description: description || '',
                debut,
                fin,
                users_id
            });

            res.status(201).json({
                message: 'Réservation créée avec succès',
                reservation
            });
        } catch (error) {
            console.error('Erreur création réservation:', error);
            res.status(400).json({ error: error.message || 'Erreur lors de la création de la réservation' });
        }
    },

    // Récupérer toutes les réservations
    async getAll(req, res) {
        try {
            const reservations = await Reservation.findAll();
            res.json(reservations);
        } catch (error) {
            console.error('Erreur récupération réservations:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
        }
    },

    // Récupérer les réservations par période
    async getByPeriod(req, res) {
        try {
            const { start, end } = req.query;

            if (!start || !end) {
                return res.status(400).json({ error: 'Les paramètres start et end sont requis' });
            }

            const reservations = await Reservation.findByPeriod(start, end);
            res.json(reservations);
        } catch (error) {
            console.error('Erreur récupération réservations par période:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
        }
    },

    // Récupérer une réservation par ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const reservation = await Reservation.findById(id);

            if (!reservation) {
                return res.status(404).json({ error: 'Réservation non trouvée' });
            }

            res.json(reservation);
        } catch (error) {
            console.error('Erreur récupération réservation:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de la réservation' });
        }
    },

    // Récupérer les réservations de l'utilisateur connecté
    async getMyReservations(req, res) {
        try {
            const userId = req.userId;
            const reservations = await Reservation.findByUserId(userId);
            res.json(reservations);
        } catch (error) {
            console.error('Erreur récupération mes réservations:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de vos réservations' });
        }
    },

    // Mettre à jour une réservation
    async update(req, res) {
        try {
            const { id } = req.params;
            const { titre, description, debut, fin } = req.body;
            const users_id = req.userId;

            // Validation des données
            if (!titre || !debut || !fin) {
                return res.status(400).json({ error: 'Titre, date de début et de fin sont requis' });
            }

            // Vérifier que la date de début est avant la date de fin
            const dateDebut = new Date(debut);
            const dateFin = new Date(fin);

            if (dateDebut >= dateFin) {
                return res.status(400).json({ error: 'La date de début doit être avant la date de fin' });
            }

            // Vérifier que la réservation est au minimum d'1 heure
            const dureeHeures = (dateFin - dateDebut) / (1000 * 60 * 60);
            if (dureeHeures < 1) {
                return res.status(400).json({ error: 'La durée minimale de réservation est d\'1 heure' });
            }

            const reservation = await Reservation.update(id, {
                titre,
                description: description || '',
                debut,
                fin,
                users_id
            });

            res.json({
                message: 'Réservation mise à jour avec succès',
                reservation
            });
        } catch (error) {
            console.error('Erreur modification réservation:', error);
            res.status(400).json({ error: error.message || 'Erreur lors de la modification de la réservation' });
        }
    },

    // Supprimer une réservation
    async delete(req, res) {
        try {
            const { id } = req.params;
            const users_id = req.userId;

            await Reservation.delete(id, users_id);
            res.json({ message: 'Réservation supprimée avec succès' });
        } catch (error) {
            console.error('Erreur suppression réservation:', error);
            res.status(400).json({ error: error.message || 'Erreur lors de la suppression de la réservation' });
        }
    },

    // Vérifier la disponibilité
    async checkAvailability(req, res) {
        try {
            const { debut, fin, excludeId } = req.query;

            if (!debut || !fin) {
                return res.status(400).json({ error: 'Les paramètres debut et fin sont requis' });
            }

            const available = await Reservation.checkAvailability(debut, fin, excludeId);
            res.json({ available });
        } catch (error) {
            console.error('Erreur vérification disponibilité:', error);
            res.status(500).json({ error: 'Erreur lors de la vérification de disponibilité' });
        }
    }
};
