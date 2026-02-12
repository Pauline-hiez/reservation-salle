import express from 'express';
import { reservationController } from '../controllers/reservation.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// POST /api/reservations - Créer une réservation
router.post('/', reservationController.create);

// GET /api/reservations - Récupérer toutes les réservations
router.get('/', reservationController.getAll);

// GET /api/reservations/period?start=...&end=... - Récupérer les réservations par période
router.get('/period', reservationController.getByPeriod);

// GET /api/reservations/my - Récupérer les réservations de l'utilisateur connecté
router.get('/my', reservationController.getMyReservations);

// GET /api/reservations/availability?debut=...&fin=... - Vérifier la disponibilité
router.get('/availability', reservationController.checkAvailability);

// GET /api/reservations/:id - Récupérer une réservation par ID
router.get('/:id', reservationController.getById);

// PUT /api/reservations/:id - Mettre à jour une réservation
router.put('/:id', reservationController.update);

// DELETE /api/reservations/:id - Supprimer une réservation
router.delete('/:id', reservationController.delete);

export default router;
