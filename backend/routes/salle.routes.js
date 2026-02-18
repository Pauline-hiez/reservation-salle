import express from 'express';
import { salleController } from '../controllers/salle.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import upload from '../config/upload.js';

const router = express.Router();

// Routes publiques (accessible à tous sans authentification)
router.get('/', salleController.getAll);
router.get('/:id', salleController.getById);

// Routes admin uniquement
router.post('/upload', authMiddleware, adminMiddleware, upload.single('image'), salleController.uploadImage);
router.post('/', authMiddleware, adminMiddleware, salleController.create);
router.put('/:id', authMiddleware, adminMiddleware, salleController.update);
router.delete('/:id', authMiddleware, adminMiddleware, salleController.delete);

export default router;
